import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampusLink } from '../context/CampusLinkContext';
import { NeuralAccessLogin } from '../components/ui/neural-access-login';
import { toast } from 'sonner';

export const AuthPage: React.FC<{ mode?: 'login' | 'signup' }> = ({ mode = 'login' }) => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useCampusLink();
  const [isLogin, setIsLogin] = useState(mode === 'login');

  const handleSubmit = (data: {
    email: string;
    password?: string;
    name?: string;
    committeeName?: string;
    handle?: string;
  }) => {
    if (isLogin) {
      const res = login(data.email, data.password);
      if (!res.success) {
        if (res.error === 'ACCOUNT_NOT_FOUND') {
          toast.error('Account not found! Please register your committee first.');
          setIsLogin(false); // Switch to Sign Up tab automatically
        } else if (res.error === 'INVALID_PASSWORD') {
          toast.error('Incorrect password. Please try again.');
        } else {
          toast.error('Login failed. Please check your credentials.');
        }
        return;
      }
      toast.success('Welcome back to your workspace!');
      navigate('/dashboard');
    } else {
      const res = signup(
        data.name || 'Organizer',
        data.email || 'organizer@campus.edu',
        data.committeeName || 'Student Organization',
        data.handle || 'my-org',
        data.password
      );
      if (!res.success) {
        if (res.error === 'EMAIL_ALREADY_EXISTS') {
          toast.error('An account with this email already exists. Please log in.');
          setIsLogin(true); // Switch to Login tab
        } else {
          toast.error('Failed to create account.');
        }
        return;
      }
      toast.success('Account created! Welcome to your new workspace.');
      navigate('/dashboard');
    }
  };

  const handleGoogleAuth = async () => {
    await loginWithGoogle();
    navigate('/dashboard');
  };

  return (
    <NeuralAccessLogin
      isLogin={isLogin}
      onToggleMode={() => setIsLogin(!isLogin)}
      onSubmit={handleSubmit}
      onGoogleSubmit={handleGoogleAuth}
    />
  );
};
