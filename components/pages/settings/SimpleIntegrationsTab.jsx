"use client";
import { TabsContent } from "@/components/ui/tabs-og";
import TwilioIntegrations from "./integrations/twilio/TwilioIntegrations";
import BlandAiIntegrations from "./integrations/bland-ai/BlandAiIntegration";
import CalendlyIntegration from "./integrations/calendly/CalendlyIntegration";
import { toast } from "sonner";
import { useState } from "react";

export default function SimpleIntegrationsTab({
  integrationData = {},
  orgId = "",
}) {
  const [loading, setLoading] = useState();

  const handleCalendlySave = async (formData) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/org/${orgId}/integrations/calendly`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: formData.enabled,
          orgUri: formData.orgUri, // This would be your "https://calendly.com/llmgem-info"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save Calendly settings");
      }
      const { message } = await response.json()
      toast.success(message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <TabsContent value="integrations">
        <header className="p-4">
          <h1 className="text-lg font-semibold">Integrations</h1>
          <p className="text-sm text-muted-foreground">
            Manage connections to external platforms and services.
          </p>
        </header>
        <div className="space-y-10">
          <TwilioIntegrations
            integration={integrationData.twilio}
            orgId={orgId}
          />
          <BlandAiIntegrations
            integration={integrationData.blandAi}
            orgId={orgId}
          />
          <CalendlyIntegration
            integration={integrationData.calendly}
            orgId={orgId}
            onSave={handleCalendlySave}
            loading={loading}
          />
        </div>
      </TabsContent>
    </>
  );
}
