import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        status: true,
        accessType: true,
        createdAt: true,
        approvedAt: true,
        credits: true,
        _count: {
          select: {
            brands: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get analysis count (number of cached analysis results)
    const analysisCount = await prisma.analysisCache.count({
      where: {
        brand: {
          userId: session.user.id,
        },
      },
    });

    // Admins have unlimited credits
    const unlimitedCredits = isAdminEmail(user.email);

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      status: user.status,
      accessType: user.accessType,
      createdAt: user.createdAt.toISOString(),
      approvedAt: user.approvedAt?.toISOString() || null,
      credits: user.credits,
      unlimitedCredits,
      brandsCount: user._count.brands,
      analysisCount,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
