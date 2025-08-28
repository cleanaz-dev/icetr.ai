"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function GetStartedPage({ orgId }) {
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [searchParams, setSearchParams] = useState({
    countryCode: "US",
    areaCode: "",
    contains: "",
  });
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [purchasedNumber, setPurchasedNumber] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const numbersPerPage = 10;

  const searchNumbers = async () => {
    if (!orgId) {
      toast.error("Missing organization ID");
      return;
    }

    setSearching(true);
    setCurrentPage(1);
    setPurchasedNumber(null);
    setSelectedNumber(null);
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
          body: JSON.stringify({ 
            phoneNumber: selectedNumber.phoneNumber,
            countryCode: searchParams.countryCode, 
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to purchase number");
      }

      const data = await res.json();
      toast.success(`Successfully purchased ${selectedNumber.friendlyName}!`);
      setPurchasedNumber(selectedNumber);

      // Reset search results
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
    if (number.startsWith("+1") && number.length === 12) {
      const digits = number.slice(2);
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return number;
  };

  // Pagination calculations
  const totalPages = Math.ceil(availableNumbers.length / numbersPerPage);
  const startIndex = (currentPage - 1) * numbersPerPage;
  const endIndex = startIndex + numbersPerPage;
  const currentNumbers = availableNumbers.slice(startIndex, endIndex);

  if (purchasedNumber) {
    return (
      <div className="h-screen bg-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">You're All Set!</h1>
              <p className="text-muted-foreground mb-6">
                Your phone number has been successfully configured.
              </p>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <div className="text-sm text-muted-foreground mb-1">
                  Your Number
                </div>
                <div className="text-xl font-bold mb-2">
                  {formatPhoneNumber(purchasedNumber.phoneNumber)}
                </div>
                {purchasedNumber.locality && (
                  <div className="text-sm text-muted-foreground mb-3">
                    {purchasedNumber.locality}, {purchasedNumber.region}
                  </div>
                )}
                <div className="flex justify-center gap-2">
                  {purchasedNumber.capabilities?.voice && (
                    <Badge variant="secondary">Voice</Badge>
                  )}
                  {purchasedNumber.capabilities?.sms && (
                    <Badge variant="secondary">SMS</Badge>
                  )}
                  {purchasedNumber.capabilities?.mms && (
                    <Badge variant="secondary">MMS</Badge>
                  )}
                </div>
              </div>

              <Button size="lg" className="w-full" asChild>
                <Link href="/home">
                  Start Making Calls
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex-col items-center justify-center p-4 container mx-auto">
      <h1 className="flex text-primary tracking-wider text-center items-center justify-center gap-2 text-3xl font-medium mb-4 underline decoration-primary-foreground">
        Let's Get Started!
      </h1>

      <Card className="w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle>
            <p className="text-center text-muted-foreground">
              Search and choose a number for your organization.
            </p>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-6 overflow-hidden">
          {/* Search Form */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Country</Label>
                <Select
                  value={searchParams.countryCode}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      countryCode: value,
                    }))
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

              <div className="space-y-2">
                <Label className="invisible">Search</Label>
                <Button
                  onClick={searchNumbers}
                  disabled={searching}
                  className="w-full"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 flex flex-col overflow-hidden border rounded-md">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="h-10 text-left font-medium text-sm text-muted-foreground">
                      Phone Number
                    </TableHead>
                    <TableHead className="h-10 text-left font-medium text-sm text-muted-foreground">
                      Location
                    </TableHead>
                    <TableHead className="h-10 text-left font-medium text-sm text-muted-foreground">
                      Capabilities
                    </TableHead>
                    <TableHead className="h-10 text-center font-medium text-sm text-muted-foreground w-[100px]">
                      Select
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentNumbers.length === 0 && !searching ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-12"
                      >
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div>Search for available numbers to get started</div>
                      </TableCell>
                    </TableRow>
                  ) : searching ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <div className="text-muted-foreground">
                          Searching available numbers...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentNumbers.map((number) => (
                      <TableRow
                        key={number.phoneNumber}
                        className={`cursor-pointer transition-colors ml-2 ${
                          selectedNumber?.phoneNumber === number.phoneNumber
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        } h-10`}
                        onClick={() => setSelectedNumber(number)}
                      >
                        <TableCell className="py-2 font-mono font-medium">
                          {formatPhoneNumber(number.phoneNumber)}
                        </TableCell>
                        <TableCell className="py-2">
                          {number.locality ? (
                            <div className="text-sm">
                              {number.locality}, {number.region}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex gap-1">
                            {number.capabilities?.voice && (
                              <Badge
                                variant="outline"
                                className="text-xs py-0 px-2 h-5"
                              >
                                Voice
                              </Badge>
                            )}
                            {number.capabilities?.sms && (
                              <Badge
                                variant="outline"
                                className="text-xs py-0 px-2 h-5"
                              >
                                SMS
                              </Badge>
                            )}
                            {number.capabilities?.mms && (
                              <Badge
                                variant="outline"
                                className="text-xs py-0 px-2 h-5"
                              >
                                MMS
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          {selectedNumber?.phoneNumber ===
                          number.phoneNumber ? (
                            <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-muted-foreground/30 rounded-full mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {availableNumbers.length > numbersPerPage && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, availableNumbers.length)} of{" "}
                  {availableNumbers.length} numbers
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Purchase Button */}
          {selectedNumber && (
            <div className="flex-shrink-0 text-center pt-2">
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Selected Number:
                </div>
                <div className="text-lg font-semibold font-mono">
                  {formatPhoneNumber(selectedNumber.phoneNumber)}
                </div>
              </div>

              <Button
                onClick={purchaseNumber}
                disabled={purchasing}
                size="lg"
                className="w-full max-w-xs"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Get This Number
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
