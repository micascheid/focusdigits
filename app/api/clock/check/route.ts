import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clockId = searchParams.get('clockId');

    if (!clockId) {
        return NextResponse.json({ error: 'Clock ID is required' }, { status: 400 });
    }

    try {
        const clock = await prisma.clock.findFirst({
            where: {
                id: clockId,
                userId: session.user.id
            }
        });

        return NextResponse.json({ exists: !!clock });
    } catch (error) {
        console.error('Failed to check clock:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}