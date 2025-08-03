'use client';

import { Button } from "../ui/button";

export default function SubscribeButton({ priceId, label, className }) {
  const handleClick = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    });

    const data = await res.json();

    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert('Failed to start checkout');
    }
  };

  return (
    <Button onClick={handleClick} className={className}>
      {label}
    </Button>
  );
}
