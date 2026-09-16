import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordField = ({ label, value, onChange, required }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      <label className="block text-sm font-bold mb-1 text-text-main">
        {label}
      </label>
      <div className="relative mt-2">
        <Lock className="absolute left-4 top-3.5 text-text-muted" size={18} />
        <input
          type={showPassword ? 'text' : 'password'}
          className="w-full border border-border-subtle rounded-md p-3 pl-11 pr-10 outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary focus:outline-none"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;