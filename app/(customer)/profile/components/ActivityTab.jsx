"use client";

export default function ActivityTab() {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-xl p-5 shadow-sm space-y-5 max-w-2xl text-left">
      <h3 className="font-heading text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-3">
        Your Chronological Activity
      </h3>

      <div className="space-y-5 relative pl-4 border-l border-brand-border">
        {[
          {
            message: "Checked in at Marbella Home Improvement (Ranchi)",
            time: "2 hours ago",
            desc: "Viewed showroom deals in Home Improvement category.",
          },
          {
            message: "Claimed Burger House BOGOFRIES coupon code",
            time: "1 day ago",
            desc: "Redeemed 'Buy One Get One Free Fries' voucher code BURGER30.",
          },
          {
            message: "Saved StyleZone Summer collection coupon",
            time: "2 days ago",
            desc: "Bookmarked '20% off Summer Collection' for in-store purchase.",
          },
          {
            message: "Voted to revive Zomato Premier coupon",
            time: "3 days ago",
            desc: "Submitted an Expired Coupon Revival request for 50% discount codes.",
          },
          {
            message: "Completed profile preferences settings",
            time: "10 days ago",
            desc: "Selected shopping category interests for Homepage customization.",
          },
        ].map((act, idx) => (
          <div key={idx} className="relative space-y-1">
            {/* Dot */}
            <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-white"></div>
            <div className="flex items-center justify-between font-bold text-xs">
              <span className="text-brand-navy">{act.message}</span>
              <span className="text-[10px] text-brand-subtext font-semibold">
                {act.time}
              </span>
            </div>
            <p className="text-[10px] text-brand-subtext leading-relaxed">
              {act.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
