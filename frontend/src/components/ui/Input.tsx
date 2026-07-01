import * as React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
}

export function Input({ label, error, register, id, type = 'text', ...props }: InputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...register}
        {...props}
        className={error ? 'input-error' : undefined}
      />
      {error && (
        <p className="field-error">{error}</p>
      )}
    </div>
  );
}
