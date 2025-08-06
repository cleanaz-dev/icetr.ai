import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const getStatusVariant = (status) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case "paid":
      return "default";
    case "open":
      return "secondary";
    default:
      return "destructive";
  }
};

export default function RecentInvoices({ invoices, setActiveTab }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Your latest billing history</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-52">
        <div className="space-y-4">
          {invoices?.slice(0, 3).map((invoice) => (
            <div key={invoice.id} className="p-2 rounded-xl odd:bg-muted/50">
              {/* Top row: Invoice number and badge */}
              <div className="flex items-center justify-between ">
                <span className="text-sm font-medium">
                  Invoice #{invoice.number || invoice.id?.slice(-8)}
                </span>
                <Badge variant={getStatusVariant(invoice.status)}>
                  {invoice.status?.toUpperCase()}
                </Badge>
              </div>

              {/* Second row: Price and buttons */}
              <div className="flex items-center justify-between ">
                <span className="text-base font-semibold">
                  ${((invoice.amountDue || 0) / 100).toFixed(2)}{" "}
                  {invoice.currency && (
                    <span className="uppercase">{invoice.currency}</span>
                  )}
                </span>
              </div>

              {/* Bottom row: Date and currency */}
              <div className="flex items-center justify-between text-sm text-muted-foreground/50 font-bold ">
                <span>{invoice.createdAt?.toLocaleDateString()}</span>
                <div className="flex gap-2">
                  {invoice.pdfUrl ? (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground cursor-not-allowed opacity-50"
                      disabled
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      PDF
                    </Button>
                  )}
                  {invoice.hostedUrl ? (
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-muted-foreground cursor-not-allowed opacity-50"
                      disabled
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </ScrollArea>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setActiveTab && setActiveTab("invoices")}
          >
            View All Invoices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
