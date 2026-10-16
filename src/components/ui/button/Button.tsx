import { cn } from "@/utils";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  type?: "button" | "submit" | "reset";
  title?: string;
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
}

const Button: React.FC<ButtonProps> = ({
  children,
  type,
  title,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400 disabled:bg-brand-300 dark:disabled:bg-brand-800",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3 dark:hover:text-gray-300",
  };

  return (
    <button
      type={type ?? (onClick ? "button" : "submit")}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 active:scale-95 disabled:pointer-events-none",
        sizeClasses[size],
        variantClasses[variant],
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && (
        <span className="inline-flex shrink-0 items-center justify-center leading-none">
          {startIcon}
        </span>
      )}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
