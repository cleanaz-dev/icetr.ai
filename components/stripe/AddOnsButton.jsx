"use client";

import { Button } from "../ui/button";

export default function AddOnsButton({
  priceId,
  label,
  className,
  variant,
  size,
  mode,
  customerId,
}) {
  const handleClick = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, mode, customerId, type: "addon" }),
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
      variant={variant}
      size={size}
      mode={mode}
    >
      {label}
    </Button>
  );
}
