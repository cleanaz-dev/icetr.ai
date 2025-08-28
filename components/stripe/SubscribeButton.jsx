"use client";

import { Button } from "../ui/button";

export default function SubscribeButton({
  priceId,
  label,
  className,
  mode,
  size,
  variant,
}) {
  const handleClick = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode, type: "onboarding" })
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to start checkout");
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      mode={mode}
      size={size}
      variant={variant}
    >
      {label}
    </Button>
  );
}
