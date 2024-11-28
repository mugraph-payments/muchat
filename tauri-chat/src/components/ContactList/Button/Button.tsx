import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={`${className} bg-slate-700 p-2 rounded hover:bg-slate-500`}
        ref={ref}
        {...props}
      />
    );
  },
);

export default Button;
