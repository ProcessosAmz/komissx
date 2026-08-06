import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  register?: ReturnType<
    typeof import("react-hook-form").useForm
  >["register"] extends (name: string) => infer R
  ? R
  : never;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      type = "text",
      placeholder,
      error,
      register,
      disabled,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === "password";

    return (
      <div className="field">
        <label htmlFor={id}>{label}</label>

        <div className={`input-wrapper ${error ? "has-error" : ""}`}>

      <input
            id={id}
            ref={ref}
            type={
              isPassword
                ? showPassword
                  ? "text"
                  : "password"
                : type
            }
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            {...(register ?? {})}
            {...rest}
          />

          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          )}
        </div>

        {error && (
          <p id={`${id}-error`} className="field-error">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";