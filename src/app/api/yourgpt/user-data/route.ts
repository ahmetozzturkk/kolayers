import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// YourGPT Secret Key - Environment variable'dan alınmalı
const YOURGPT_SECRET_KEY = process.env.YOURGPT_SECRET_KEY || '';

export async function GET(request: NextRequest) {
  try {
    // Kullanıcının authenticate olup olmadığını kontrol et
    const userId = await verifyAuth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini veritabanından al
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // HMAC hash oluştur (email ile)
    const hmacData = user.email;
    const userHash = crypto
      .createHmac('sha256', YOURGPT_SECRET_KEY)
      .update(hmacData)
      .digest('hex');

    // YourGPT için kullanıcı verilerini hazırla
    const userData = {
      email: user.email,
      name: user.name || user.email.split('@')[0],
      ext_user_id: user.id,
      user_hash: userHash
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('YourGPT user data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
