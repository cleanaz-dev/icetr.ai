"use client";
import { useState } from "react";
import { ArrowRight, Mail, MessageSquare, Phone } from "lucide-react";
import { Box } from "lucide-react";

export const Contact = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
    // Handle form submission
    alert("Thank you for your interest! We'll be in touch soon.");
    setContactForm({ name: "", email: "", company: "", message: "" });
  };

  return (
    <section id="contact" className="py-20 px-4 bg-slate-700/80">
      <div className="container mx-auto max-w-4xl">
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
          {/* Contact Form */}
          <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-sky-400" />
              Send us a message
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sky-400/90 text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 focus:outline-none transition-colors"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sky-400/90 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sky-400/90 text-sm font-medium mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, company: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 focus:outline-none transition-colors"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sky-400/90 text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-700/50 border border-sky-400/20 rounded-lg text-white placeholder-sky-400/50 focus:border-sky-400 focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="button"
                onClick={handleContactSubmit}
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 py-3 rounded-lg font-semibold hover:from-sky-300 hover:to-blue-400 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Send Message
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
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

            <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-sky-400/20 rounded-lg flex items-center justify-center">
                  <Box className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold ">
                    DFY Starter
                  </h4>
                  <p className="text-sky-400/70 ">
                    Focus on sales, we handle everything else!
                  </p>
                </div>
              </div>
              <p className="text-sky-400/80 text-sm mb-4">
                Form & chatbot setup, basic funnel configuration, up to 500
                leads/month processing, monthly performance reporting.
              </p>
              <button className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 py-3 rounded-lg font-semibold hover:from-sky-300 hover:to-blue-400 transition-all duration-300">
               Special Offer!
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
