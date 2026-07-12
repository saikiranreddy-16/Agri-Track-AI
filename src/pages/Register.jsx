import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../constants';

export const Register = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(PATHS.LOGIN, { replace: true });
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default Register;
