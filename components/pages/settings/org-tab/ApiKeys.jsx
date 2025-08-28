import { useState } from "react";
import {
  Key,
  Plus,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Save,
  Activity,
  Settings,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function ApiKeysConfiguration({
  campaigns = [],
  apiKeys: initialApiKeys = [],
  newKey,
  onGenerate,
  onRevokeKey,
  orgId,
  saving = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyExpires, setKeyExpires] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [revealedKeys, setRevealedKeys] = useState(new Set());
  const [copiedItems, setCopiedItems] = useState(new Set());
  const [loadingKeys, setLoadingKeys] = useState(new Set());
  const [revokingKeys, setRevokingKeys] = useState(new Set());
  const [keys, setKeys] = useState(
    initialApiKeys.filter((k) => k.isActive === true)
  );

  const filteredCampaigns = campaigns.filter((c) => c.type === "FORMS");

  const handleGenerateKey = async () => {
    try {
      await onGenerate({
        name: keyName,
        expiresAt: keyExpires || null,
        campaignIds: selectedCampaigns,
      });
      setKeyName("");
      setKeyExpires("");
      setSelectedCampaigns([]);
    } catch (error) {
      console.error("Error generating key:", error.message);
    }
  };

  const getCampaignNames = (campaignIds) =>
    []
      .concat(campaignIds)
      .map((id) => campaigns.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");

  const handleReveal = async (keyId) => {
    setLoadingKeys((prev) => new Set(prev).add(keyId));
    try {
      setRevealedKeys((prev) => {
        const next = new Set(prev);
        prev.has(keyId) ? next.delete(keyId) : next.add(keyId);
        return next;
      });
    } finally {
      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    }
  };

  const handleRevoke = async (keyId) => {
    setRevokingKeys((prev) => new Set(prev).add(keyId));
    try {
      await onRevokeKey(keyId);
      setKeys((prev) => prev.filter((k) => k.id !== keyId));
      setRevealedKeys((prev) => {
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    } catch (error) {
      console.error("Error revoking key:", error);
    } finally {
      setRevokingKeys((prev) => {
        const next = new Set(prev);
        next.delete(keyId);
        return next;
      });
    }
  };

  const handleCopy = async (keyValue, id) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedItems((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setCopiedItems((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const getKeyStats = () => {
    const activeKeys = keys.filter(
      (k) =>
        !k.isRevoked && (!k.expiresAt || new Date(k.expiresAt) > new Date())
    ).length;
    const expiredKeys = keys.filter(
      (k) => k.expiresAt && new Date(k.expiresAt) < new Date()
    ).length;
    const revokedKeys = keys.filter((k) => k.isRevoked).length;

    return { activeKeys, expiredKeys, revokedKeys, total: keys.length };
  };

  const keyStats = getKeyStats();
  const keyStatsData = [
    { name: "Active Keys", value: keyStats.activeKeys, color: "#22c55e" },
    { name: "Expired Keys", value: keyStats.expiredKeys, color: "#ef4444" },
    { name: "Revoked Keys", value: keyStats.revokedKeys, color: "#f97316" },
  ].filter((stat) => stat.value > 0);

  return (
    <Card className="w-full overflow-hidden hover:border-primary transition-all duration-300">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">API Keys</CardTitle>
              <CardDescription>
                External integration keys for form campaigns • {keyStats.total}{" "}
                keys
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={keyStats.activeKeys > 0 ? "default" : "secondary"}>
              <Activity className="w-3 h-3 mr-1" />
              {keyStats.activeKeys} Active
            </Badge>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-0">
          <div className="p-6 space-y-6">
            {/* Generate New Key */}
            <div className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Generate New Key */}
                {/* Campaign Access - Streamlined */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Settings className="w-4 h-4" />
                    <h3 className="font-semibold">Access Features</h3>
                  </div>

                  <div className="grid gap-3">
                    {[
                      {
                        icon: <Shield className="w-4 h-4 text-blue-500" />,
                        label: "Form Campaigns Only",
                      },
                      {
                        icon: <Calendar className="w-4 h-4 text-green-500" />,
                        label: "Optional Expiration",
                      },
                      {
                        icon: <Key className="w-4 h-4 text-purple-500" />,
                        label: "Secure Key Generation",
                      },
                    ].map((feature) => (
                      <div
                        key={feature.label}
                        className="flex items-center gap-3"
                      >
                        {feature.icon}
                        <span className="text-muted-foreground">
                          {feature.label}
                        </span>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Available Campaigns
                      </span>
                      <span className="font-medium">
                        {filteredCampaigns.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Access Features and Key Statistics */}
                <section className="space-y-4">
                  {/* Key Statistics Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">
                        Key Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {keyStats.total === 0 ? (
                        <div className="h-48 flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">No API keys created yet</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={keyStatsData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {keyStatsData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Total Keys:{" "}
                          <span className="font-semibold">
                            {keyStats.total}
                          </span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </div>
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <h3 className="font-semibold">Generate New Key</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    placeholder="Name / description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyExpires">Expiration Date (Optional)</Label>
                  <Input
                    id="keyExpires"
                    type="date"
                    value={keyExpires}
                    onChange={(e) => setKeyExpires(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Campaign Access{" "}
                  <span className="text-xs italic">(Form Type)</span>
                </Label>
                {filteredCampaigns.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground bg-muted rounded-lg border border-dashed">
                    <p className="text-sm">No form campaigns available.</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-48 rounded-lg border">
                    <div className="grid grid-cols-1 gap-2 p-2">
                      {filteredCampaigns.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center space-x-2 p-3 rounded-md hover:bg-muted"
                        >
                          <Checkbox
                            id={`campaign-${c.id}`}
                            checked={selectedCampaigns.includes(c.id)}
                            onCheckedChange={(checked) => {
                              setSelectedCampaigns((prev) =>
                                checked
                                  ? [...prev, c.id]
                                  : prev.filter((id) => id !== c.id)
                              );
                            }}
                          />
                          <Label
                            htmlFor={`campaign-${c.id}`}
                            className="cursor-pointer"
                          >
                            {c.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <Button
                onClick={handleGenerateKey}
                disabled={!keyName || selectedCampaigns.length === 0 || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate & Copy Key
                  </>
                )}
              </Button>

              {newKey && (
                <Card className="border-green-200 bg-card">
                  <CardContent className="p-4 flex items-start gap-3">
                    <Key className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-green-800 mb-1">
                        Key Created Successfully
                      </h5>
                      <p className="text-sm text-green-700 mb-3">
                        Store this key safely – it won't be shown again:
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newKey}
                          readOnly
                          className="flex-1 font-mono"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(newKey, "new-key")}
                        >
                          {copiedItems.has("new-key") ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Existing Keys */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <h3 className="font-semibold">Existing Keys ({keys.length})</h3>
              </div>

              {keys.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted rounded-lg border border-dashed">
                  <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    No API keys created yet.
                  </p>
                  <p className="text-xs mt-1">
                    Generate your first key above to get started.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {keys.map((k) => (
                    <Card key={k.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <CardTitle className="text-base">
                                {k.name}
                              </CardTitle>
                              <CardDescription>
                                Created{" "}
                                {new Date(k.createdAt).toLocaleDateString()}
                                {k.expiresAt &&
                                  ` • Expires ${new Date(
                                    k.expiresAt
                                  ).toLocaleDateString()}`}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant={
                              k.isRevoked
                                ? "destructive"
                                : new Date(k.expiresAt) < new Date() &&
                                  k.expiresAt
                                ? "warning"
                                : "default"
                            }
                          >
                            {k.isRevoked
                              ? "Revoked"
                              : new Date(k.expiresAt) < new Date() &&
                                k.expiresAt
                              ? "Expired"
                              : "Active"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* API Key Value */}
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={
                                revealedKeys.has(k.id)
                                  ? k.key ||
                                    "sk_test_1234567890abcdefghijklmnopqrstuvw"
                                  : "••••••••••••••••••••••••••••••••"
                              }
                              readOnly
                              className="font-mono"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleReveal(k.id)}
                              disabled={loadingKeys.has(k.id)}
                            >
                              {loadingKeys.has(k.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : revealedKeys.has(k.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            {revealedKeys.has(k.id) && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() =>
                                  handleCopy(
                                    k.key ||
                                      "sk_test_1234567890abcdefghijklmnopqrstuvw",
                                    k.id
                                  )
                                }
                              >
                                {copiedItems.has(k.id) ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Campaign Access */}
                        <div className="space-y-2">
                          <Label>Campaign Access</Label>
                          <div className=" gap-2">
                            {(k.campaignIds || []).map((campaignId) => (
                              <Card key={campaignId} className="p-3">
                                <div className="text-sm font-medium">
                                  {getCampaignNames(campaignId) ||
                                    "Unknown Campaign"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {campaignId}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevoke(k.id)}
                            disabled={k.isRevoked || revokingKeys.has(k.id)}
                          >
                            {revokingKeys.has(k.id) ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Revoking...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                {k.isRevoked ? "Revoked" : "Revoke Key"}
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
