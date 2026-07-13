export const NewsletterSubscription = () => (
  <section className="bg-white rounded-md shadow-sm border border-brand-border p-6 flex flex-col md:flex-row items-center justify-between mb-8 w-full text-left">
    <div className="flex items-center gap-4 mb-4 md:mb-0">
      <div className="w-12 h-12 rounded-full bg-brand-surface flex items-center justify-center border border-brand-border font-black text-brand-blue text-xl">
        V
      </div>
      <div>
        <h3 className="font-bold text-brand-text">Subscribe Now</h3>
        <p className="text-xs text-brand-subtext">
          Get The Latest &amp; Best Coupon/Offer Alerts
        </p>
      </div>
    </div>
    <div className="flex w-full md:w-auto max-w-md">
      <div className="relative flex-grow">
        <input
          type="email"
          placeholder="Enter Email"
          className="w-full pl-4 pr-3 py-2.5 border border-brand-border rounded-l-md focus:outline-none focus:border-brand-blue text-xs bg-brand-surface text-brand-text font-medium"
        />
      </div>
      <button
        type="button"
        className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2.5 rounded-r-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border-0"
      >
        SUBSCRIBE NOW
      </button>
    </div>
  </section>
);

export default NewsletterSubscription;
