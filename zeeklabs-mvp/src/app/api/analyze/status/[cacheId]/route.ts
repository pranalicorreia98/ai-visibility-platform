import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Poll the status of an analysis job queued by POST /api/analyze.
 * The analysis-worker process (scripts/analysis-worker.ts) is what actually
 * moves a row from "pending" -> "processing" -> "success"/"failed".
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cacheId: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cacheId } = await params;

    const cacheEntry = await prisma.analysisCache.findUnique({
      where: { id: cacheId },
      include: { brand: { select: { userId: true } } },
    });

    if (!cacheEntry || cacheEntry.brand.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      status: cacheEntry.status,
      analysis: cacheEntry.status === "success" && cacheEntry.analysisData
        ? JSON.parse(cacheEntry.analysisData)
        : null,
      errorMessage: cacheEntry.errorMessage,
      meta: {
        provider: cacheEntry.actualProvider,
        duration: cacheEntry.durationMs,
        timestamp: cacheEntry.completedAt?.toISOString() ?? cacheEntry.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Analysis status error:", error);
    return NextResponse.json(
      { error: "Failed to get analysis status" },
      { status: 500 }
    );
  }
}
