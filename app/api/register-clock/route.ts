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
        // First check if user already has a clock
        const existingClock = await prisma.clock.findFirst({
            where: {
                userId: session.user.id
            }
        });

        if (existingClock) {
            return NextResponse.json(
                { error: 'You have already registered a clock' },
                { status: 400 }
            );
        }

        const { clockId } = await req.json();

        // Check if clock ID is already registered by someone else
        const clockExists = await prisma.clock.findUnique({
            where: { id: clockId }
        });

        if (clockExists) {
            return NextResponse.json(
                { error: 'This Clock ID is already registered' },
                { status: 400 }
            );
        }

        // Create new clock
        const clock = await prisma.clock.create({
            data: {
                id: clockId,
                userId: session.user.id,
                displayValue: '0'
            }
        });

        return NextResponse.json({
            success: true,
            clock
        });

    } catch (error) {
        console.error('Failed to register clock:', error);
        return NextResponse.json(
            { error: 'Failed to register clock' },
            { status: 500 }
        );
    }
}