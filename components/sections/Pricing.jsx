"use client";
import { useState } from "react";
import { pricingPlans } from "@/lib/config/page-config";
import { Check, Star } from "lucide-react";
import SubscribeButton from "../stripe/SubscribeButton";
import { BillingSwitch } from "../ui/billing-switch";

export const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  const getDisplayPrice = (plan) => {
    if (plan.price === "Free") return "Free";
    const numericPrice = parseFloat(plan.price.replace(/[^0-9.]/g, ""));
    return isYearly ? `$${Math.floor(numericPrice * 0.8)}` : `$${numericPrice}`;
  };

  const getDisplayPeriod = (plan) => {
    if (plan.price === "Free") return plan.period;
    return isYearly ? "/month*" : "/month";
  };

  return (
    <section id="pricing" className="py-20 px-4 bg-slate-900/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block bg-transparent border border-sky-400 rounded-full px-6 py-2 mb-6">
            <span className="text-sky-400 text-sm md:text-base tracking-wide">
              SIMPLE PRICING
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-400 mb-6">
            Choose your{" "}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              plan
            </span>
          </h2>
          <p className="text-sky-400 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
            Start with our free trial and scale as your team grows. No hidden
            fees, cancel anytime.
          </p>

          {/* Billing Toggle - Now with stable height */}
          <div className="flex items-center justify-center mb-8">
            <BillingSwitch isYearly={isYearly} setIsYearly={setIsYearly} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-slate-800/40 backdrop-blur-sm border rounded-xl p-8 hover:scale-105 transition-all duration-300 ${
                plan.popular
                  ? "border-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)]"
                  : "border-sky-400/20 hover:border-sky-400/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-6xl md:text-5xl font-light text-sky-400">
                    {getDisplayPrice(plan)}
                  </span>
                  <span className="text-sky-400/80 text-lg">
                    {getDisplayPeriod(plan)}
                  </span>
                  {/* Stable height container for discount text */}
                  <div className="h-5 mt-1">
                    {isYearly && plan.price !== "Free" ? (
                      <div className="text-xs text-emerald-400 font-medium">
                        Save 20% with annual billing
                      </div>
                    ) : (
                      <div className="invisible text-xs">Placeholder</div>
                    )}
                  </div>
                </div>
                <p className="text-sky-400/80 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-sky-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sky-400/90">{feature}</span>
                  </li>
                ))}
              </ul>
              <SubscribeButton
                priceId={
                  isYearly
                    ? plan.yearlyStripePriceId || plan.stripePriceId
                    : plan.stripePriceId
                }
                label={plan.cta}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 hover:from-sky-300 hover:to-blue-400"
                    : "bg-slate-700 text-sky-400 border border-sky-400/30 hover:bg-slate-600 hover:border-sky-400"
                }`}
              />
            </div>
          ))}
        </div>

        {isYearly && (
          <div className="text-center mt-6 text-sky-400/70 text-sm">
            <p>*Monthly rate when billed annually</p>
          </div>
        )}
      </div>
    </section>
  );
};