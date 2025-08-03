import { Upload, Users, Brain, Phone, Calendar, BarChart3, ArrowRight } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: <Upload className="w-8 h-8" />,
      title: "Pour in Your Leads",
      description: "Import from any source - CSV, forms, webhooks, or integrations. Every lead gets perfectly slotted in your ice tray.",
      features: ["CSV imports", "Form integrations", "Webhook support", "CRM sync"]
    },
    {
      step: "02", 
      icon: <Users className="w-8 h-8" />,
      title: "Auto-Assign & Route",
      description: "Intelligent assignment ensures the right leads reach the right team members instantly. No manual sorting.",
      features: ["Smart routing", "Team management", "Role-based access", "SLA workflows"]
    },
    {
      step: "03",
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Training",
      description: "Train your team with custom scenarios, get real-time feedback, and grade performance automatically.",
      features: ["Mock call training", "Custom scenarios", "Performance grading", "Real-time coaching"]
    },
    {
      step: "04",
      icon: <Phone className="w-8 h-8" />,
      title: "Make the Call",
      description: "Built-in calling with scripts, recordings, transcripts, and instant access to campaign resources.",
      features: ["Integrated calling", "Call recording", "Live transcripts", "Campaign scripts"]
    },
    {
      step: "05",
      icon: <Calendar className="w-8 h-8" />,
      title: "Book & Follow Up",
      description: "Seamless Calendly integration lets you book meetings during calls and automate follow-ups.",
      features: ["Calendar integration", "Meeting booking", "Automated follow-ups", "Appointment confirmations"]
    },
    {
      step: "06",
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Track & Optimize",
      description: "Real-time insights show what's working. Never lose track of a lead or miss an opportunity again.",
      features: ["Live notifications", "Performance tracking", "Campaign analytics", "Team dashboards"]
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block bg-transparent border border-sky-400 rounded-full px-6 py-2 mb-6">
            <span className="text-sky-400 text-sm md:text-base tracking-wide">
              HOW IT WORKS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-400 mb-6">
            From{' '}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              ice tray to pipeline
            </span>
          </h2>
          <p className="text-sky-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Six simple steps to transform your cold outreach. Like an ice tray, every lead 
            is perfectly organized, tracked, and ready to convert.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/50 backdrop-blur-sm border border-sky-400/20 rounded-xl p-8 hover:border-sky-400/40 transition-all duration-300 group h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                  {step.step}
                </div>

                <div className="flex items-start gap-6">
                  <div className="text-sky-400 mt-2 group-hover:text-white transition-colors duration-300 flex-shrink-0">
                    {step.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sky-400/80 leading-relaxed mb-4">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sky-400/70 text-sm">
                          <div className="w-1.5 h-1.5 bg-sky-400 rounded-full flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Arrow for desktop view */}
                {index < steps.length - 1 && index % 2 === 0 && (
                  <div className="hidden lg:block absolute -right-8 top-1/2 transform -translate-y-1/2 text-sky-400/40">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-light text-sky-400 mb-4">
              Ready to{' '}
              <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
                melt the ice
              </span>
              ?
            </h3>
            <p className="text-sky-400/80 text-lg leading-relaxed mb-6">
              Turn cold leads into hot wins with automated assignment, AI training, 
              and seamless integrations. Every lead in its perfect slot.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-sky-400 to-blue-500 text-slate-900 rounded-lg font-semibold hover:from-sky-300 hover:to-blue-400 transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
              Book Demo Call
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};