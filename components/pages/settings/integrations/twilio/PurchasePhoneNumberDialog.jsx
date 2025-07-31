import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function PurchasePhoneNumberDialog({
  orgId,
  orgIntegrationId,
  open,
  setOpen,
}) {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [searchParams, setSearchParams] = useState({
    countryCode: "US",
    areaCode: "",
    contains: "",
  });
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const searchNumbers = async () => {
    if (!orgId || !orgIntegrationId) {
      toast.error("Missing organization or integration ID");
      return;
    }

    setSearching(true);
    try {
      const params = new URLSearchParams();
      params.append("countryCode", searchParams.countryCode);
      if (searchParams.areaCode)
        params.append("areaCode", searchParams.areaCode);
      if (searchParams.contains)
        params.append("contains", searchParams.contains);

      const res = await fetch(
        `/api/org/${orgId}/integrations/twilio/available-numbers?${params}`,
        { method: "GET" }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to search numbers");
      }

      const data = await res.json();
      setAvailableNumbers(data.numbers || []);

      if (data.numbers?.length === 0) {
        toast.info("No numbers found matching your criteria");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const purchaseNumber = async () => {
    if (!selectedNumber) {
      toast.error("Please select a number to purchase");
      return;
    }

    setPurchasing(true);
    try {
      const res = await fetch(
        `/api/org/${orgId}/integrations/twilio/purchase-number`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: selectedNumber.phoneNumber }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to purchase number");
      }

      const data = await res.json();
      toast.success(`Successfully purchased ${selectedNumber.friendlyName}!`);
      setOpen(false);

      // Reset form
      setAvailableNumbers([]);
      setSelectedNumber(null);
      setSearchParams({ countryCode: "US", areaCode: "", contains: "" });
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error instanceof Error ? error.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const formatPhoneNumber = (number) => {
    // Format +1XXXXXXXXXX to (XXX) XXX-XXXX
    if (number.startsWith("+1") && number.length === 12) {
      const digits = number.slice(2);
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return number;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs" disabled>
         <span className="flex items-center gap-2"><Lock /> Purchase Phone Number</span> 
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Twilio Phone Number</DialogTitle>
          <DialogDescription>
            Search for and purchase a new phone number for your Twilio
            integration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Search Criteria</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country</Label>
                <Select
                  value={searchParams.countryCode}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({ ...prev, countryCode: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaCode">Area Code</Label>
                <Input
                  id="areaCode"
                  placeholder="e.g. 415"
                  value={searchParams.areaCode}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      areaCode: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contains">Contains</Label>
                <Input
                  id="contains"
                  placeholder="e.g. 1234"
                  value={searchParams.contains}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      contains: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Button
              onClick={searchNumbers}
              disabled={searching}
              className="w-full"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Available Numbers
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {availableNumbers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Available Numbers</h3>

              <div className="space-y-1 max-h-60 overflow-y-auto">
                {availableNumbers.map((number) => (
                  <div
                    key={number.phoneNumber}
                    className={`rounded-md px-3 py-2 bg-card text-sm cursor-pointer transition-colors ${
                      selectedNumber?.phoneNumber === number.phoneNumber
                        ? "border border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedNumber(number)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {formatPhoneNumber(number.phoneNumber)}
                          </div>
                          {number.locality && (
                            <div className="text-xs text-muted-foreground">
                              {number.locality}, {number.region}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {number.capabilities?.voice && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5"
                          >
                            Voice
                          </Badge>
                        )}
                        {number.capabilities?.sms && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5"
                          >
                            SMS
                          </Badge>
                        )}
                        {number.capabilities?.mms && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5"
                          >
                            MMS
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Button */}
          {selectedNumber && (
            <div className="space-y-4 pt-4 border-t">
              <div className="text-sm">
                <span className="text-muted-foreground">Selected:</span>{" "}
                <span className="font-medium">
                  {formatPhoneNumber(selectedNumber.phoneNumber)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={purchaseNumber}
                  disabled={purchasing}
                  className="flex-1"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    "Purchase Number"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
