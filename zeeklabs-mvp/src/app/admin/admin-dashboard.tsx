"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Gift,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  Loader2,
  Mail,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  accessType: string | null;
  createdAt: string;
  approvedAt: string | null;
}

interface BetaRequest {
  id: string;
  email: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt: string | null;
}

interface AllowlistEntry {
  id: string;
  email: string;
  createdAt: string;
  usedAt: string | null;
}

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [betaRequests, setBetaRequests] = useState<BetaRequest[]>([]);
  const [allowlist, setAllowlist] = useState<AllowlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [addResult, setAddResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, betaRes, allowlistRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/beta-requests"),
        fetch("/api/admin/allowlist"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
      if (betaRes.ok) {
        const data = await betaRes.json();
        setBetaRequests(data.betaRequests);
      }
      if (allowlistRes.ok) {
        const data = await allowlistRes.json();
        setAllowlist(data.allowlist);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserAction = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleAddToAllowlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || addingEmail) return;

    setAddingEmail(true);
    setAddResult(null);

    try {
      const res = await fetch("/api/admin/allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), sendMagicLink: true }),
      });
      const data = await res.json();
      setAddResult(data);
      if (data.success) {
        setNewEmail("");
        await loadData();
      }
    } catch {
      setAddResult({ success: false, message: "Something went wrong" });
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveFromAllowlist = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/allowlist?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      setBusyId(null);
    }
  };

  // Stats
  const pendingBetaRequests = betaRequests.filter((r) => r.status === "PENDING").length;
  const pendingUsers = users.filter((u) => u.status === "PENDING").length;
  const approvedUsers = users.filter((u) => u.status === "APPROVED").length;
  const betaUsers = users.filter((u) => u.accessType === "BETA").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingBetaRequests}</p>
                <p className="text-sm text-muted-foreground">Beta Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100">
                <Gift className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allowlist.length}</p>
                <p className="text-sm text-muted-foreground">Allowlisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{betaUsers}</p>
                <p className="text-sm text-muted-foreground">Beta Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="beta-requests" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="beta-requests" className="gap-2">
            <Gift className="h-4 w-4" />
            Beta Requests ({pendingBetaRequests})
          </TabsTrigger>
          <TabsTrigger value="allowlist" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Allowlist ({allowlist.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            All Users ({users.length})
          </TabsTrigger>
        </TabsList>

        {/* Beta Requests Tab */}
        <TabsContent value="beta-requests">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Beta Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : betaRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No beta requests yet.</p>
              ) : (
                <div className="divide-y">
                  {betaRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium">{request.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            request.status === "PENDING"
                              ? "warning"
                              : request.status === "APPROVED"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {request.status}
                        </Badge>
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              onClick={async () => {
                                setBusyId(request.id);
                                window.location.href = `/api/beta-request/approve?email=${encodeURIComponent(request.email)}&action=approve`;
                              }}
                              disabled={busyId === request.id}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                setBusyId(request.id);
                                window.location.href = `/api/beta-request/approve?email=${encodeURIComponent(request.email)}&action=reject`;
                              }}
                              disabled={busyId === request.id}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allowlist Tab */}
        <TabsContent value="allowlist">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Beta Allowlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Email Form */}
              <form onSubmit={handleAddToAllowlist} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email to allowlist"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={addingEmail || !newEmail.trim()}>
                  {addingEmail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add & Send Link
                    </>
                  )}
                </Button>
              </form>

              {addResult && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    addResult.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {addResult.message}
                </div>
              )}

              {/* Allowlist Table */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : allowlist.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No allowlisted emails yet. Add one above.
                </p>
              ) : (
                <div className="divide-y border rounded-lg">
                  {allowlist.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entry.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Added {new Date(entry.createdAt).toLocaleDateString()}
                            {entry.usedAt && (
                              <span className="text-green-600 ml-2">
                                • Activated {new Date(entry.usedAt).toLocaleDateString()}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.usedAt ? (
                          <Badge variant="success">Activated</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveFromAllowlist(entry.id)}
                          disabled={busyId === entry.id}
                        >
                          {busyId === entry.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No users yet.</p>
              ) : (
                <div className="divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.email}</p>
                          {user.accessType && (
                            <Badge variant="outline" className="text-xs">
                              {user.accessType}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user.status === "PENDING"
                              ? "warning"
                              : user.status === "APPROVED"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                        {user.status !== "APPROVED" && (
                          <Button
                            size="sm"
                            onClick={() => handleUserAction(user.id, "approve")}
                            disabled={busyId === user.id}
                          >
                            Approve
                          </Button>
                        )}
                        {user.status !== "REJECTED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserAction(user.id, "reject")}
                            disabled={busyId === user.id}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
