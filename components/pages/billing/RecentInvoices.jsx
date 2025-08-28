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
import { Download, ExternalLink, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.slice(0, 5).map((invoice) => (
                <TableRow key={invoice.id} className="odd:bg-muted/50">
                  <TableCell className="font-medium">
                    #{invoice.number || invoice.id?.slice(-8)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {invoice.createdAt?.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${((invoice.amountDue || 0) / 100).toFixed(2)}{" "}
                    {invoice.currency && (
                      <span className="text-xs uppercase text-muted-foreground">
                        {invoice.currency}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {invoice.pdfUrl ? (
                        <Button variant="outline" size="sm" className="h-7 px-2">
                          <Download className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted-foreground cursor-not-allowed opacity-50"
                          disabled
                        >
                          <AlertCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {invoice.hostedUrl ? (
                        <Button variant="outline" size="sm" className="h-7 px-2">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-muted-foreground cursor-not-allowed opacity-50"
                          disabled
                        >
                          <AlertCircle className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {invoices?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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