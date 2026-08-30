import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUserApproved, notifyUserRejected } from "@/lib/email";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  const resultUrl = new URL("/admin/action-result", origin);

  if (!token || (action !== "approve" && action !== "reject")) {
    resultUrl.searchParams.set("status", "invalid");
    return NextResponse.redirect(resultUrl);
  }

  const user = await prisma.user.findUnique({ where: { approvalToken: token } });

  if (!user || (user.approvalTokenExpires && user.approvalTokenExpires < new Date())) {
    resultUrl.searchParams.set("status", "invalid");
    return NextResponse.redirect(resultUrl);
  }

  const status = action === "approve" ? "APPROVED" : "REJECTED";

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
      approvalToken: null,
      approvalTokenExpires: null,
    },
  });

  if (status === "APPROVED") {
    await notifyUserApproved(updated);
  } else {
    await notifyUserRejected(updated);
  }

  resultUrl.searchParams.set("status", action === "approve" ? "approved" : "rejected");
  resultUrl.searchParams.set("email", updated.email);
  return NextResponse.redirect(resultUrl);
}
