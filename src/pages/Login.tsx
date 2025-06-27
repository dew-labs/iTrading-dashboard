import React from 'react'
import AuthForm from '../components/AuthForm'

const Login: React.FC = () => {
  return (
    <AuthForm
      mode='login'
      onToggleMode={() => {}} // No-op since we're removing signup
    />
  )
}

export default Login
