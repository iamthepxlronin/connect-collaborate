export function DecorativeBg() {
  return (
    <>
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-amber blur-[80px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-[420px] h-[420px] rounded-full bg-coral blur-[80px] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-sage blur-[90px] opacity-15 pointer-events-none" />
    </>
  );
}