import LocationSelector from "../LocationSelector";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import NotificationBell from "./NotificationBell";
import PromoBanner from "./PromoBanner";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

const NOTIFICATION_COUNT = 2;

export const Navbar = () => (
  <header className="w-full bg-white font-sans border-b border-gray-200 sticky top-0 z-40">
    <PromoBanner />
    <div className="w-full px-4 md:px-8 py-3 flex items-center gap-4">
      {/* Logo */}
      <Logo />

      {/* Search — grows to fill middle space */}
      <SearchBar />

      {/* Location Selector */}
      <LocationSelector />

      {/* Nav links + icon cluster — pinned to the right */}
      <div className="ml-auto flex items-center gap-5 shrink-0">
        {/* Desktop Links */}
        <NavLinks />

        {/* Divider */}
        <div className="h-5 w-px bg-gray-200 hidden md:block" />

        {/* Icon cluster */}
        <div className="flex items-center gap-3">
          <NotificationBell count={NOTIFICATION_COUNT} />
          <UserMenu />
          {/* Mobile burger toggle */}
          <MobileMenu />
        </div>
      </div>
    </div>
  </header>
);

export default Navbar;
