"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, ExternalLink, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react"
import { SubscriptionCard } from "./SubscriptionCard"
import { InvoiceHistory } from "./InvoiceHistory"
import { PaymentMethod } from "./PaymentMethod"
import { BillingSettings } from "./BillingSettings"


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
}

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
}

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
]

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">Manage your subscription, payment methods, and billing history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SubscriptionCard subscription={mockSubscription} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Plan</span>
                  <span className="font-medium">Pro Plan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Cost</span>
                  <span className="font-medium">${((mockSubscription.metadata?.planPrice || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Seats</span>
                  <span className="font-medium">{mockSubscription.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Next Billing</span>
                  <span className="font-medium">{mockSubscription.currentPeriodEnd.toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Monthly</span>
                  <span>
                    ${(((mockSubscription.metadata?.planPrice || 0) * mockSubscription.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest billing history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {invoice.status === "paid" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : invoice.status === "open" ? (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                      </div>
                      <div>
                        <p className="font-medium">${(invoice.amountDue / 100).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{invoice.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {invoice.pdfUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      )}
                      {invoice.hostedUrl && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => setActiveTab("invoices")}>
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceHistory invoices={mockInvoices} />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethod customer={mockCustomer} />
        </TabsContent>

        <TabsContent value="settings">
          <BillingSettings customer={mockCustomer} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
