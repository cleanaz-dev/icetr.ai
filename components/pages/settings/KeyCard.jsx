import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Copy } from "lucide-react";
import { Trash2 } from "lucide-react";
import { EyeOff } from "lucide-react";
import { Key } from "lucide-react";

export default function KeyCard({
  keyData,
  orgId,
  showCampaignIds,
  setShowCampaignIds,
  revealedKeys,
  copiedItems,
  loadingKeys,
  revokingKeys,
  onRevealKey,
  onCopyKey,
  onRevokeKey,
  getCampaignNames,
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-base mb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            {keyData.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-medium">Last used:</span>
              <span>
                {keyData.lastUsedAt
                  ? new Date(keyData.lastUsedAt).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Expires:</span>
              <span>
                {keyData.expiresAt
                  ? new Date(keyData.expiresAt).toLocaleDateString()
                  : "Never"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRevealKey(orgId, keyData.id)}
            disabled={loadingKeys.has(keyData.id)}
          >
            {loadingKeys.has(keyData.id) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            ) : revealedKeys.has(keyData.id) ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRevokeKey(keyData.id)}
            disabled={revokingKeys.has(keyData.id)}
          >
            {revokingKeys.has(keyData.id) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Campaign access info */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Campaign Access:</span>{" "}
            {getCampaignNames(keyData.campaignIds || [])}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setShowCampaignIds((prev) => ({
                ...prev,
                [keyData.id]: !prev[keyData.id],
              }))
            }
            className="h-6 px-2 text-xs"
          >
            {showCampaignIds[keyData.id] ? (
              <EyeOff className="h-3 w-3" />
            ) : (
              <Eye className="h-3 w-3" />
            )}
            IDs
          </Button>
        </div>

        {showCampaignIds[keyData.id] && (
          <div className="mt-2 space-y-1">
            {(keyData.campaignIds || []).map((id) => (
              <div
                key={id}
                className="flex items-center justify-between bg-muted p-2 rounded text-xs"
              >
                <div className="flex-1">
                  <span className="font-medium">{getCampaignNames([id])}</span>
                  <code className="ml-2 px-1 py-0.5 bg-background rounded font-mono">
                    {id}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopyKey(`campaign-${keyData.id}-${id}`, id)}
                  className="h-6 w-6 p-0"
                >
                  {copiedItems.has(`campaign-${keyData.id}-${id}`) ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revealed key section */}
      {revealedKeys.has(keyData.id) && keyData.revealedKey && (
        <div className="bg-muted p-3 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                API Key:
              </p>
              <code className="text-sm bg-background px-2 py-1 rounded border font-mono">
                {keyData.revealedKey}
              </code>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCopyKey(keyData.id, keyData.revealedKey)}
              className="ml-2"
            >
              {copiedItems.has(keyData.id) ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
