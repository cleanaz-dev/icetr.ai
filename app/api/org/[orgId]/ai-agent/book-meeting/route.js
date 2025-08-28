import { NextResponse } from "next/server";
import { sendBookingEmail } from "@/lib/services/integrations/resend";
import prisma from "@/lib/prisma";
import { createHapioBookingRequest, getHapioCurrentBookingsAndSetCache } from "@/lib/services/integrations/hapio";
import { createZoomMeeting } from "@/lib/services/integrations/zoom";

export async function POST(request, { params }) {
  const { orgId } = await params;
  if (!orgId)
    return NextResponse.json({ message: "Invalid Request" }, { status: 400 });

  const body = await request.json();
  const { email, selected_time, slot_data, lead_id, hapio_config } = body;
  const hapioIds = {
    resourceId: hapio_config.resourceId,
    serviceId: hapio_config.serviceId,
    locationId: hapio_config.locationId,
  }
  console.log("✅ slot data:", slot_data, "✅ hapioIds", hapioIds);
  
  console.log("Booking request received:", body);

  try {
    // Step 1: Update lead with email in transaction
    const leadInfo = await prisma.lead.update({
      where: {
        id: lead_id,
      },
      data: {
        email: email,
        status: "MEETING_SCHEDULED"
      },
      select: {
        name: true,
        company: true,
        website: true,
        orgId: true,
        organization: {
          select: {
            name: true,
          }
        },
        campaignId: true,
      },
    });



    // Step 2: Create Hapio booking first
    const hapioResponse = await createHapioBookingRequest({
      slotData: slot_data,
      leadInfo: leadInfo,
      hapioIds: hapioIds,
    });

    console.log("Hapio booking created:", hapioResponse);

    // Step 3: Create Zoom meeting
     const zoomMeeting = await createZoomMeeting({
      start_time: slot_data.starts_at,
      service: "Consulation",
      name: leadInfo.name || "N/A",
      company: leadInfo.company || "N/A",
      email: leadInfo.email,
    });
    console.log("zoom meeting created:", zoomMeeting);

    // Step 4: Create booking in DB with hapioId
    const booking = await prisma.booking.create({
      data: {
        lead: { connect: { id: lead_id } },
        campaign: { connect: { id: leadInfo.campaignId } },
        bookingData: slot_data,
        scheduledAt: selected_time,
        bookedByAi: true,
        hapioBookingId: hapioResponse.id,
        zoomUrl: zoomMeeting.join_url,
      },
    });

    // Step 5: Send confirmation email
    await sendBookingEmail({
      to: email,
      leadName: leadInfo.name,
      bookingTime: selected_time,
      bookingId: booking.id,
      orgName: leadInfo.organization.name,
      duration: 30,
      joinUrl: zoomMeeting.join_url,
    });



    // // Step 6: Get Current bookings for Hapio
      getHapioCurrentBookingsAndSetCache(hapioIds, orgId)
      .then(() => {
        console.log("✅ Hapio cache updated successfully");
      })
      .catch((error) => {
        console.error("⚠️ Failed to update Hapio cache (non-critical):", error.message);
        // You could also log this to your error tracking service
      });


  


    return NextResponse.json({ 
      success: true,
      message: "Booking created successfully",
      bookingId: booking.id,
      hapioId: hapioResponse.id
    }, { status: 200 });

  } catch (error) {
    console.error("Booking error:", error.message);
        
    return NextResponse.json({ 
      error: "Failed to create booking",
      details: error.message 
    }, { status: 500 });
  }
}