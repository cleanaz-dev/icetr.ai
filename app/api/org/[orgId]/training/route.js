import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { validateHasPermission } from "@/lib/db/validations";

export async function POST(req, { params }) {
  try {
    const { userId } = await auth();
    const { orgId } = await params;
    const {
      name: trainingName,
      scenario,
      scripts,
      campaignId,
      voiceId,
      prompt,
      webhookUrl,
      customScripts,
    } = await req.json();

    console.log("userId:", userId);
    console.log("orgId:", orgId);
    console.log("trainingName:", trainingName);
    console.log("scenario:", scenario);
    console.log("scripts:", scripts);
    console.log("campaignId:", campaignId);
    console.log("voiceId:", voiceId);
    console.log("prompt:", prompt);
    console.log("webhookUrl:", webhookUrl);
    console.log("customScripts:", customScripts);
    // return NextResponse.json({ message: "Working on it!" }, { status: 200 });

    const campaignTraining = await prisma.campaignTraining.create({
      data: {
        campaign: { connect: { id: campaignId } },
        name: trainingName,
        webhookUrl: webhookUrl,
      },
    });

    const trainingScenarion = await prisma.trainingScenario.create({
      data: {
        training: { connect: { id: campaignTraining.id } },
        scripts: customScripts,
        description: scenario.description,
        level: scenario.difficulty,
        objectives: scenario.objectives,
        targetAudience: scenario.targetAudience,
        keyPoints: scenario.keyPoints,
        voiceId: voiceId,
        title: scenario.title,
        prompt: prompt,
      },
    });

    console.log("training-scenario", trainingScenarion);

    return NextResponse.json(
      { message: "Training payload received successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing training payload:", error);
    return NextResponse.json(
      { message: "An error occurred.", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { userId:clerkId } = await auth();
    const { orgId } = await params;

    const {
      trainingId: campaignTrainingId,
      scenario,
      action,
    } = await req.json();

    console.log("📦 Request Body:", {
      campaignTrainingId,
      scenario,
      action,
    });
    // return NextResponse.json(
    //   { message: `New Scenario created successfully!` },
    //   { status: 200 }
    // );

    validateHasPermission(clerkId, ['training.create'])
    if (scenario && action === "addScenario") {
      const newScenario = await prisma.trainingScenario.create({
        data: {
          training: { connect: { id: campaignTrainingId } },
          title: scenario.title,
          level: scenario.level,
          description: scenario.description,
          objectives: scenario.objectives,
          targetAudience: scenario.targetAudience,
          keyPoints: scenario.keyPoints,
          voiceId: scenario.voiceId,
          prompt: scenario.prompt,
          scripts: scenario.scripts,
        },
      });
      return NextResponse.json(
        { message: `New Scenario ${newScenario.title} created successfully!` },
        { status: 200 }
      );
    }

    if (campaignTrainingId && !scenario) {
      return NextResponse.json({ message: "Working on it!" }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
