"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt: string | null;
}

const STATUS_VARIANT: Record<AdminUser["status"], "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export function AdminUsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        await loadUsers();
      }
    } finally {
      setBusyId(null);
    }
  };

  const renderList = (list: AdminUser[]) => {
    if (isLoading) {
      return <p className="text-sm text-muted-foreground p-6">Loading...</p>;
    }
    if (list.length === 0) {
      return <p className="text-sm text-muted-foreground p-6">No users here.</p>;
    }
    return (
      <div className="divide-y">
        {list.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Requested {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={STATUS_VARIANT[user.status]}>{user.status}</Badge>
              {user.status !== "APPROVED" && (
                <Button
                  size="sm"
                  disabled={busyId === user.id}
                  onClick={() => handleAction(user.id, "approve")}
                >
                  Approve
                </Button>
              )}
              {user.status !== "REJECTED" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === user.id}
                  onClick={() => handleAction(user.id, "reject")}
                >
                  Reject
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const pending = users.filter((u) => u.status === "PENDING");
  const approved = users.filter((u) => u.status === "APPROVED");
  const rejected = users.filter((u) => u.status === "REJECTED");

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="m-4">
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">{renderList(pending)}</TabsContent>
          <TabsContent value="approved">{renderList(approved)}</TabsContent>
          <TabsContent value="rejected">{renderList(rejected)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
