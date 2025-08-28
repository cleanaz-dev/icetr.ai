// components/stripe/PaymentSuccessWrapper.js
import { getAddOnCache } from "@/lib/services/integrations/redis";
import PaymentSuccessPage from "@/components/stripe/PaymentSuccessPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Separate component for the actual data fetching
async function PaymentSuccessContent({ sessionId }) {
  // Add a small delay to ensure cache has time to populate
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const cache = await getAddOnCache(sessionId);
  console.log("sessionId:", sessionId);
  console.log("cache:", cache);
  
  // If cache is still empty, try a few more times
  if (!cache) {
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const retryCache = await getAddOnCache(sessionId);
      if (retryCache) {
        return <PaymentSuccessPage cache={retryCache} />;
      }
    }
  }
  
  return <PaymentSuccessPage cache={cache} />;
}

// Loading component
function PaymentSuccessLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-medium">Processing your payment...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
      </div>
    </div>
  );
}

// Main wrapper component
export default function PaymentSuccessWrapper({ sessionId }) {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent sessionId={sessionId} />
    </Suspense>
  );
}