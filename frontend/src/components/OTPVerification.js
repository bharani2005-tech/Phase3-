import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from './ui/input-otp';
import { ArrowLeft, Loader2, Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// 3D Animated Background Component
const AnimatedSphere = () => {
  const meshRef = useRef();
  
  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color={new THREE.Color('#667eea')}
        attach="material"
        distort={0.4}
        speed={2}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
};

const FloatingGeometry = ({ position }) => {
  const meshRef = useRef();
  
  useEffect(() => {
    if (meshRef.current) {
      const animate = () => {
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.001) * 0.3;
      };
      const interval = setInterval(animate, 16);
      return () => clearInterval(interval);
    }
  }, [position]);
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={new THREE.Color('#764ba2')} wireframe />
    </mesh>
  );
};

const Background3D = () => {
  return (
    <div className="absolute inset-0 opacity-30">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <AnimatedSphere />
          <FloatingGeometry position={[-3, 0, 0]} />
          <FloatingGeometry position={[3, 1, -2]} />
          <FloatingGeometry position={[0, -2, -1]} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
        </Suspense>
      </Canvas>
    </div>
  );
};

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verified, setVerified] = useState(false);
  const email = location.state?.email || '';

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    
    setLoading(true);
    try {
      await verifyOTP({ email, otp });
      setVerified(true);
      
      // Redirect to login after showing success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setOTP('');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    setCountdown(60);
    
    try {
      await resendOTP(email);
      setOTP('');
    } catch (error) {
      setCountdown(0);
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <Background3D />
        <Card className="glass border-white/10 shadow-2xl scale-in w-full max-w-md relative z-10">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <svg className="checkmark mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" fill="none" cx="26" cy="26" r="25"/>
                <path className="checkmark__check" fill="none" d="m14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-gray-300 mb-4">Your email has been successfully verified.</p>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 3D Animated Background */}
      <Background3D />
      
      {/* Particle Effects */}
      <div className="particles-container">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 8 + 12}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Register */}
        <Link 
          to="/register" 
          className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors duration-200 group"
          data-testid="back-to-register-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Register
        </Link>

        <Card className="glass border-white/10 shadow-2xl scale-in backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Verify Your Email</CardTitle>
            <CardDescription className="text-gray-300">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-medium text-white">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-white font-medium mb-4 block">Enter Verification Code</label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOTP}
                    disabled={loading}
                    data-testid="otp-input"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="otp-input" />
                      <InputOTPSlot index={1} className="otp-input" />
                      <InputOTPSlot index={2} className="otp-input" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="otp-input" />
                      <InputOTPSlot index={4} className="otp-input" />
                      <InputOTPSlot index={5} className="otp-input" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otp.length === 6 && (
                  <p className="text-green-400 text-sm mt-2" data-testid="otp-complete-msg">
                    Verifying code...
                  </p>
                )}
              </div>

              <Button
                onClick={handleVerifyOTP}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow"
                disabled={loading || otp.length !== 6}
                data-testid="verify-otp-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Email
                  </>
                )}
              </Button>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-400 text-sm">
                Didn't receive the code?
              </p>
              
              <Button
                variant="outline"
                onClick={handleResendOTP}
                disabled={resending || countdown > 0}
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                data-testid="resend-otp-btn"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend in {countdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Wrong email?{' '}
                  <Link 
                    to="/register" 
                    className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                    data-testid="change-email-link"
                  >
                    Change email address
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            The verification code expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
