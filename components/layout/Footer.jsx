import { Headphones, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#191F2E] text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-auto select-none text-left font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* 6-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Info Block (spans 2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block bg-white p-2 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Text logo bg remove.webp"
                alt="Vouchiqo Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-medium">
              Striving towards making the world a better place to shop with
              great savings! We help you turn verified promotional offers into
              instant value.
            </p>
            {/* Social Icons Strip */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.394 9.807-9.805.002-2.622-1.01-5.086-2.854-6.931-1.845-1.843-4.299-2.856-6.924-2.857-5.407 0-9.809 4.399-9.813 9.809-.001 1.77.475 3.5 1.379 5.017L1.811 21.8l5.836-1.53c-.567-.3-.815-.434-.99-.516z" />
                </svg>
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1H13c-2.8 0-5 2.2-5 5v2z" />
                </svg>
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.2 2H22l-8.3 9.5L23.4 22h-7.6l-5.9-7.7L3.1 22H.8l8.9-10.2L.2 2h7.8l5.2 6.8L18.2 2zm-1.3 17.6h2.1L7.1 4.7H4.9l12 14.9z" />
                </svg>
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4 stroke-current fill-none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.098C19.539 3.5 12 3.5 12 3.5s-7.54 0-9.399.565c-1.025.272-1.827 1.076-2.1 2.098C0 8.021 0 12 0 12s0 3.979.502 5.837c.273 1.022 1.074 1.826 2.1 2.098C4.46 20.5 12 20.5 12 20.5s7.54 0 9.399-.565c1.025-.272-1.827-1.076 2.1-2.098C24 15.979 24 12 24 12s0-3.979-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="/"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Telegram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.73 7.59-3.25 3.61-1.48 4.36-1.74 4.85-1.75.11 0 .35.03.5.16.13.11.17.26.18.38.01.07.01.15 0 .22z" />
                </svg>
              </a>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal max-w-xs font-semibold">
              We may earn a commission if you buy through links on Vouchiqo. For
              more details refer to our{" "}
              <Link
                href="/terms"
                className="text-slate-400 hover:text-white underline font-bold"
              >
                terms of use
              </Link>
              .
            </p>
          </div>

          {/* Col 3: Speciality Pages */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center relative text-sm uppercase tracking-wider">
              <span className="relative z-10 bg-[#191F2E] pr-2">
                Speciality Pages
              </span>
              <span className="absolute left-0 bottom-0 w-8 h-[2px] bg-brand-success -mb-[2px]" />
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/categories"
                >
                  AI Tools
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/categories"
                >
                  Surge 2025
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/categories"
                >
                  Product Deals
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Charities
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Offers */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center relative text-sm uppercase tracking-wider">
              <span className="relative z-10 bg-[#191F2E] pr-2">Offers</span>
              <span className="absolute left-0 bottom-0 w-8 h-[2px] bg-brand-success -mb-[2px]" />
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/categories"
                >
                  City Offers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/brands"
                >
                  Brand Offers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/categories"
                >
                  Bank Offers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/categories"
                >
                  Festival Offers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center relative text-sm uppercase tracking-wider">
              <span className="relative z-10 bg-[#191F2E] pr-2">Company</span>
              <span className="absolute left-0 bottom-0 w-8 h-[2px] bg-brand-success -mb-[2px]" />
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-400">
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors"
                  href="/terms"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Branding
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Careers
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Partner With Us
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="/">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 6: Contact Us */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center relative text-sm uppercase tracking-wider">
              <span className="relative z-10 bg-[#191F2E] pr-2">
                Contact Us
              </span>
              <span className="absolute left-0 bottom-0 w-8 h-[2px] bg-brand-success -mb-[2px]" />
            </h4>
            <ul className="space-y-3.5 text-xs font-bold text-slate-400">
              <li className="flex items-start">
                <Mail className="w-4 h-4 mr-2.5 text-slate-500 mt-0.5" />
                <a
                  className="hover:text-white transition-colors"
                  href="mailto:contact@vouchiqo.com"
                >
                  contact@vouchiqo.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 mr-2.5 text-slate-500 mt-0.5" />
                <span>+91-7997443334</span>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2.5 text-slate-500 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] leading-normal">
                  Vouchiqo Corp,
                  <br />
                  Inspirelabs Solutions Ltd,
                  <br />
                  OneWest Building, Gachibowli,
                  <br />
                  Hyderabad, TG, 500032
                </span>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="bg-brand-blue hover:bg-brand-blue/90 text-white px-4 py-2 rounded text-[10px] uppercase tracking-wider font-extrabold transition-all flex items-center gap-1.5 w-fit cursor-pointer shadow-sm"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Support Center</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Block */}
        <div className="text-center pt-8 border-t border-slate-800 flex flex-col items-center select-none">
          <p className="text-[10px] text-slate-500 font-bold leading-normal">
            &copy; {new Date().getFullYear()} Vouchiqo is Registered Trademark
            Of Inspirelabs Solutions Ltd. - All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
