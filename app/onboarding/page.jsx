import Onboarding from "@/components/pages/Onboarding";
import { Logo } from "@/lib/hooks/useLogo";
import { getOnboardingData } from "@/lib/services/integrations/redis";
import { redirect } from "next/navigation";

export default async function page({ searchParams }) {
  const params = await searchParams; // Await searchParams first
  const sessionId = params.session_id; // Then access the property
  
  if (!sessionId) {
    redirect('/'); // No session ID provided
  }

  // Get cached onboarding data
  const onboardingData = await getOnboardingData(sessionId);
  
  if (!onboardingData) {
    redirect('/'); // Data expired or doesn't exist
  }

  return (
    <div className="flex flex-col items-center justify-center pt-4 md:pt-10">
      <Logo />
      <Onboarding onboardingData={onboardingData} />
    </div>
  );
}