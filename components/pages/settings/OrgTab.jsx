"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Copy, EyeOff, Eye, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OrgTab({ organization }) {
  const [keyName, setKeyName] = useState("");
  const [keyExpires, setKeyExpires] = useState("");
  const [newKey, setNewKey] = useState("");
  const [showCampaignIds, setShowCampaignIds] = useState({});
  const [orgName, setOrgName] = useState(organization.name);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [revealedKeys, setRevealedKeys] = useState(new Set());
  const [copiedItems, setCopiedItems] = useState(new Set());
  const [loadingKeys, setLoadingKeys] = useState(new Set());
  const [revokingKeys, setRevokingKeys] = useState(new Set());
  const [keys, setKeys] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [currentOrg, setCurrentOrg ] = useState(organization)

  async function handleGenerateKey() {
    const res = await fetch(`/api/organizations/${organization.id}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: keyName,
        expiresAt: keyExpires || null,
        campaignIds: selectedCampaigns,
      }),
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.error);

    setNewKey(data.key); // show once
    navigator.clipboard.writeText(data.key);
    setKeyName("");
    setKeyExpires("");
    setSelectedCampaigns([]);
    fetchKeys(); // refresh list
    toast.success("Key copied to clipboard");
  }

  const getCampaignNames = (campaignIds) => {
    return campaignIds
      .map((id) => allCampaigns.find((c) => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const revealKey = async (orgId, keyId) => {
    const res = await fetch(`/api/organizations/${orgId}/keys/${keyId}`);
    const data = await res.json();
    return data.key;
  };

  const handleRevealKey = async (orgId, keyId) => {
    setLoadingKeys((prev) => new Set(prev).add(keyId));

    try {
      if (revealedKeys.has(keyId)) {
        // Hide the key
        setRevealedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(keyId);
          return newSet;
        });
      } else {
        // Reveal the key
        const key = await revealKey(orgId, keyId);
        setRevealedKeys((prev) => new Set(prev).add(keyId));
        // Store the key temporarily
        setKeys((prev) =>
          prev.map((k) => (k.id === keyId ? { ...k, revealedKey: key } : k))
        );
      }
    } catch (error) {
      console.error("Failed to reveal key:", error);
      // You might want to show a toast or error message here
    } finally {
      setLoadingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }
  };
  // Save organization settings
  const handleSaveOrgSettings = () => {
    setCurrentOrg((prev) => ({
      ...prev,
      name: orgName,
      updatedAt: new Date(),
    }));

    toast.success("Your organization settings have been updated successfully.");
  };

  // Copy to clipboard function
  const handleCopyKey = async (keyId, keyValue) => {
    try {
      await navigator.clipboard.writeText(keyValue);
      setCopiedItems((prev) => new Set(prev).add(keyId));

      // Remove the copied indicator after 2 seconds
      setTimeout(() => {
        setCopiedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(keyId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error("Failed to copy key:", error);
    }
  };

  // Handle revoke key with proper state management
  const handleRevokeKey = async (keyId) => {
    setRevokingKeys((prev) => new Set(prev).add(keyId));

    try {
      const response = await fetch(
        `/api/organizations/${orgId}/keys/${keyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove the key from the list
        setKeys((prev) => prev.filter((k) => k.id !== keyId));
        // Clean up any revealed state
        setRevealedKeys((prev) => {
          const newSet = new Set(prev);
          newSet.delete(keyId);
          return newSet;
        });
      } else {
        console.error("Failed to revoke key");
        // You might want to show an error message here
      }
    } catch (error) {
      console.error("Error revoking key:", error);
    } finally {
      setRevokingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(keyId);
        return newSet;
      });
    }
  };

  async function fetchKeys() {
    const res = await fetch(`/api/organizations/${organization.id}/keys`);
    setKeys(res.ok ? await res.json() : []);
  }

  // fetch campaigns so admin can pick which ones the key can hit
  async function fetchCampaigns() {
    const res = await fetch(`/api/organizations/${organization.id}/campaigns`);
    setAllCampaigns(res.ok ? await res.json() : []);
  }

  useEffect(() => {
    fetchKeys();
    fetchCampaigns();
  }, []);

  const filteredCampaigns = allCampaigns.filter((c) => c.type === "FORMS");

  return (
    <>
      <TabsContent value="organization">
        <div className="grid gap-6">
          {/* Org Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Manage your organization information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  name="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  autoComplete="on"
                />
              </div>

              <div className="space-y-2">
                <Label>Organization ID</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                  <code className="text-sm text-muted-foreground">
                    {organization.id}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Created</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                    <span className="text-sm text-muted-foreground">
                      {organization.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted">
                    <span className="text-sm text-muted-foreground">
                      {organization.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveOrgSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
          {/* Api Keys */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Keys that external sites can use to post leads into this
                organization's campaigns.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* GENERATE NEW KEY */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Generate New Key</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Key Name
                    </Label>
                    <Input
                      placeholder="Name / description"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Expiration Date (Optional)
                    </Label>
                    <Input
                      type="date"
                      value={keyExpires}
                      onChange={(e) => setKeyExpires(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-sm font-medium mb-3 block">
                    Campaign Access <span className="text-xs text-muted-foreground italic ">(Form Type)</span>
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredCampaigns.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(c.id)}
                          onChange={() => {
                            setSelectedCampaigns((prev) =>
                              prev.includes(c.id)
                                ? prev.filter((id) => id !== c.id)
                                : [...prev, c.id]
                            );
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-medium">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateKey}
                  disabled={!keyName || selectedCampaigns.length === 0}
                  className="w-full md:w-auto"
                >
                  Generate & Copy Key
                </Button>

                {newKey && (
                  <Alert className="mt-4">
                    <AlertTitle>Key Created Successfully</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">
                        Store this key safely – it won't be shown again:
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm select-all flex-1">
                          {newKey}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyKey("new-key", newKey)}
                        >
                          {copiedItems.has("new-key") ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* EXISTING KEYS */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Existing Keys</h3>

                {keys.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No API keys created yet.</p>
                    <p className="text-xs mt-1">
                      Generate your first key above to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {keys.map((k) => (
                      <div key={k.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-base mb-2">
                              {k.name}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Last used:</span>
                                <span>
                                  {k.lastUsedAt
                                    ? k.lastUsedAt.toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Expires:</span>
                                <span>
                                  {k.expiresAt
                                    ? k.expiresAt.toLocaleDateString()
                                    : "Never"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRevealKey(organization.id, k.id)
                              }
                              disabled={loadingKeys.has(k.id)}
                            >
                              {loadingKeys.has(k.id) ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                              ) : revealedKeys.has(k.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRevokeKey(k.id)}
                              disabled={revokingKeys.has(k.id)}
                            >
                              {revokingKeys.has(k.id) ? (
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
                              <span className="font-medium">
                                Campaign Access:
                              </span>{" "}
                              {getCampaignNames(k.campaignIds)}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setShowCampaignIds((prev) => ({
                                  ...prev,
                                  [k.id]: !prev[k.id],
                                }))
                              }
                              className="h-6 px-2 text-xs"
                            >
                              {showCampaignIds[k.id] ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                              IDs
                            </Button>
                          </div>

                          {showCampaignIds[k.id] && (
                            <div className="mt-2 space-y-1">
                              {k.campaignIds.map((id) => (
                                <div
                                  key={id}
                                  className="flex items-center justify-between bg-muted p-2 rounded text-xs"
                                >
                                  <div className="flex-1">
                                    <span className="font-medium">
                                      {getCampaignNames([id])}
                                    </span>
                                    <code className="ml-2 px-1 py-0.5 bg-background rounded font-mono">
                                      {id}
                                    </code>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleCopyKey(
                                        `campaign-${k.id}-${id}`,
                                        id
                                      )
                                    }
                                    className="h-6 w-6 p-0"
                                  >
                                    {copiedItems.has(
                                      `campaign-${k.id}-${id}`
                                    ) ? (
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
                        {revealedKeys.has(k.id) && k.revealedKey && (
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                  API Key:
                                </p>
                                <code className="text-sm bg-background px-2 py-1 rounded border font-mono">
                                  {k.revealedKey}
                                </code>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleCopyKey(k.id, k.revealedKey)
                                }
                                className="ml-2"
                              >
                                {copiedItems.has(k.id) ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Delete Org */}
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Destructive actions for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Organization</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your organization and remove all associated data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                      Delete Organization
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </>
  );
}
