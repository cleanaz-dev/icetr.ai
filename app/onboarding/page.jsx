import Onboarding from "@/components/pages/Onboarding";
import OnboardingDemo from "@/components/pages/OnboardingDemo";
import { Logo } from "@/lib/hooks/useLogo";

export default function page() {
  return (
    <div className="flex flex-col items-center justify-center pt-4 md:pt-10">
      <Logo />
      <Onboarding />
    </div>
  );
}
