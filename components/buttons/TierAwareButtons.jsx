import { useLimitCheck } from "@/lib/hooks/useLimitCheck";
import { Button } from "../ui/button";

export function TierAwareButton({
  check,
  label,
  onClick,
  disabled: extraDisabled = false, // 👈 allow caller to pass more rules
}) {
  const { isAtLimit } = useLimitCheck(check);

  const disabled = isAtLimit || extraDisabled;

  return (
    <Button
      variant={disabled ? "secondary" : "default"}
      disabled={disabled}
      onClick={onClick}
    >
      {isAtLimit ? `${label} (Limit Reached)` : label}
    </Button>
  );
}
