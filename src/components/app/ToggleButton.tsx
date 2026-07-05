import type { ButtonHTMLAttributes } from "react";

type ToggleButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-checked" | "role"
> & {
  isOn: boolean;
};

export function ToggleButton({
  children,
  className = "",
  isOn,
  ...props
}: ToggleButtonProps) {
  return (
    <button
      aria-checked={isOn}
      className={`
        flex h-[24px] w-[44px] rounded-full items-center border p-[2px] transition-colors
        ${isOn ? "bg-toggle-background" : "border-input bg-white"}
        ${className}
      `}
      role="switch"
      type="button"
      {...props}
    >
      {children ?? (
        <span
          className={`block size-[18px] rounded-full transition-transform ${
            isOn ? "translate-x-[20px] bg-foreground" : "translate-x-0 bg-background"
          }`}
        />
      )}
    </button>
  );
}
