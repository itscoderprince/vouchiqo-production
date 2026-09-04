import Image from "next/image";
import Link from "next/link";

const LOGO = {
  src: "/navbarlogovouchiqo.webp",
  alt: "Vouchiqo",
  href: "/",
};

export const Logo = () => (
  <Link href={LOGO.href} prefetch={true} className="shrink-0 flex items-center">
    <Image
      src={LOGO.src}
      alt={LOGO.alt}
      width={160}
      height={48}
      priority
      className="h-12 w-auto object-contain"
    />
  </Link>
);

export default Logo;
