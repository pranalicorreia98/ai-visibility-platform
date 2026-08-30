import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { notifyUserApproved, notifyUserRejected } from "@/lib/email";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = actionSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const status = body.data.action === "approve" ? "APPROVED" : "REJECTED";

  const user = await prisma.user.update({
    where: { id },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      approvalToken: null,
      approvalTokenExpires: null,
    },
  });

  if (status === "APPROVED") {
    await notifyUserApproved(user);
  } else {
    await notifyUserRejected(user);
  }

  return NextResponse.json({ user });
}
