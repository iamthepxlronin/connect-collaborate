// Free WhatsApp deep links (wa.me) — no API, no cost.
export function waDigits(phone: string) {
  let d = phone.replace(/[^0-9]/g, "");
  // Nigerian local format 0803... -> 234803...
  if (d.startsWith("0") && d.length === 11) d = "234" + d.slice(1);
  return d;
}

export function waLink(phone: string | null | undefined, text: string) {
  const base = phone ? `https://wa.me/${waDigits(phone)}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function firstName(name?: string | null) {
  return (name ?? "").trim().split(/\s+/)[0] || "there";
}
