"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

const getStatusIcon = (status) => {
  switch (status) {
    case "paid":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "open":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "void":
      return <XCircle className="h-4 w-4 text-gray-500" />;
    case "uncollectible":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusVariant = (status) => {
  switch (status) {
    case "paid":
      return "default";
    case "open":
      return "secondary";
    case "void":
      return "outline";
    case "uncollectible":
      return "destructive";
    default:
      return "secondary";
  }
};

export function InvoiceHistory({ invoices }) {
  const handleDownloadPDF = (pdfUrl) => {
    window.open(pdfUrl, "_blank");
  };

  const handleViewInvoice = (hostedUrl) => {
    window.open(hostedUrl, "_blank");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
        <CardDescription>
          View and download your billing history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.createdAt.toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">
                  ${(invoice.amountDue / 100).toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(invoice.status)}
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  {invoice.paidAt ? invoice.paidAt.toLocaleDateString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {invoice.pdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice.pdfUrl)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    )}
                    {invoice.hostedUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice.hostedUrl)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
