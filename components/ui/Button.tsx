import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { ButtonHTMLAttributes, FC } from "react";

const buttonVariation = cva(
  "rounded text-neutral-200 bg-neutral-600 p-1 transition-all hover:bg-neutral-700 duration-100",
  {
    variants: {
      variant: {
        default: "",
        bodered: "bg-transparent border border-neutral-600",
        ghost: "bg-transparent",
      },

      size: {
        default: "px-2",
        sm: "",
        lg: "px-5 py-3 min-h-16 min-w-48",
        full: "w-full h-10",
      },

      importance: {
        standard: "",
        highlight: "",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
      importance: "standard",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariation> {}

export const Button: FC<ButtonProps> = ({
  className,
  children,
  variant,
  size,
  importance,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariation({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
};
