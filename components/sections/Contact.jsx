"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, MessageSquare, Phone, Box } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    interest: "",
    phone: "",
    campaignId: "689388be080f04ff7a637789" // optional if you want message + select
  });
  const { push } = useRouter();

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch("/api/public/contact-form", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_CONTACT_FORM_API_KEY, 
        },
        body: JSON.stringify(contactForm),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      await resp.json();
      setContactForm({
        name: "",
        email: "",
        company: "",
        interest: "",
        phone: "",
        message: "",
      });
      push("/thank-you");
    } catch {
      alert("Failed to send contact form. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 bg-slate-700/80">
      <div className="container mx-auto max-w-4xl">
        {/* header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-transparent border border-sky-400 rounded-full px-6 py-2 mb-6">
            <span className="text-sky-400 text-sm md:text-base tracking-wide">
              GET IN TOUCH
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-400 mb-6">
            Ready to{" "}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              break the ice
            </span>
            ?
          </h2>
          <p className="text-sky-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Get started today or reach out to learn how our platform can
            transform your cold outreach strategy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* form */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-8 h-full flex flex-col">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-sky-400/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-sky-400" />
              </div>
              <div className="mb-4" >
                <h3 className="text-2xl font-semibold text-white  flex items-center gap-3">
                  Send us a message
                </h3>
                <p className="text-sky-400/80">We are happy to help you!
                </p>
              </div>
            </div>
            <form
              onSubmit={handleContactSubmit}
              className="h-full flex flex-col justify-between space-y-6"
            >
              {/* Name */}
              <div>
                <Label
                  htmlFor="name"
                  className="text-sky-400/90 text-sm font-medium mb-2 block"
                >
                  Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  placeholder="Your full name"
                  className="w-full h-10 px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  className="text-sky-400/90 text-sm font-medium mb-2 block"
                >
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  className="w-full  h-10 px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Phone */}
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sky-400/90 text-sm font-medium mb-2 block"
                >
                  Phone *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                  placeholder="555‑555‑5555"
                  className="w-full  h-10 px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Company */}
              <div>
                <Label
                  htmlFor="company"
                  className="text-sky-400/90 text-sm font-medium mb-2 block"
                >
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={contactForm.company}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, company: e.target.value })
                  }
                  placeholder="Your company name"
                  className="w-full h-10 px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 transition-colors"
                />
              </div>

              {/* Interest */}
              <div>
                <Label
                  htmlFor="interest"
                  className="text-sky-400/90 text-sm font-medium mb-2 block"
                >
                  Interest *
                </Label>
                <Select
                  value={contactForm.interest}
                  onValueChange={(val) =>
                    setContactForm({ ...contactForm, interest: val })
                  }
                >
                  <SelectTrigger
                    id="interest"
                    className="w-full h-[40px] px-4 py-3  bg-slate-700/50 border border-sky-400/20 rounded-lg text-white focus:border-sky-400 transition-colors data-[size=default]:h-10"
                  >
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 text-white border border-sky-400/20 rounded-md shadow-md">
                    <SelectItem value="Plans">Plans</SelectItem>
                    <SelectItem value="AI Training">AI Training</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="Custom Development">Custom Development</SelectItem>
                    <SelectItem value="DFY">DFY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <div className="mt-auto pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 rounded-lg font-semibold flex items-center justify-center gap-2 before:absolute before:inset-0 before:bg-gradient-to-r before:from-sky-300 before:to-blue-400 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 text-base">
                    {loading ? (
                      <p>Sending Message…</p>
                    ) : (
                      <p className="flex items-center gap-2">
                        Send Message{" "}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 duration-300 transition-all" />
                      </p>
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-sky-400/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Email Us</h4>
                  <p className="text-sky-400/80">hello@icetr.ai</p>
                </div>
              </div>
              <p className="text-sky-400/70 text-sm">
                Get in touch for sales inquiries, support, or partnership
                opportunities.
              </p>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-sky-400/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Schedule a Demo</h4>
                  <p className="text-sky-400/80">
                    Book a personalized walkthrough
                  </p>
                </div>
              </div>
              <p className="text-sky-400/70 text-sm mb-4">
                See how our platform can transform your cold calling strategy.
              </p>
              <button className="w-full bg-slate-700 text-sky-400 border border-sky-400/30 py-2 rounded-lg font-medium hover:bg-slate-600 hover:border-sky-400 transition-all duration-300">
                Book Demo Call
              </button>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl px-6 pt-6 pb-7 flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-sky-400/20 rounded-lg flex items-center justify-center">
                  <Box className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold ">DFY Starter</h4>
                  <p className="text-sky-400/70 ">
                    Focus on sales, we handle everything else!
                  </p>
                </div>
              </div>
              <p className="text-sky-400/80 text-sm mb-4">
                Form & chatbot setup, basic funnel configuration, up to 500
                leads/month processing, monthly performance reporting.
              </p>
              <Button className="w-full h-12 relative overflow-hidden bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 rounded-lg font-semibold flex items-center justify-center gap-2 before:absolute before:inset-0 before:bg-gradient-to-r before:from-sky-300 before:to-blue-400 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 group disabled:opacity-50 disabled:cursor-not-allowed">
                <span className="text-base z-10">Special Offer!</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
