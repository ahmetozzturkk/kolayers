import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secretKey = process.env.YOURGPT_SECRET_KEY;
  
  return NextResponse.json({
    hasSecretKey: !!secretKey,
    secretKeyLength: secretKey?.length || 0,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}
