import Image from "next/image";

export default function Logo() {
  return (
    <div className="size-15 relative">
      <Image src="/logo2.png" alt="logo" fill className="object-cover" />
    </div>
  );
}
