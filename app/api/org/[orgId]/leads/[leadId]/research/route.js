import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateOrgAccess } from "@/lib/db/validations";
import { mockTechStack } from "@/lib/config/research-config";

export async function POST(req, { params }) {
  const { orgId, leadId } = await params;
  const { userId: clerkId } = await auth();
  if (!orgId || !leadId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);

    const { website, company, services, techStackFocus } = await req.json();

    // console.log("🌐 Website:", website);
    // console.log("🏢 Company:", company);
    // console.log("🛠️ Services:", services);
    // console.log("💻 Tech Stack Focus:", techStackFocus);
    // return NextResponse.json(
    //   { message: "Data received successfully" },
    //   { status: 200 }
    // );
    const techStack = await getCompanyTechStack(website);
    // console.log(JSON.stringify(techStack, null, 2));

    const searchResults = await searchCompany(company);
    console.log("searchResults:", searchResults);

    // Scrape company website
    const websiteContent = await scrapeWebsite(searchResults.website);

    // Generate research with Groq
    const research = await generateResearch(
      company,
      searchResults,
      websiteContent,
      techStack,
      services,
      techStackFocus
    );
    console.log("research:", research);

    return NextResponse.json(research, { status: 200 });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getCompanyTechStack(companyWebsite) {
  if (!companyWebsite) return null;

  const domain = new URL(companyWebsite).hostname;

  try {
    // Use the free API first
    const response = await fetch(
      `https://api.builtwith.com/v21/api.json?KEY=${process.env.BUILTWITH_API_KEY}&LOOKUP=${domain}`
    );
    const data = await response.json();
    console.dir(data, { depth: null, colors: true });
    return data;
  } catch (error) {
    console.error("BuiltWith API error:", error);
    return null;
  }
}

async function searchCompany(companyName) {
  const response = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(
      companyName + " company"
    )}&api_key=${process.env.SERPAPI_KEY}`
  );
  const data = await response.json();

  return {
    website: data.organic_results?.[0]?.link,
    snippets: data.organic_results?.slice(0, 3).map((r) => r.snippet) || [],
  };
}

async function scrapeWebsite(url) {
  if (!url) return "";

  try {
    const response = await fetch(url);
    const html = await response.text();

    const text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 1500);

    return text;
  } catch (error) {
    return "";
  }
}

async function generateResearch(
  company,
  searchResults,
  websiteContent,
  techStack,
  services,
  techStackFocus
) {

  const prompt = `
You are an experienced sales researcher analyzing the company: ${company}.

The services you sell are: ${services.join(", ")}.

Company data snippets:
${searchResults.snippets.join("\n")}

Website content:
${websiteContent}

Tech stack data:
${techStack ? JSON.stringify(techStack) : "Unknown"}

Please analyze their setup and provide a JSON response in EXACTLY this format, with no extra text or commentary:

{
  "companyOverview": "Brief factual overview of what the company does and their business model.",
  "techStackAnalysis": {
    ${techStackFocus.join(
      ", "
    )} - based on the tech stack data provided return true or null values
    "techStackOverview": "Summary of their technology stack and usage."
  },
  "talkingPoints": [
    {
      "text": "Factual observation about their customer service setup, tied to techStack (e.g., liveChat) or websiteContent. Include recommendations if gaps exist.",
      "priority": "high|medium|low",
      "relatedTech": "TechStackFocus value (e.g., LIVE_CHAT) or null"
    },
    {
      "text": "Specific observation about lead generation or sales process, citing techStack or searchData. Suggest improvements based on services sold.",
      "priority": "high|medium|low",
      "relatedTech": "TechStackFocus value (e.g., EMAIL_MARKETING) or null"
    },
    {
      "text": "Insight on automation opportunities, explicitly linked to missing or present techStackFocus (e.g., no CRM detected).",
      "priority": "high|medium|low",
      "relatedTech": "TechStackFocus value (e.g., CRM) or null"
    },
    {
      "text": "Additional point on business size/growth or other key insight, if data supports it. Omit if no new information.",
      "priority": "high|medium|low",
      "relatedTech": "TechStackFocus value or null"
    }
  ],
  "leadScore": 0 to 100 // Integer score representing fit for services.
  "leadScoreExplanation": "Explanation of how the lead score is calculated based on the provided data."
}

IMPORTANT: Return ONLY valid JSON DO NOT INCLUDE BACKTICKS. Generate 3-5 talkingPoints based on data availability; omit if insufficient info.
`;
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 4096,
          temperature: 0.1,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Groq API error: ${response.status} - ${
          data.error?.message || "Unknown error"
        }`
      );
    }

    if (!data.choices || !data.choices[0]) {
      throw new Error(
        `Invalid response format from Groq: ${JSON.stringify(data)}`
      );
    }

    // Parse the JSON response from AI
    const aiResponse = data.choices[0].message.content.trim();
    console.log("AI Response:", aiResponse);

    try {
      const jsonResponse = JSON.parse(aiResponse);
      return jsonResponse;
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", aiResponse);
      // Fallback if JSON parsing fails
      return {
        companyOverview: `Research completed for ${company}`,
        talkingPoints: [
          "Contact for more details about automation opportunities",
        ],
        leadScore: { score: 5, reason: "Unable to parse detailed analysis" },
      };
    }
  } catch (error) {
    console.error("Error in generateResearch:", error);
    return {
      companyOverview: `Research failed for ${company}`,
      talkingPoints: ["Manual research required"],
      leadScore: { score: 0, reason: "Research API error" },
    };
  }
}

export async function GET(req, { params }) {
  const { orgId, leadId } = await params;
  const { userId: clerkId } = await auth();
  if (!orgId || !leadId) {
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });
  }
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
  }

  try {
    await validateOrgAccess(clerkId, orgId);
    const research = await prisma.research.findFirst({
      where: {
        leadId: leadId,
      },
      select: {
        research: true,
      },
    });

    // Fix: Handle the case when no research is found
    return NextResponse.json(research?.research || null, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
