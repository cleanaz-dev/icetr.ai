export const scenarios = [
  {
    id: "introduction",
    name: "Cold Introduction",
    difficulty: "Beginner",
    description:
      "Practice your opening pitch with a moderately interested prospect",
  },
  {
    id: "objection",
    name: "Handling Objections",
    difficulty: "Intermediate",
    description:
      "Navigate common objections like price, timing, and competition",
  },
  {
    id: "hostile",
    name: "Difficult Customer",
    difficulty: "Advanced",
    description:
      "Turn around a hostile prospect who doesn't want to be bothered",
  },
  {
    id: "busy",
    name: "Busy Prospect",
    difficulty: "Intermediate",
    description: "Capture attention from someone with very limited time",
  },
];

export const callScripts = {
  opening: `Hey, this is [Your Name] from [Your Company]. I’ll keep it super quick — we help trades and home service businesses get more booked jobs using automated systems like smart funnels, AI chat, and even voice agents that follow up with leads for you. Just curious, how are you currently getting most of your new customers?`,

  rebuttal: `Totally get it — a lot of the contractors we talk to are swamped and get a bunch of these calls. What’s different about what we do is it actually handles the follow-up for you — no chasing leads. We’ve helped other trades like HVAC, roofing, and plumbing increase booked jobs without hiring more staff. Worth a 5-minute breakdown sometime this week?`,

  features: `We build simple, powerful systems designed for trades like yours:

- Automated funnels that turn website visitors into booked jobs
- AI voice agents that answer and follow up with leads 24/7
- Chatbots that pre-qualify customers on your site or Facebook
- Full web design that’s built to convert

`,
};

export const scenarioPrompts = {
      introduction: {
        prompt: `You are a potential customer receiving a cold call. You are moderately interested but cautious. Ask basic questions about the product/service, express some mild skepticism, but remain polite and engaged. End the call after 2-3 minutes of conversation.`,
        voice: "maya",
        temperature: 0.7
      },
      objection: {
        prompt: `You are a busy potential customer who has several objections to any sales pitch. Common objections you should raise: "I don't have time", "It's too expensive", "I need to think about it", "I'm happy with my current solution". Be challenging but not rude. Give the caller opportunities to overcome your objections.`,
        voice: "ryan",
        temperature: 0.8
      },
      hostile: {
        prompt: `You are an irritated potential customer who doesn't want to be bothered by sales calls. Start somewhat hostile but allow the caller to potentially turn the conversation around if they handle you well. Use phrases like "I'm not interested", "Take me off your list", but give them a chance to recover if they're skilled. END CALL when appropriate.`,
        voice: "sarah",
        temperature: 0.9
      },
      busy: {
        prompt: `You are an extremely busy professional who has no time for sales calls. Keep responses very short initially - "I'm in a meeting", "Can you call back later", "I only have 30 seconds". Only engage more if the caller provides immediate, compelling value. END CALL randomly.`,
        voice: "6a63d109-aa30-470c-ab56-a4c1447c4a4c",
        temperature: 0.6
      }
    };
