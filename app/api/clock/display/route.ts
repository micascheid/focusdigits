// app/api/clock/display/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clockId = searchParams.get('clockId');

    if (!clockId) {
        return NextResponse.json(
            { error: 'Clock ID is required' },
            { status: 400 }
        );
    }

    try {
        const clock = await prisma.clock.findUnique({
            where: { id: clockId }
        });

        if (!clock) {
            return NextResponse.json(
                { error: 'Clock not found' },
                { status: 404 }
            );
        }

        // Return just the display value
        return NextResponse.json({ displayValue: clock.displayValue });

    } catch (error) {
        console.error('Failed to fetch clock display:', error);
        return NextResponse.json(
            { error: 'Server error' },
            { status: 500 }
        );
    }
}