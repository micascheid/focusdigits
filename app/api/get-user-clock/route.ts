// app/api/get-user-clock/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const clock = await prisma.clock.findFirst({
            where: {
                userId: session.user.id
            }
        });

        return NextResponse.json({
            clockId: clock?.id || null,
            displayValue: clock?.displayValue || null
        });
    } catch (error) {
        console.error('Failed to fetch user clock:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}