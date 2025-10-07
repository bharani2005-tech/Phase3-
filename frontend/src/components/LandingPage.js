import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Shield, Lock, Mail, UserCheck, Clock, RefreshCw } from 'lucide-react';

const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Authentication",
      description: "Military-grade encryption with JWT tokens and bcrypt password hashing"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Verification",
      description: "6-digit OTP verification sent directly to your email for enhanced security"
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "User Management",
      description: "Complete user lifecycle management with role-based access control"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Password Security",
      description: "Secure password reset with OTP verification and rate limiting"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Session Management",
      description: "Secure session handling with automatic token expiration"
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Rate Limiting",
      description: "Built-in protection against spam and brute force attacks"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Particle Animation */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center p-6 md:p-8">
          <div className="text-2xl font-bold text-white gradient-text">
            SecureAuth
          </div>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="nav-login-btn">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200" data-testid="nav-register-btn">
                Sign Up
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-12 md:py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-shadow fade-in text-responsive-xl">
              Secure Authentication
              <br />
              <span className="gradient-text">Made Simple</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl mx-auto slide-up">
              Enterprise-grade authentication system with email verification, secure password reset,
              and advanced security features. Built for modern applications.
            </p>
            <div className="space-x-4 scale-in">
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 px-8 py-4 text-lg btn-glow"
                  data-testid="get-started-btn"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-300 px-8 py-4 text-lg"
                  data-testid="sign-in-btn"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="glass p-6 hover:scale-105 transition-all duration-300 border-white/10 hover:border-white/20 fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`feature-card-${index}`}
              >
                <div className="text-blue-400 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Demo Section */}
          <div className="text-center">
            <Card className="glass p-8 max-w-2xl mx-auto border-white/10">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience Security?</h2>
              <p className="text-gray-300 mb-6">
                Join thousands of developers who trust our authentication system for their applications.
                Get started in less than 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                    data-testid="demo-register-btn"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-300 w-full sm:w-auto"
                    data-testid="demo-login-btn"
                  >
                    Try Demo
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 mt-20">
          <div className="container mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2024 SecureAuth. Built with FastAPI, React & MongoDB.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
