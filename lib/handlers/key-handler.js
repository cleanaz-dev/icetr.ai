// lib/key-handlers.js
export const revealKey = async (orgId, keyId) => {
  const res = await fetch(`/api/org/${orgId}/keys/${keyId}`);
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();
  return data.key;
};

export const revokeKey = async (orgId, keyId) => {
  const res = await fetch(`/api/org/${orgId}/keys/${keyId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(res.statusText);
};

export const copyKey = async (keyValue) => {
  await navigator.clipboard.writeText(keyValue);
};