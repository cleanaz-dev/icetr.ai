"use client";

import { Logo } from '@/lib/hooks/useLogo';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Zap, MessageSquare } from "lucide-react";

export default function WaitListPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    expectations: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 flex flex-col">
        <header className="p-6 ">
          <Logo />
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">You're on the list!</h2>
              <p className="text-muted-foreground mb-4">
                Thanks for joining our waitlist. We'll notify you as soon as we launch!
              </p>
          
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/10 flex flex-col">
      <header className="px-4 pt-5 mx-auto container">
        <Logo />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/10 text-primary">
              <Users className="w-4 h-4 mr-2" />
              Join 2,500+ people waiting
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Get Early Access to{" "}
              <span className="text-primary">icetr.ai</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
              Be the first to experience AI-powered cold outreach that actually works. 
              Join our waitlist and get exclusive early access.
            </p>
          </div>

          {/* Features */}
          {/* <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">10x Response Rates</h3>
              <p className="text-sm text-muted-foreground">AI-optimized messaging</p>
            </div>
            <div className="text-center p-4">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Smart Cold Calls</h3>
              <p className="text-sm text-muted-foreground">Built-in calling tools</p>
            </div>
            <div className="text-center p-4">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Lead Management</h3>
              <p className="text-sm text-muted-foreground">Track and convert faster</p>
            </div>
          </div> */}

          {/* Waitlist Form */}
          <Card>
            <CardHeader>
              <CardTitle>Join the Waitlist</CardTitle>
              <CardDescription>
                Get notified when we launch and receive exclusive early access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectations">What do you expect from icetr.ai?</Label>
                  <Textarea
                    id="expectations"
                    name="expectations"
                    placeholder="Tell us what you're looking for - better cold email performance, automated calling, lead management, etc."
                    value={formData.expectations}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Join Waitlist
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                By joining, you agree to receive updates about icetr.ai. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>

          {/* Social Proof */}
          {/* <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by sales professionals at
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="font-semibold">TechCorp</div>
              <div className="font-semibold">SalesForce</div>
              <div className="font-semibold">OutreachPro</div>
              <div className="font-semibold">LeadGen Inc</div>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}