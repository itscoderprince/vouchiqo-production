export const LeadingTaglineBar = () => (
  <div className="w-full bg-white select-none border-y border-[#E2E8F0] py-4">
    <div className="w-full">
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: "1fr auto 1fr", gap: "16px" }}
      >
        {/* Left arrow decorator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[2px] bg-[#D0D7E2] rounded-full" />
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0 6H14M14 6L9 1M14 6L9 11"
              stroke="#D0D7E2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Center tagline */}
        <h1
          className="text-center font-bold whitespace-nowrap px-4"
          style={{
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: "14px",
            color: "#191F2E",
            lineHeight: "125%",
          }}
        >
          India&apos;s Leading Coupons &amp; Deals Marketplace
        </h1>

        {/* Right arrow decorator */}
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18 6H4M4 6L9 1M4 6L9 11"
              stroke="#D0D7E2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1 h-[2px] bg-[#D0D7E2] rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

export default LeadingTaglineBar;
