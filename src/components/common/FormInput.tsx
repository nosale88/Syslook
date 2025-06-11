import React from 'react';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  className = '',
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
    />
  </div>
);

export default FormInput; 