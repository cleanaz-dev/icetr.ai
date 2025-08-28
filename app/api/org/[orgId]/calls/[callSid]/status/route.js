import { getCallStatus } from '@/lib/services/integrations/redis';
import { NextResponse } from 'next/server';


export async function GET(_req, { params }) {
  const { callSid } = await params;
  const { status, duration } = await getCallStatus(callSid);
  return NextResponse.json({ status, duration });
}