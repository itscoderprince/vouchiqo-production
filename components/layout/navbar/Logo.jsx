import Link from "next/link";

const LOGO = {
  src: "/navbarlogovouchiqo.webp",
  alt: "Vouchiqo",
  href: "/",
};

export const Logo = () => (
  <Link href={LOGO.href} prefetch={true} className="shrink-0">
    <img src={LOGO.src} alt={LOGO.alt} className="h-12 w-auto" />
  </Link>
);

export default Logo;
