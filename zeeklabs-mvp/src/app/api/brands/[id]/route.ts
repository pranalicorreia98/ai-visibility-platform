import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateBrandSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  domain: z.string().optional(),
  alternateNames: z.array(z.string()).optional(),
  competitors: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1),
        domain: z.string().optional(),
      })
    )
    .max(5)
    .optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const brand = await prisma.brand.findFirst({
      where: { id, userId: session.user.id },
      include: { competitors: true },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = updateBrandSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check ownership
    const existingBrand = await prisma.brand.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const { name, domain, alternateNames, competitors } = validation.data;

    // Update brand
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(domain !== undefined && { domain }),
        ...(alternateNames !== undefined && {
          alternateNames: JSON.stringify(alternateNames),
        }),
      },
    });

    // Update competitors if provided
    if (competitors !== undefined) {
      // Delete existing competitors
      await prisma.competitor.deleteMany({ where: { brandId: id } });

      // Create new competitors
      if (competitors.length > 0) {
        await prisma.competitor.createMany({
          data: competitors.map((c) => ({
            brandId: id,
            name: c.name,
            domain: c.domain,
          })),
        });
      }
    }

    // Fetch updated brand with competitors
    const updatedBrand = await prisma.brand.findUnique({
      where: { id },
      include: { competitors: true },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingBrand = await prisma.brand.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
