import InvitePage from "@/components/pages/invite/InvitePage";
import redis from "@/lib/services/integrations/redis";
import { Logo } from "@/lib/hooks/useLogo";
import { notFound } from "next/navigation";

export default async function Page({ params, searchParams }) {
  const { id } = await params;
  const orgId = await searchParams.orgId; // get ?orgId=value

  const userData = await redis.json.get(`invitee:${orgId}:${id}`);

  if (!userData) {
    notFound();
  }

  const combinedData = {
    ...userData,
    id,
    orgId,
  };

  return (
    <div className="flex flex-col items-center justify-center pt-4 md:pt-10">
      <Logo />
      <InvitePage userData={combinedData} />
    </div>
  );
}
