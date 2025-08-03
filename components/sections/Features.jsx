import { Phone, Users, Brain, Calendar, BarChart3, Shield } from 'lucide-react';

export const Features = () => {
  const features = [
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Smart Lead Management",
      description: "Import, track, and assign leads with intelligent automation. Real-time notifications keep your team connected."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Training",
      description: "Mock cold calls, performance feedback, and customizable training scenarios to sharpen your team's skills."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Integrated Booking",
      description: "Seamless Calendly integration lets you book meetings during calls and confirm appointments instantly."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Manage teams, campaigns, and permissions with role-based access for admins, managers, and agents."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Track performance with detailed dashboards, call analytics, and AI-powered insights for continuous improvement."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-level security with role-based permissions, secure call recording, and compliance-ready features."
    }
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block bg-transparent border border-sky-400 rounded-full px-6 py-2 mb-6">
            <span className="text-sky-400 text-sm md:text-base tracking-wide">
              POWERFUL FEATURES
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-400 mb-6">
            Everything you need to{' '}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              close more deals
            </span>
          </h2>
          <p className="text-sky-400 text-lg max-w-3xl mx-auto leading-relaxed">
            From intelligent lead management to AI-powered training, our platform gives your team 
            the tools to excel at cold outreach and convert more prospects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-muted/5 backdrop-blur-sm border border-sky-400/20 rounded-xl p-6 hover:border-sky-400/40 transition-all duration-300 group">
              <div className="text-primary mb-4 group-hover:text-white transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">
                {feature.title}
              </h3>
              <p className="text-primary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};