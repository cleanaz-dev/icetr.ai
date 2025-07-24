import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/service/prisma";
import { uploadImageToS3 } from "@/lib/service/aws";

export async function POST(req, { params }) {
  const { userId } = await params;
  const { userId: clerkId } = await auth();

  try {
    // Verify authentication
    if (!clerkId) {
      return NextResponse.json(
        { message: "Unauthorized User" },
        { status: 401 }
      );
    }

    // Get form data
    const formData = await req.formData();
    const imageFile = formData.get("image");

    // Validate file exists
    if (!imageFile) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await imageFile.arrayBuffer());

    // Upload to S3
    const imageUrl = await uploadImageToS3({
      fileBuffer: buffer,
      originalFilename: imageFile.name,
      DOCUMENTS_BUCKET: process.env.AWS_DOCUMENTS_BUCKET_NAME,
      userId: clerkId,
    });

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { imageUrl: imageUrl },
      select: { imageUrl: true }, // Only return what you need
    });

    return NextResponse.json(
      { imageUrl: updatedUser.imageUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
