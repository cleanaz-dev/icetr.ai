import { Sparkles, CircleCheck } from 'lucide-react';

const FeatureCapabilities = ({ tierFeatures, tierSettings }) => {
  const enabledFeatures = tierFeatures.filter(feature => 
    tierSettings.features?.[feature.configName]
  );
  
  const disabledFeatures = tierFeatures.filter(feature => 
    !tierSettings.features?.[feature.configName]
  );

  const renderFeature = (feature, isEnabled) => (
    <div
      key={feature.name}
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isEnabled ? "border-green-500" : "bg-muted"
      }`}
    >
      <feature.icon
        className={`w-4 h-4 ${
          isEnabled ? feature.color : "text-muted-foreground"
        }`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span
            className={`text-sm font-medium ${
              isEnabled
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {feature.name}
          </span>
          {isEnabled && (
            <CircleCheck className="size-4 text-green-400" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {feature.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="w-4 h-4" />
        <h3 className="font-semibold">Features & Capabilities</h3>
      </div>

      {/* Enabled Features */}
      {enabledFeatures.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium ">
            Available Features ({enabledFeatures.length})
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {enabledFeatures.map(feature => renderFeature(feature, true))}
          </div>
        </div>
      )}

      {/* Disabled Features */}
      {disabledFeatures.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Upgrade to Access ({disabledFeatures.length})
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {disabledFeatures.map(feature => renderFeature(feature, false))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCapabilities;