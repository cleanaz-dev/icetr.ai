"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function BillingSettings({ customer }) {
  const [billingEmail, setBillingEmail] = useState(customer.billingEmail || "");
  const [taxId, setTaxId] = useState(customer.taxId || "");
  const [autoAdvance, setAutoAdvance] = useState(
    customer.invoiceSettings?.autoAdvanceEnabled || false
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const handleSaveSettings = () => {
    console.log("Saving billing settings:", {
      billingEmail,
      taxId,
      autoAdvance,
      emailNotifications,
      invoiceNotes,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing Contact</CardTitle>
          <CardDescription>
            Update your billing email and tax information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing-email">Billing Email</Label>
              <Input
                id="billing-email"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-id">Tax ID</Label>
              <Input
                id="tax-id"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="Enter tax ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>
            Customize how your invoices are generated and delivered
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-advance invoices</Label>
              <p className="text-sm text-muted-foreground">
                Automatically finalize and send invoices
              </p>
            </div>
            <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for billing events
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-notes">Default Invoice Notes</Label>
            <Textarea
              id="invoice-notes"
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Add default notes to appear on all invoices..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-terms">Payment Terms</Label>
            <Select defaultValue="net-30">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-on-receipt">Due on receipt</SelectItem>
                <SelectItem value="net-15">Net 15</SelectItem>
                <SelectItem value="net-30">Net 30</SelectItem>
                <SelectItem value="net-60">Net 60</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History Export</CardTitle>
          <CardDescription>
            Download your complete billing history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export all invoices</p>
              <p className="text-sm text-muted-foreground">
                Download a CSV file with all your invoice data
              </p>
            </div>
            <Button variant="outline">Export CSV</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export payment history</p>
              <p className="text-sm text-muted-foreground">
                Download a CSV file with all your payment transactions
              </p>
            </div>
            <Button variant="outline">Export CSV</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings}>Save Settings</Button>
      </div>
    </div>
  );
}
