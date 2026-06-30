export const TrendingOffer = () => (
  <section className="text-left w-full">
    <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-4 font-heading">
      Trending Offer
    </h2>
    <a
      className="block rounded-lg overflow-hidden border border-brand-border hover:shadow-sm hover:-translate-y-0.5 transition-all"
      href="/deals"
    >
      <img
        alt="Klook Vietnam Offer"
        className="w-full object-cover max-h-48 md:max-h-56"
        src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop"
      />
    </a>
  </section>
);

export default TrendingOffer;
