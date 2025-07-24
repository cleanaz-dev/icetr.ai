"use client";


import { TabsContent } from "@/components/ui/tabs";
import TwilioIntegrations from "./integrations/twilio/TwilioIntegrations";


export default function SimpleIntegrationsTab({ integrationData = {}, orgId = "" }) {

console.log("twilio data:", integrationData)
  return (
    <>
    <TabsContent value="integrations">
        <TwilioIntegrations integration={integrationData.twilio} orgId={orgId}/>
      </TabsContent>
    </>
  );
}
