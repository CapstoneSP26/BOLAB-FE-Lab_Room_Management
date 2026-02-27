import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = {
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-3 text-sm",
  md: "px-5 py-3.5 text-sm",
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline:
    "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
};

function joinClasses(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function Button({
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  className,
  disabled,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const computedClassName = joinClasses(
    "inline-flex items-center justify-center font-medium gap-2 rounded-lg transition",
    sizeClasses[size],
    variantClasses[variant],
    className,
    disabled && "cursor-not-allowed opacity-50",
  );

  return (
    <button
      type={type}
      disabled={disabled}
      className={computedClassName}
      {...rest}
    >
      {startIcon ? (
        <span className="flex items-center">{startIcon}</span>
      ) : null}
      {children}
      {endIcon ? <span className="flex items-center">{endIcon}</span> : null}
    </button>
  );
}
