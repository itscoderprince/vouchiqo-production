import Link from "next/link";
import { FaBlogger, FaInstagram, FaLinkedin, FaMedium } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-[#0b0f19] text-slate-400 pt-12 pb-6 border-t border-slate-800/80 mt-auto select-none text-left font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10 mb-10">
          {/* Brand Info Block */}
          <div className="col-span-2 lg:col-span-2 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
            <Link
              href="/"
              className="inline-block bg-white p-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/navbarlogovouchiqo.webp"
                alt="Vouchiqo Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Striving towards making the world a better place to shop with
              great savings. We help you turn verified promotional offers into
              instant value.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2.5 pt-1.5">
              <a
                href="https://www.instagram.com/vouchiqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#E1306C] flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="Instagram"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/vouchiqo/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0077B5] flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
              <a
                href="https://medium.com/@lokesh.vouchiqo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="Medium"
              >
                <FaMedium className="w-4 h-4" />
              </a>
              <a
                href="https://vouchiqo.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#F57D00] flex items-center justify-center text-white hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xs"
                aria-label="Blogger"
              >
                <FaBlogger className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/categories"
                >
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/brands"
                >
                  Partner Brands
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/nearby-offers"
                >
                  Nearby Offers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/expired-coupon-revival"
                >
                  Offer Revival
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/faq"
                >
                  Help & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Accounts & Portal */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Accounts
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/login"
                >
                  User Login
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/register"
                >
                  User Register
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/merchant-login"
                >
                  Merchant Login
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/merchant-register"
                >
                  Merchant Register
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/admin-login"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Company
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/terms"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white hover:translate-x-0.5 inline-block transition-transform duration-150"
                  href="/contact"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center">
                <a
                  className="hover:text-white transition-colors"
                  href="mailto:contact@vouchiqo.com"
                >
                  contact@vouchiqo.com
                </a>
              </li>
              <li className="flex items-center">
                <span>+91-7997443334</span>
              </li>
              <li className="flex items-start">
                <span className="leading-relaxed">
                  Ranchi, Jharkhand, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Block */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[11px] text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Vouchiqo. All Rights Reserved.
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            Designed & Maintained by{" "}
            <a
              href="https://webitya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 font-semibold transition-colors"
            >
              Webitya
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
