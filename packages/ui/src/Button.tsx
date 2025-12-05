import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = ({ children, variant = "primary", ...rest }: ButtonProps) => {
  const base = "px-4 py-2 rounded-md text-sm font-medium";
  const style = variant === "primary" ? "bg-white text-black hover:bg-[#E0E0E0]" : "bg-transparent border border-[#2A2A2A] text-white hover:border-[#3A3A3A]";
  return (
    <button className={`${base} ${style} transition`} {...rest}>
      {children}
    </button>
  );
};
