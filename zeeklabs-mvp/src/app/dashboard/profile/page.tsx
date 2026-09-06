"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Calendar,
  Building2,
  Coins,
  Clock,
  ArrowLeft,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/contexts/brand-context";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  status: string;
  accessType: string | null;
  createdAt: string;
  approvedAt: string | null;
  credits: number;
  unlimitedCredits: boolean;
  brandsCount: number;
  analysisCount: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const { brands, credits, unlimitedCredits } = useBrand();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in-up">
      {/* Back Navigation */}
      <Link
        href="/dashboard/analysis"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to AI Visibility
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Your account details and usage information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-border overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
          <CardContent className="pt-0 -mt-10 text-center">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg mx-auto">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {session?.user?.name || "User"}
            </h2>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>

            <div className="mt-4 flex justify-center gap-2">
              {profile?.accessType && (
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {profile.accessType}
                </Badge>
              )}
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <Shield className="h-3 w-3 mr-1" />
                {profile?.status || "Active"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                  <p className="font-medium text-gray-900 truncate">{session?.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Credits</p>
                  <p className="font-medium text-gray-900">
                    {unlimitedCredits ? (
                      <span className="text-emerald-600">Unlimited</span>
                    ) : (
                      <>{credits ?? profile?.credits ?? 0} credits</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Brands Tracked</p>
                  <p className="font-medium text-gray-900">{brands?.length ?? profile?.brandsCount ?? 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                  <p className="font-medium text-gray-900">{formatDate(profile?.createdAt || null)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Account Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span className="text-sm text-gray-600">
                    Account created on {formatDate(profile?.createdAt || null)}
                  </span>
                </div>
                {profile?.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Beta access approved on {formatDate(profile.approvedAt)}
                    </span>
                  </div>
                )}
                {brands && brands.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-violet-600" />
                    <span className="text-sm text-gray-600">
                      Tracking {brands.length} brand{brands.length !== 1 ? "s" : ""}: {brands.map(b => b.name).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
