import OnboardingWrapper from "@/components/pages/onboarding/OnboardingWrapper";
import { Logo } from "@/lib/hooks/useLogo";
import { getOnboardingData } from "@/lib/services/integrations/redis";
import { redirect } from "next/navigation";

export default async function page({ searchParams }) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="flex flex-col items-center justify-center pt-4 md:pt-10">
      <Logo />
      <OnboardingWrapper sessionId={sessionId} />
    </div>
  );
}
