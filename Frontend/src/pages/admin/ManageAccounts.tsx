// src/pages/admin/ManageAccounts.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { getUsersPaged, deleteUser } from "@/services/userService";
import type { UserItem } from "@/types/user";

// Dialogs
import { EditAccountDialog } from "@/pages/admin/components";
import ConfirmDialog from "@/pages/admin/components/ConfirmDialog";
import NewUserDialog from "@/pages/admin/components/NewUserDialog";

function StatusPill({ status }: { status: "Active" | "Disabled" }) {
  const cls =
    status === "Active"
      ? "text-green-700 bg-green-100 border-green-200"
      : "text-amber-700 bg-amber-100 border-amber-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function ManageAccounts() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);

  // paging
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  // new user dialog
  const [newOpen, setNewOpen] = useState(false);

  // busy + confirm delete
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [target, setTarget] = useState<UserItem | null>(null);

  // debounce search
  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsersPaged({ pageNumber, pageSize, q: qDebounced || undefined });
      setUsers(res.items);
      setTotalPages(res.totalPages);
      setTotalCount(res.totalCount);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load users");
      setUsers([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, qDebounced]);

  // 🔎 Fallback filter client-side
  const filtered = useMemo(() => {
    const q = qDebounced.toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const hay = [u.fullName ?? "", u.email ?? "", u.role ?? "", u.status ?? ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [users, qDebounced]);

  const startIndex = (pageNumber - 1) * pageSize;

  function goto(p: number) {
    if (p < 1 || p > totalPages) return;
    setPageNumber(p);
  }

  // Handlers
  function onDetails(u: UserItem) {
    navigate(`/admin/accounts/${u.userId}`);
  }

  function onEdit(u: UserItem) {
    setEditUser(u);
    setEditOpen(true);
  }

  function onAskDelete(u: UserItem) {
    setTarget(u);
    setConfirmOpen(true);
  }

  async function doHardDelete() {
    if (!target) return;
    try {
      setBusyId(Number(target.userId));
      await deleteUser(target.userId);
      if (users.length === 1 && pageNumber > 1) setPageNumber(pageNumber - 1);
      await load();
      setConfirmOpen(false);
    } catch (e: any) {
      alert(e?.message ?? "Failed to permanently delete user.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Admin</h1>

      <Card className="mt-8 shadow-sm border border-neutral-200/80 rounded-2xl">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Title + desc */}
          <div className="min-w-[220px]">
            <CardTitle className="text-xl">Manage Accounts</CardTitle>
            <p className="text-sm text-neutral-500">Manage users in real-time. Follow business rules and keep clear audit logs.</p>
          </div>

          {/* Center: Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search by name, email, role…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPageNumber(1);
                }}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* Right: New User button */}
          <div className="min-w-[140px] flex justify-end">
            <Button onClick={() => setNewOpen(true)} className="rounded-lg gap-2">
              <Plus className="h-4 w-4" />
              New User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/70">
              <TableRow className="hover:bg-neutral-50">
                <TableHead className="w-[90px] pl-4 md:pl-6">Number</TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 md:pr-6 w-[360px]">
                  <div className="flex justify-center">Actions</div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-neutral-500">
                    Loading…
                  </TableCell>
                </TableRow>
              )}

              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-red-600">
                    {error}
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-neutral-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !error &&
                filtered.map((u, idx) => {
                  const isBusy = busyId === Number(u.userId);

                  return (
                    <TableRow key={u.userId} className="hover:bg-neutral-50 transition-colors">
                      <TableCell className="pl-4 md:pl-6">{startIndex + idx + 1}</TableCell>
                      <TableCell className="font-medium">{u.fullName}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <StatusPill status={u.status} />
                      </TableCell>
                      <TableCell className="pr-4 md:pr-6 w-[360px]">
                        <div className="mx-auto flex items-center justify-center gap-2 whitespace-nowrap min-w-[360px]">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => onDetails(u)}
                            disabled={isBusy}
                          >
                            Details
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => onEdit(u)}
                            disabled={isBusy}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => onAskDelete(u)}
                            disabled={isBusy}
                            title="Permanently delete this user"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t">
            <div className="text-sm text-neutral-500">
              {loading
                ? ""
                : qDebounced
                ? `Found ${filtered.length} result${filtered.length === 1 ? "" : "s"}`
                : totalCount > 0
                ? `Showing ${startIndex + 1}–${Math.min(startIndex + filtered.length, totalCount)} of ${totalCount}`
                : ""}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => goto(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
                  const n = i + 1;
                  const active = n === pageNumber;
                  return (
                    <Button
                      key={n}
                      variant={active ? "default" : "secondary"}
                      size="sm"
                      className={`rounded-lg ${active ? "" : "bg-white"}`}
                      onClick={() => goto(n)}
                    >
                      {n}
                    </Button>
                  );
                })}
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => goto(pageNumber + 1)}
                  disabled={pageNumber === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete account permanently"
        description="Are you sure you want to permanently delete this account?"
        confirmText="Yes"
        cancelText="Cancel"
        busy={busyId === Number(target?.userId)}
        onConfirm={doHardDelete}
      />

      {/* New user dialog */}
      <NewUserDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={async () => {
          setNewOpen(false);
          // làm mới danh sách sau khi tạo
          if (pageNumber !== 1) setPageNumber(1);
          await load();
        }}
      />

      {/* Edit dialog */}
      <EditAccountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editUser}
        onSaved={async () => {
          setEditOpen(false);
          await load();
        }}
      />
    </div>
  );
}
