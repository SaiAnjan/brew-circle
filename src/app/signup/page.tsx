import { EmailAuthForm } from "@/components/EmailAuthForm";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense>
      <EmailAuthForm mode="signup" />
    </Suspense>
  );
}
