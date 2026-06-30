const LOGO = {
  src: "/logo.jpg",
  alt: "Vouchiqo",
  href: "/",
};

export const Logo = () => (
  <a href={LOGO.href} className="shrink-0">
    <img src={LOGO.src} alt={LOGO.alt} className="h-12 w-auto" />
  </a>
);

export default Logo;
