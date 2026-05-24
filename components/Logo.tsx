import Image from "next/image";

export default function Logo() {
  return (
    <div className="size-15 relative">
      <Image
        src="/logo2.png"
        alt="logo"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 48px, 48px"
      />
    </div>
  );
}
