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

const mockSubscription = {
  id: "sub_123",
  stripeSubId: "sub_stripe123",
  customerId: "customer_123",
  priceId: "price_pro_monthly",
  productId: "prod_pro_plan",
  quantity: 5,
  status: "ACTIVE",
  currentPeriodEnd: new Date("2025-01-26"),
  cancelAtPeriodEnd: false,
  trialStart: null,
  trialEnd: null,
  metadata: {
    planName: "Pro Plan",
    planPrice: 2900, // $29.00 in cents
    billingInterval: "month",
  },
  createdAt: new Date("2024-12-26"),
  updatedAt: new Date("2024-12-26"),
};

const mockInvoices = [
  {
    id: "inv_1",
    stripeInvId: "in_stripe1",
    customerId: "customer_123",
    amountDue: 14500,
    amountPaid: 14500,
    status: "paid",
    pdfUrl: "https://invoice.stripe.com/pdf1",
    hostedUrl: "https://invoice.stripe.com/hosted1",
    createdAt: new Date("2024-12-26"),
    paidAt: new Date("2024-12-26"),
  },
  {
    id: "inv_2",
    stripeInvId: "in_stripe2",
    customerId: "customer_123",
    amountDue: 14500,
    amountPaid: 14500,
    status: "paid",
    pdfUrl: "https://invoice.stripe.com/pdf2",
    hostedUrl: "https://invoice.stripe.com/hosted2",
    createdAt: new Date("2024-11-26"),
    paidAt: new Date("2024-11-26"),
  },
  {
    id: "inv_3",
    stripeInvId: "in_stripe3",
    customerId: "customer_123",
    amountDue: 14500,
    amountPaid: 0,
    status: "open",
    pdfUrl: null,
    hostedUrl: "https://invoice.stripe.com/hosted3",
    createdAt: new Date("2024-10-26"),
    paidAt: null,
  },
];

export default function BillingPage({ customerData, subscription, invoices }) {
  const [activeTab, setActiveTab] = useState("overview");

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
            <RecentInvoices invoices={invoices} setActiveTab={setActiveTab}/>
            <div className="col-span-2">
              <SubscriptionFeatures tier={subscription.tier}/>
            </div>
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
