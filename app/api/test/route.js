// app/api/test-json/route.js
import redis from '@/lib/service/redis';
import { NextResponse } from 'next/server';

export async function GET() {
  const testData = {
    name: 'Welcome Campaign',
    type: 'email',
    status: 'active',
  };

  // Save JSON to Redis at root '$'
  await redis.json.set('campaign:welcome', '.', testData);

  // Retrieve the full object
  const value = await redis.json.get('campaign:welcome');

  return NextResponse.json({ value });
}
