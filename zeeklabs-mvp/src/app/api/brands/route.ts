import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().min(1).max(100),
  domain: z.string().optional(),
  alternateNames: z.array(z.string()).optional(),
  competitors: z
    .array(
      z.object({
        name: z.string().min(1),
        domain: z.string().optional(),
        source: z.enum(["ai", "manual"]).optional(),
      })
    )
    .max(5)
    .optional(),
});

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      where: { userId: session.user.id },
      include: { competitors: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(brands);
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = brandSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, domain, alternateNames, competitors } = validation.data;

    const brand = await prisma.brand.create({
      data: {
        userId: session.user.id,
        name,
        domain,
        alternateNames: alternateNames ? JSON.stringify(alternateNames) : null,
        competitors: competitors
          ? {
              create: competitors.map((c) => ({
                name: c.name,
                domain: c.domain,
                source: c.source ?? "ai",
              })),
            }
          : undefined,
      },
      include: { competitors: true },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
