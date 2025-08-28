"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  ExternalLink,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { SubscriptionCard } from "./SubscriptionCard";
import { InvoiceHistory } from "./InvoiceHistory";
import { PaymentMethod } from "./PaymentMethod";
import { BillingSettings } from "./BillingSettings";
import PageHeader from "@/components/ui/layout/PageHeader";
import RecentInvoices from "./RecentInvoices";
import SubscriptionFeatures from "./SubscriptionFeatures";
import SubscriptionAddOns from "./SubscriptionAddOns";

// Mock data based on your Prisma models
const mockCustomer = {
  id: "customer_123",
  orgId: "org_456",
  stripeCusId: "cus_stripe123",
  billingEmail: "billing@company.com",
  taxId: "TAX123456789",
  paymentMethod: "Card",
  invoiceSettings: {
    defaultPaymentMethod: "card",
    autoAdvanceEnabled: true,
  },
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-12-26"),
};

export default function BillingPage({ customer, subscription, invoices }) {
  const [activeTab, setActiveTab] = useState("overview");

  console.log("customer", customer);
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription, payment methods, and billing history"
        icon="CreditCard"
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SubscriptionCard subscription={subscription} />
            <RecentInvoices invoices={invoices} setActiveTab={setActiveTab} />
            <SubscriptionFeatures tier={subscription.tier} />
            <SubscriptionAddOns stripeCusId={customer?.stripeCusId} />
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceHistory invoices={invoices} />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethod customer={mockCustomer} />
        </TabsContent>

        <TabsContent value="settings">
          <BillingSettings customer={mockCustomer} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
