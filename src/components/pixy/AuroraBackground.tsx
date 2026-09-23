import Image from "next/image";

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#120b22]">
      <Image
        src="/pixy-bg.jpg"
        alt="Space background"
        fill
        className="object-cover object-center opacity-80"
        priority
      />
      {/* Subtle overlay to ensure text readability on the left side */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(18,11,34,0.85) 0%, rgba(18,11,34,0.4) 40%, rgba(18,11,34,0) 100%)",
        }}
      />
    </div>
  );
}
