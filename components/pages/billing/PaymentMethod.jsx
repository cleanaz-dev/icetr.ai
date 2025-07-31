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
import { CreditCard, Plus, Trash2 } from "lucide-react";

// Mock payment methods data
const mockPaymentMethods = [
  {
    id: "pm_1",
    type: "card",
    card: {
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
    },
    isDefault: true,
  },
  {
    id: "pm_2",
    type: "card",
    card: {
      brand: "mastercard",
      last4: "5555",
      expMonth: 8,
      expYear: 2026,
    },
    isDefault: false,
  },
];

export function PaymentMethod({ customer }) {
  const handleAddPaymentMethod = () => {
    console.log("Adding new payment method");
  };

  const handleDeletePaymentMethod = (paymentMethodId) => {
    console.log("Deleting payment method:", paymentMethodId);
  };

  const handleSetDefault = (paymentMethodId) => {
    console.log("Setting default payment method:", paymentMethodId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Methods</span>
            <Button onClick={handleAddPaymentMethod}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardTitle>
          <CardDescription>
            Manage your payment methods for subscription billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPaymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {method.card.brand} •••• {method.card.last4}
                    </span>
                    {method.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.card.expMonth}/{method.card.expYear}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  disabled={method.isDefault}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Your billing details and tax information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Billing Email
              </label>
              <p className="font-medium">
                {customer.billingEmail || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Tax ID
              </label>
              <p className="font-medium">{customer.taxId || "Not set"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Customer ID
              </label>
              <p className="font-medium font-mono text-sm">
                {customer.id}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Default Payment
              </label>
              <p className="font-medium">
                {customer.paymentMethod || "Not set"}
              </p>
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline">Update Billing Information</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
