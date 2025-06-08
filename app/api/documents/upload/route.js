import { NextResponse } from "next/server";
import prisma from "@/lib/service/prisma";
import { auth } from "@clerk/nextjs/server";
import { uploadDocumentToS3 } from "@/lib/service/aws";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const campaignId = formData.get("campaignId");
    const category = formData.get("category");
    const description = formData.get("description") || null;

    if (!file || !campaignId || !category) {
      return NextResponse.json(
        { error: "Missing required fields: file, campaignId, category" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3 with original filename structure
    const s3Result = await uploadDocumentToS3({
      fileBuffer: buffer,
      originalFilename: file.name,
      DOCUMENTS_BUCKET: process.env.AWS_DOCUMENTS_BUCKET_NAME
    });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    const document = await prisma.campaignDocument.create({
      data: {
        campaign: { connect: { id: campaignId } },
        name: file.name,
        type: file.name.split(".").pop() || "unknown",
        category: category,
        description: description,
        fileUrl: s3Result,
        fileSize: file.size,
        mimeType: file.type,
        uploader: { connect: { id: user.id } },
      },
      include: {
        uploader: {
          select: {
            firstname: true,
            lastname: true,
            imageUrl: true
          }
        }
      }
    });

    return NextResponse.json({
      message: "Document uploaded successfully to S3",
      document: document,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error.message
      },
      { status: 500 }
    );
  }
}