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
    <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <Logo />
      </div>

      {/* Middle: Search (Desktop only) */}
      <div className="hidden md:block flex-1 max-w-[380px]">
        <SearchBar />
      </div>

      {/* Right: Nav links + icon cluster */}
      <div className="flex items-center gap-3 md:gap-5 shrink-0">
        {/* Desktop Links */}
        <div className="hidden lg:block">
          <NavLinks />
        </div>

        {/* Divider (Desktop only) */}
        <div className="h-5 w-px bg-gray-200 hidden lg:block" />

        {/* Icon cluster */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Location Selector (Mobile only) */}
          <div className="block md:hidden">
            <LocationSelector isMobile={true} />
          </div>
          <NotificationBell count={NOTIFICATION_COUNT} />
          <UserMenu />
          {/* Mobile burger toggle */}
          <MobileMenu />
        </div>
      </div>
    </div>

    {/* Mobile Search Row (Mobile only) */}
    <div className="block md:hidden px-4 pb-3">
      <SearchBar />
    </div>
  </header>
);

export default Navbar;
