import { ArrowRight } from 'lucide-react';

export const Footer = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto">
        <h3 className="text-3xl md:text-4xl font-light text-sky-400 mb-4">
          Ready to transform your{' '}
          <span className="text-white drop-shadow-[0_0_8px_rgba(167,243,255,0.8)]">
            cold outreach
          </span>
          ?
        </h3>
        <p className="text-sky-400/80 text-lg max-w-2xl mx-auto">
          Join thousands of sales teams who have already increased their conversion rates by 10x with our AI-powered platform.
        </p>
      </div>
    </section>
  );
};
