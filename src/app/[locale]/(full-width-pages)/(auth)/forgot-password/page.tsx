import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Axon Dashboard",
  description: "Request a password reset link for the Axon Admin Dashboard.",
};

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}
