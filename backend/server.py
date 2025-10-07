from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import secrets
import random
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
OTP_EXPIRE_MINUTES = 10

# Create the main app without a prefix
app = FastAPI(title="Auth System API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Password hashing utilities
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT utilities
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# OTP utilities
def generate_otp() -> str:
    return f"{random.randint(100000, 999999)}"

# Email service
def send_otp_email(to_email: str, otp: str, purpose: str) -> bool:
    try:
        sendgrid_api_key = os.environ.get('SENDGRID_API_KEY')
        sender_email = os.environ.get('SENDER_EMAIL', 'noreply@example.com')
        
        if not sendgrid_api_key:
            print(f"Simulating OTP email to {to_email}: {otp} for {purpose}")
            return True
            
        subject = f"Your {purpose} OTP"
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center;">
                    <h1 style="margin: 0 0 20px 0;">Verification Code</h1>
                    <p style="margin: 0 0 30px 0; font-size: 16px;">Your {purpose} verification code is:</p>
                    <div style="background: rgba(255,255,255,0.2); padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px;">{otp}</span>
                    </div>
                    <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.9;">This code will expire in {OTP_EXPIRE_MINUTES} minutes.</p>
                </div>
                <div style="text-align: center; margin-top: 30px; color: #666;">
                    <p style="font-size: 14px;">If you didn't request this code, please ignore this email.</p>
                </div>
            </body>
        </html>
        """
        
        message = Mail(
            from_email=sender_email,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)
        return response.status_code == 202
        
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        print(f"Simulating OTP email to {to_email}: {otp} for {purpose}")
        return True

# Pydantic Models
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    is_verified: bool
    created_at: datetime

class OTPVerify(BaseModel):
    email: EmailStr
    otp: str

class OTPResend(BaseModel):
    email: EmailStr

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=6)

class AuthResponse(BaseModel):
    message: str
    access_token: Optional[str] = None
    user: Optional[UserResponse] = None

# Database Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    password_hash: str
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OTPRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: str
    otp: str
    otp_type: str  # "verification" or "reset"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES))
    is_used: bool = False

# Rate limiting storage (in-memory for simplicity)
rate_limit_storage = {}

def check_rate_limit(email: str, limit: int = 5, window_minutes: int = 15) -> bool:
    """Check if email has exceeded rate limit for OTP requests"""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=window_minutes)
    
    if email not in rate_limit_storage:
        rate_limit_storage[email] = []
    
    # Clean old attempts
    rate_limit_storage[email] = [
        attempt_time for attempt_time in rate_limit_storage[email] 
        if attempt_time > window_start
    ]
    
    if len(rate_limit_storage[email]) >= limit:
        return False
    
    rate_limit_storage[email].append(now)
    return True

# API Routes
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate, background_tasks: BackgroundTasks):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check rate limit
    if not check_rate_limit(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again later."
        )
    
    # Create user
    user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    
    await db.users.insert_one(user.dict())
    
    # Generate and store OTP
    otp = generate_otp()
    otp_record = OTPRecord(
        user_id=user.id,
        email=user.email,
        otp=otp,
        otp_type="verification"
    )
    
    await db.otps.insert_one(otp_record.dict())
    
    # Send OTP email in background
    background_tasks.add_task(send_otp_email, user.email, otp, "email verification")
    
    return AuthResponse(
        message="Registration successful. Please check your email for verification code."
    )

@api_router.post("/auth/verify-otp", response_model=AuthResponse)
async def verify_otp(otp_data: OTPVerify):
    # Find valid OTP
    otp_record = await db.otps.find_one({
        "email": otp_data.email,
        "otp": otp_data.otp,
        "is_used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Mark OTP as used
    await db.otps.update_one(
        {"id": otp_record["id"]},
        {"$set": {"is_used": True}}
    )
    
    # Mark user as verified
    await db.users.update_one(
        {"id": otp_record["user_id"]},
        {"$set": {"is_verified": True}}
    )
    
    return AuthResponse(message="Email verified successfully. You can now login.")

@api_router.post("/auth/resend-otp", response_model=AuthResponse)
async def resend_otp(otp_data: OTPResend, background_tasks: BackgroundTasks):
    # Check rate limit
    if not check_rate_limit(otp_data.email, limit=3, window_minutes=5):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please wait before requesting again."
        )
    
    # Find user
    user = await db.users.find_one({"email": otp_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Invalidate previous OTPs
    await db.otps.update_many(
        {"email": otp_data.email, "is_used": False},
        {"$set": {"is_used": True}}
    )
    
    # Generate new OTP
    otp = generate_otp()
    otp_record = OTPRecord(
        user_id=user["id"],
        email=user["email"],
        otp=otp,
        otp_type="verification"
    )
    
    await db.otps.insert_one(otp_record.dict())
    
    # Send OTP email in background
    background_tasks.add_task(send_otp_email, user["email"], otp, "email verification")
    
    return AuthResponse(message="New verification code sent to your email.")

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Check if email is verified
    if not user["is_verified"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in."
        )
    
    # Create access token
    token_data = {"sub": user["id"], "email": user["email"]}
    access_token = create_access_token(token_data)
    
    user_response = UserResponse(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        is_verified=user["is_verified"],
        created_at=user["created_at"]
    )
    
    return AuthResponse(
        message="Login successful",
        access_token=access_token,
        user=user_response
    )

@api_router.post("/auth/forgot-password", response_model=AuthResponse)
async def forgot_password(reset_data: PasswordResetRequest, background_tasks: BackgroundTasks):
    # Check rate limit
    if not check_rate_limit(reset_data.email, limit=3, window_minutes=15):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many password reset requests. Please wait before trying again."
        )
    
    # Find user
    user = await db.users.find_one({"email": reset_data.email})
    if not user:
        # Don't reveal if email exists or not for security
        return AuthResponse(message="If the email exists, a password reset code has been sent.")
    
    # Invalidate previous reset OTPs
    await db.otps.update_many(
        {"email": reset_data.email, "otp_type": "reset", "is_used": False},
        {"$set": {"is_used": True}}
    )
    
    # Generate reset OTP
    otp = generate_otp()
    otp_record = OTPRecord(
        user_id=user["id"],
        email=user["email"],
        otp=otp,
        otp_type="reset"
    )
    
    await db.otps.insert_one(otp_record.dict())
    
    # Send reset OTP email in background
    background_tasks.add_task(send_otp_email, user["email"], otp, "password reset")
    
    return AuthResponse(message="If the email exists, a password reset code has been sent.")

@api_router.post("/auth/reset-password", response_model=AuthResponse)
async def reset_password(reset_data: PasswordReset):
    # Find valid reset OTP
    otp_record = await db.otps.find_one({
        "email": reset_data.email,
        "otp": reset_data.otp,
        "otp_type": "reset",
        "is_used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code"
        )
    
    # Mark OTP as used
    await db.otps.update_one(
        {"id": otp_record["id"]},
        {"$set": {"is_used": True}}
    )
    
    # Update user password
    new_password_hash = hash_password(reset_data.new_password)
    await db.users.update_one(
        {"id": otp_record["user_id"]},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return AuthResponse(message="Password reset successfully. You can now login with your new password.")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user(token_data: dict = Depends(verify_token)):
    user = await db.users.find_one({"id": token_data["sub"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        full_name=user["full_name"],
        email=user["email"],
        is_verified=user["is_verified"],
        created_at=user["created_at"]
    )

@api_router.get("/")
async def root():
    return {"message": "Auth System API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
