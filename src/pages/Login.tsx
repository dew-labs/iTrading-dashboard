import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  return (
    <AuthForm 
      mode={mode} 
      onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')} 
    />
  );
};

export default Login;