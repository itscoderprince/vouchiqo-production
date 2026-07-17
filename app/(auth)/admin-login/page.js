import { AdminLoginForm } from "@/features/auth/components/admin-login-form";

export const metadata = {
  title: "Admin Portal | Vouchiqo",
  description: "Secure login portal for Vouchiqo administration panel.",
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
