import { useEffect, useState } from "react";

export default function useMerchantApprovals() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingMerchants = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/merchants?status=pending");
        const json = await res.json();
        if (json.success && json.data) {
          setMerchants(json.data.merchants || []);
        }
      } catch (err) {
        console.error("Error fetching pending merchants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingMerchants();
  }, []);

  const handleAction = async (merchantId, action) => {
    try {
      const status = action === "approve" ? "approved" : "rejected";
      const res = await fetch("/api/admin/merchants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId, status }),
      });
      if (res.ok) {
        setMerchants((prev) => prev.filter((m) => m._id !== merchantId));
      }
    } catch (err) {
      console.error("Error reviewing merchant:", err);
    }
  };

  return {
    merchants,
    loading,
    handleAction,
  };
}
