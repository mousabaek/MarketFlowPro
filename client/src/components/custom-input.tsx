import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

// Create a custom input component that handles null values safely
export const CustomInput = forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input> & {
    value?: string | null | undefined;
  }
>(({ value, ...props }, ref) => {
  // Convert null/undefined to empty string to prevent React warnings
  const safeValue = value === null || value === undefined ? "" : value;
  
  return <Input ref={ref} value={safeValue} {...props} />;
});

CustomInput.displayName = "CustomInput";