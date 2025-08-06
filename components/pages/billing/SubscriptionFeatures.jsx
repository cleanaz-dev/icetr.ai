import React from "react";
import { TIER_FEATURES, TIER_CONFIGS } from "@/lib/config/tier-config";
import { Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SubscriptionFeatures({ tier }) {
  const tierConfig = TIER_CONFIGS[tier];
  
  if (!tierConfig) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div>Invalid tier: {tier}</div>
        </CardContent>
      </Card>
    );
  }

  // Filter features that are enabled for this tier
  const enabledFeatures = TIER_FEATURES.filter(feature => {
    // Check if feature is enabled in tier config
    const isEnabled = tierConfig.features[feature.configName];
    
    // Include features that are available in all tiers
    if (feature.allTiers) return true;
    
    // Include enterprise-only features only if they're enabled
    if (feature.enterpriseOnly) return isEnabled;
    
    // Include other features if enabled
    return isEnabled;
  });

  const disabledFeatures = TIER_FEATURES.filter(feature => {
    const isEnabled = tierConfig.features[feature.configName];
    
    // Don't show disabled "all tiers" features as disabled
    if (feature.allTiers) return false;
    
    return !isEnabled;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Plan Features</CardTitle>
        <CardDescription>
          Features included in your {tier} plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
      {/* Enabled Features */}
      <div>
        <h3 className="font-semibold text-lg mb-3">Included Features</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {enabledFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div key={feature.configName} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <IconComponent className={`h-4 w-4 ${feature.color} flex-shrink-0`} />
                    <span className="font-medium text-sm">{feature.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disabled Features */}
      {disabledFeatures.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 text-muted-foreground">
            Upgrade to Unlock
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {disabledFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.configName} className="flex items-start space-x-3 p-3 border rounded-lg opacity-60">
                  <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-sm text-muted-foreground">{feature.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

        {/* Summary */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">{enabledFeatures.length}</span> of{" "}
            <span className="font-medium">{TIER_FEATURES.length}</span> features included
          </p>
        </div>
      </CardContent>
    </Card>
  );
}