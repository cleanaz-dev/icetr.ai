import PaymentSuccessWrapper from "@/components/stripe/PaymentSuccessWrapper";
import { auth } from "@clerk/nextjs/server";

export default async function page({ searchParams }) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">No session ID found</p>
      </div>
    );
  }

  return (
    <div>
      <PaymentSuccessWrapper sessionId={sessionId} />
    </div>
  );
}