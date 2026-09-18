import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Axon Dashboard",
  description: "This is the Sign In page for the Axon Admin Dashboard.",
};

export default function SignIn() {
  return <SignInForm />;
}
