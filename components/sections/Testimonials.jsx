import { Star, Quote } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      quote: "Finally, a platform that gets it. No more leads falling through the cracks, no more manual assignment chaos. The AI training feature alone has transformed how our new reps perform on calls.",
      name: "Sarah Chen",
      title: "VP of Sales",
      company: "TechFlow Solutions",
      rating: 5,
      avatar: "SC"
    },
    {
      quote: "The speed of lead assignment is game-changing. We went from taking hours to assign leads to having them routed instantly. Our response time dropped from 2 hours to under 5 minutes.",
      name: "Marcus Rodriguez", 
      title: "Sales Director",
      company: "GrowthLabs",
      rating: 5,
      avatar: "MR"
    },
    {
      quote: "What impressed me most was how intuitive everything is. My team was up and running in 30 minutes. The call recording and transcript features have made coaching so much more effective.",
      name: "Jennifer Park",
      title: "Head of Revenue",
      company: "Velocity Inc",
      rating: 5,
      avatar: "JP"
    },
    {
      quote: "The Calendly integration is seamless. Being able to book meetings right during the call without switching apps has increased our booking rate by 40%. It's the little things that make a huge difference.",
      name: "David Thompson",
      title: "Sales Manager", 
      company: "PipelinePro",
      rating: 5,
      avatar: "DT"
    },
    {
      quote: "We tested 4 different platforms before choosing icetr.ai. The AI training scenarios are incredibly realistic, and the performance analytics give us insights we never had before. Our close rate has improved dramatically.",
      name: "Amanda Foster",
      title: "Chief Revenue Officer",
      company: "ScaleUp Dynamics",
      rating: 5,
      avatar: "AF"
    },
    {
      quote: "The team collaboration features are outstanding. Being able to assign leads by territory, track team performance, and ensure nothing gets missed has streamlined our entire sales process.",
      name: "Ryan Mitchell",
      title: "Sales Operations Lead",
      company: "NextGen Sales",
      rating: 5,
      avatar: "RM"
    }
  ];

  return (
    <section className="py-20 px-4 bg-slate-900/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-block bg-transparent border border-sky-400 rounded-full px-6 py-2 mb-6">
            <span className="text-sky-400 text-sm md:text-base tracking-wide">
              WHAT TEAMS ARE SAYING
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-sky-400 mb-6">
            Sales teams love{' '}
            <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              breaking the ice
            </span>
          </h2>
          <p className="text-sky-400 text-lg max-w-3xl mx-auto leading-relaxed">
            From solo entrepreneurs to enterprise sales teams, see how icetr.ai is 
            transforming cold outreach across industries.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-slate-800/40 backdrop-blur-sm border border-sky-400/20 rounded-xl p-6 hover:border-sky-400/40 transition-all duration-300 hover:scale-105 group">
              {/* Quote Icon */}
              <div className="text-sky-400/40 mb-4 group-hover:text-sky-400/60 transition-colors duration-300">
                <Quote className="w-8 h-8" />
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-sky-400 text-sky-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sky-400/90 leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-slate-900 font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                
                <div>
                  <div className="text-white font-semibold">
                    {testimonial.name}
                  </div>
                  <div className="text-sky-400/70 text-sm">
                    {testimonial.title}
                  </div>
                  <div className="text-sky-400/60 text-xs">
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-light text-white mb-2 drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              4.9/5
            </div>
            <div className="text-sky-400/80 text-sm">
              Average Rating
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-light text-white mb-2 drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              99%
            </div>
            <div className="text-sky-400/80 text-sm">
              Would Recommend
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-light text-white mb-2 drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
              30s
            </div>
            <div className="text-sky-400/80 text-sm">
              Average Setup Time
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-12">
          <p className="text-sky-400/70 text-sm mb-4">
            Join sales teams at companies like:
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sky-400/50 text-sm font-medium">
            <span>TechFlow Solutions</span>
            <span>•</span>
            <span>GrowthLabs</span>
            <span>•</span>
            <span>Velocity Inc</span>
            <span>•</span>
            <span>PipelinePro</span>
            <span>•</span>
            <span>ScaleUp Dynamics</span>
          </div>
        </div>
      </div>
    </section>
  );
};