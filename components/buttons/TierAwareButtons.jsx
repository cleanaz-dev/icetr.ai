import * as Icons from "@/lib/config/icons";
import { useLimitCheck } from "@/lib/hooks/useLimitCheck";
import { Button } from "../ui/button";

export function TierAwareButton({
  check,
  label,
  onClick,
  icon,
  disabled: extraDisabled = false,

}) {
  const { isAtLimit } = useLimitCheck(check);
  const IconComponent = icon ? Icons[icon] : null;
  const disabled = isAtLimit || extraDisabled;

  return (
    <Button
      variant={disabled ? "secondary" : "default"}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-2"
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {isAtLimit ? `${label} (Limit Reached)` : label}
    </Button>
  );
}
