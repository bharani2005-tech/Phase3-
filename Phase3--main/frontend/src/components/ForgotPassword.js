import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Mail, ArrowLeft, Loader2, Lock } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (error) {
      // Error handling is done in auth context
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Login */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors duration-200 group"
          data-testid="back-to-login-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Login
        </Link>

        <Card className="glass border-white/10 shadow-2xl scale-in">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              {sent ? 'Reset Code Sent' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {sent 
                ? 'Check your email for the password reset code'
                : 'Enter your email address to receive a password reset code'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-orange-500 transition-all duration-200 input-focus"
                      data-testid="email-input"
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm" data-testid="email-error">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow"
                  disabled={loading}
                  data-testid="send-reset-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Reset Code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">
                    If an account with <strong>{email}</strong> exists, 
                    you will receive a password reset code shortly.
                  </p>
                </div>
                
                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow"
                  data-testid="continue-reset-btn"
                >
                  Continue to Reset Password
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setSent(false)}
                  className="w-full border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                  data-testid="send-again-btn"
                >
                  Send to Different Email
                </Button>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-gray-300">
                Remember your password?{' '}
                <Link 
                  to="/login" 
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
                  data-testid="login-link"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
