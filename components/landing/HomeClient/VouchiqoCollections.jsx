import CollectionCard from "@/components/shared/CollectionCard";
import { COLLECTIONS_LIST } from "./constants";

export const VouchiqoCollections = () => (
  <section className="text-left w-full">
    <h2 className="text-xl md:text-2xl font-bold text-brand-text mb-6 font-heading">
      Vouchiqo Collections
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {COLLECTIONS_LIST.map((col, idx) => (
        <CollectionCard
          key={idx}
          title={col.title}
          logo={col.logo}
          image={col.image}
          href={col.href}
        />
      ))}
    </div>
  </section>
);

export default VouchiqoCollections;
