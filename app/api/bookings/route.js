export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';
import { computeFare } from '@/lib/fare';
import { validateBooking } from '@/lib/validate';

export async function POST(req) {
  try {
    const body = await req.json();
    const { valid, errors, data } = validateBooking(body);
    if (!valid) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const fareINR = computeFare(data);
    const db = getDb();
    const doc = await db.collection('bookings').add({
      ...data,
      fareINR,
      status: 'new',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      bookingId: doc.id,
      fareINR,
      status: 'received',
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
