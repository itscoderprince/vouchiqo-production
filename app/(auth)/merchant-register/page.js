import { MerchantRegisterForm } from "@/features/auth/components/merchant-register-form";

export const metadata = {
  title: "Merchant Registration | Vouchiqo",
  description:
    "Create your merchant account on Vouchiqo to list and manage promotional offers.",
};

export default function MerchantRegisterPage() {
  return <MerchantRegisterForm />;
}
