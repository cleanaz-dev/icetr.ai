import { TrendingUp, Clock, Users, Zap } from 'lucide-react';

export const Stats = () => {
  const stats = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      number: "73%",
      label: "of leads never get contacted",
      description: "Don't let opportunities slip through the cracks"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      number: "21x",
      label: "more likely to qualify leads",
      description: "When you respond within 5 minutes"
    },
    {
      icon: <Users className="w-8 h-8" />,
      number: "50%",
      label: "of buyers choose",
      description: "The vendor that responds first"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      number: "30%",
      label: "increase in conversions",
      description: "With AI-powered lead management"
    }
  ];

  return (
    <section className="py-20 px-4 bg-slate-900/15">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block  border border-primary rounded-full px-6 py-2 mb-6 bg-card">
            <span className="text-sky-400 text-sm md:text-base tracking-wide">
              THE COLD TRUTH
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-400 mb-6">
            Why most{' '}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              cold leads stay cold
            </span>
          </h2>
          <p className="text-sky-400 text-lg max-w-3xl mx-auto leading-relaxed">
            The data doesn't lie. Speed and automation are the difference between 
            closing deals and watching opportunities{' '}
            <span className="font-semibold">slip away forever</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-b from-slate-800/40 to-slate-700/50 min-h-72 backdrop-blur-sm border border-sky-400/20 rounded-xl p-8 hover:border-sky-400/40 transition-all duration-300 hover:scale-105">
                <div className="text-sky-400 mb-4 flex justify-center group-hover:text-white transition-colors duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl md:text-5xl font-light text-white mb-2 drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
                  {stat.number}
                </div>
                <div className="text-sky-400 font-semibold mb-2 text-lg">
                  {stat.label}
                </div>
                <p className="text-sky-400/70 text-sm leading-relaxed">
                  {stat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-sky-400/20 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-light text-sky-400 mb-4">
              Don't let your leads become{' '}
              <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
                forgotten ice
              </span>
            </h3>
            <p className="text-sky-400/80 text-lg leading-relaxed">
              Top-performing sales teams are <span className="font-semibold text-sky-400">2.8x more likely</span> to use 
              AI and automated lead tracking. Join them with icetr.ai and turn every cold lead into a hot opportunity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};