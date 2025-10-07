import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Mail, Calendar, Shield, LogOut, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      {/* Particle Animation */}
      <div className="particles-container">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${Math.random() * 8 + 15}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="p-6 border-b border-white/10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white gradient-text">
                SecureAuth Dashboard
              </h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user?.full_name}
              </p>
            </div>
            <Button
              onClick={logout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <Card className="glass border-white/10 fade-in">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Authentication Successful!</h2>
                      <p className="text-gray-300">
                        You have successfully logged into your secure account.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="glass border-white/10 hover:scale-105 transition-all duration-300 slide-up" data-testid="user-info-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Full Name:</span>
                    <span className="text-white font-medium" data-testid="user-fullname">{user?.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Email:</span>
                    <span className="text-white font-medium" data-testid="user-email">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">User ID:</span>
                    <span className="text-white font-mono text-sm" data-testid="user-id">{user?.id}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10 hover:scale-105 transition-all duration-300 slide-up" style={{animationDelay: '100ms'}} data-testid="account-status-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Shield className="w-5 h-5 mr-2 text-green-400" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Verification Status:</span>
                    <Badge 
                      className="bg-green-500/20 text-green-400 border-green-500/30"
                      data-testid="verification-status"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Account Created:</span>
                    <span className="text-white text-sm" data-testid="created-date">
                      {user?.created_at && formatDate(user.created_at)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Security Level:</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      High
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security Features */}
            <Card className="glass border-white/10 scale-in" data-testid="security-features-card">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Shield className="w-5 h-5 mr-2 text-purple-400" />
                  Security Features Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">JWT Authentication</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">Email Verification</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">Password Encryption</span>
                  </div>
                  <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm">Rate Limiting</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-8 text-center">
              <div className="space-x-4">
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow"
                  data-testid="refresh-btn"
                >
                  Refresh Dashboard
                </Button>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                  data-testid="logout-action-btn"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 mt-12">
          <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2024 SecureAuth Dashboard. Your security is our priority.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
