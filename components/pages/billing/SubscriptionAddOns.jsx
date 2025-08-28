import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Plus, Zap, Brain, Sparkles, TrendingUp } from "lucide-react";
import AddOnsButton from "@/components/stripe/AddOnsButton";

// Mock data for demonstration
const mockCustomerAddOns = {
  aiCredits: {
    current: 2500,
    total: 10000,
    lastPurchased: "2024-08-10",
    usageThisMonth: 3200,
  },
};

const mockAddOnPackages = [
  {
    id: "ai_credits_10",
    name: "10 AI Credits",
    description: "Starter safety net",
    credits: 10,
    price: 7,
    priceId: "price_1RtDBMLHmVqPdFvXiqqWy492",
    popular: false,
  },
  {
    id: "ai_credits_50",
    name: "50 AI Credits",
    description: "Sweet spot for Growth",
    credits: 50,
    price: 30,
    priceId: "price_1RtDCCLHmVqPdFvXsrRtp7Ks",
    popular: true,
  },
  {
    id: "ai_credits_100",
    name: "100 AI Credits",
    description: "Power pack",
    credits: 100,
    price: 55,
    priceId: "price_1RtDEHLHmVqPdFvXRawmMAfF",
    popular: false,
  },
  {
    id: "ai_credits_500",
    name: "500 AI Credits",
    description: "Enterprise ",
    credits: 500,
    price: 250,
    priceId: "price_1RtDEiLHmVqPdFvXb1k2hzvv",
    popular: false,
  },
  {
    id: "ai_credits_1000",
    name: "Bulk Credits",
    description: "Unlimited credits",
    credits: "Custom",
    price: "Contact Us",
    priceId: "/contact-us",
    popular: false,
  },
];

export default function SubscriptionAddOns({
  customerData = mockCustomerAddOns,
  stripeCusId,
}) {


  return (
    <div className="space-y-6">
      {/* Purchase Options */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            Purchase Additional Credits
          </CardTitle>
          <CardDescription>
            Choose a credit package that fits your needs. Credits never expire.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {mockAddOnPackages.map((pkg) => {
              const IconComponent = pkg.icon;
              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-lg border p-4 hover:shadow-md transition-shadow ${
                    pkg.popular ? "border-primary shadow-sm" : "border-border"
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-4 bg-primary ">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{pkg.name}</h3>
                          {pkg.savings && (
                            <Badge
                              variant="secondary"
                              className="text-green-600 text-xs"
                            >
                              Save {pkg.savings}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pkg.description}
                        </p>
                      </div>
                    </div>
                    <AddOnsButton
                      priceId={pkg.priceId}
                      className={pkg.popular ? "bg-primary" : ""}
                      variant={pkg.popular ? "default" : "outline"}
                      size="sm"
                      mode="payment"
                      customerId={stripeCusId}
                      label={
                        <>
                          {pkg.credits === "Custom" ? "" : "$"}
                          {pkg.price}
                        </>
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Need a custom package or have questions about credits?
            </p>
            <Button variant="ghost" size="sm">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
