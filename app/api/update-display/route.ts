import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { clockId, displayValue } = await req.json();

        // Validate inputs
        if (!clockId || displayValue === undefined) {
            return NextResponse.json(
                { error: 'Clock ID and display value are required' },
                { status: 400 }
            );
        }

        // Get the clock and verify ownership
        const clock = await prisma.clock.findFirst({
            where: {
                id: clockId,
                userId: session.user.id
            }
        });

        if (!clock) {
            return NextResponse.json(
                { error: 'Clock not found or unauthorized' },
                { status: 404 }
            );
        }

        // Update the display value
        const updatedClock = await prisma.clock.update({
            where: { id: clockId },
            data: {
                displayValue: displayValue.toString(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            clock: updatedClock
        });

    } catch (error) {
        console.error('Failed to update display:', error);
        return NextResponse.json(
            { error: 'Failed to update display value' },
            { status: 500 }
        );
    }
}