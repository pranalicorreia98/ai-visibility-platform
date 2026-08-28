import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const COPY = {
  approved: {
    icon: CheckCircle2,
    color: "text-green-600",
    title: "User approved",
    body: "They've been emailed and can now log in.",
  },
  rejected: {
    icon: XCircle,
    color: "text-destructive",
    title: "User rejected",
    body: "Their access request has been declined.",
  },
  invalid: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    title: "Link no longer valid",
    body: "This approval link is invalid, expired, or was already used.",
  },
} as const;

export default async function ActionResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; email?: string }>;
}) {
  const { status, email } = await searchParams;
  const copy = COPY[status as keyof typeof COPY] ?? COPY.invalid;
  const Icon = copy.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <Icon className={`h-12 w-12 mx-auto ${copy.color}`} />
        <h1 className="text-2xl font-bold">{copy.title}</h1>
        <p className="text-muted-foreground">
          {email ? `${email} — ` : ""}
          {copy.body}
        </p>
      </div>
    </div>
  );
}
