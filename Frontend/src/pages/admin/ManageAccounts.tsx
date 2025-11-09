// src/pages/admin/ManageAccounts.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { getUsersPaged, getUser, deleteUser } from "@/services/userService";
import type { UserItem } from "@/types/user";
import UserDetailsDialog from "@/components/admin/UserDetailsDialog";
import EditAccountDialog from "@/components/admin/EditAccountDialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import NewUserDialog from "@/components/admin/NewUserDialog";

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
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);

  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Details dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsId, setDetailsId] = useState<number | string | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  // Delete confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [targetUser, setTargetUser] = useState<UserItem | null>(null);

  // New user dialog
  const [newOpen, setNewOpen] = useState(false);

  // Debounce search (GIỮ nguyên hoa-thường & dấu)
  const [qDebounced, setQDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Từ khoá đổi -> về trang 1
  useEffect(() => {
    setPageNumber(1);
  }, [qDebounced]);

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

  // STRICT prefix search (case/diacritics-sensitive)
  const filtered = useMemo(() => {
    const q = qDebounced;
    if (!q) return users;

    const startsWith = (val: unknown) =>
      typeof val === "string"
        ? val.startsWith(q)
        : typeof val === "number"
        ? String(val).startsWith(q)
        : false;

    return users.filter((u) => {
      return (
        startsWith(u.fullName) ||
        startsWith(u.email) ||
        startsWith(u.role) ||
        startsWith(u.status) ||
        startsWith(u.phoneNumber) ||
        startsWith(u.gender) ||
        (u.birthYear != null && startsWith(u.birthYear))
      );
    });
  }, [users, qDebounced]);

  // Cắt trang khi search (client-side)
  const startIndex = (pageNumber - 1) * pageSize;
  const pagesForView = qDebounced ? Math.max(1, Math.ceil(filtered.length / pageSize)) : totalPages;

  const paged = useMemo(() => {
    if (!qDebounced) return users; // không search: dùng trang từ BE
    const begin = (pageNumber - 1) * pageSize;
    return filtered.slice(begin, begin + pageSize);
  }, [filtered, qDebounced, pageNumber, users]);

  const goto = (p: number) => {
    if (p >= 1 && p <= pagesForView) setPageNumber(p);
  };

  // Details
  function onDetails(u: UserItem) {
    setDetailsId(u.userId);
    setDetailsOpen(true);
  }
  function closeDetails() {
    setDetailsOpen(false);
    setDetailsId(null);
  }

  // Edit
  async function onEdit(u: UserItem) {
    try {
      const full = await getUser(u.userId); // lấy đủ phone/gender/birthYear/...
      setEditUser(full);
    } catch {
      setEditUser(u);
    } finally {
      setEditOpen(true);
    }
  }

  // Delete
  function askDelete(u: UserItem) {
    setTargetUser(u);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!targetUser) return;
    try {
      setDeleting(true);
      await deleteUser(targetUser.userId);
      setConfirmOpen(false);
      setTargetUser(null);
      await load();
    } catch {
      setConfirmOpen(false);
      setTargetUser(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Admin</h1>

      <Card className="mt-6 rounded-2xl">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-[220px]">
            <CardTitle className="text-xl">Manage Accounts</CardTitle>
            <p className="text-sm text-neutral-500">
              Manage users in real-time. Follow business rules and keep clear audit logs.
            </p>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search (prefix, case-sensitive)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 rounded-xl"
              />
            </div>
          </div>

          {/* Nút New User canh phải */}
          <div className="min-w-[140px] flex justify-end">
            <Button className="rounded-lg gap-2" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              New User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/70">
              <TableRow>
                <TableHead className="w-[90px] pl-4 md:pl-6">Number</TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4 md:pr-6 w-[300px]">
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

              {!loading && !error && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-neutral-500">
                    No users found.
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                !error &&
                paged.map((u, idx) => (
                  <TableRow key={u.userId} className="hover:bg-neutral-50">
                    <TableCell className="pl-4 md:pl-6">
                      {qDebounced ? (pageNumber - 1) * pageSize + idx + 1 : startIndex + idx + 1}
                    </TableCell>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <StatusPill status={u.status} />
                    </TableCell>
                    <TableCell className="pr-4 md:pr-6">
                      <div className="mx-auto flex items-center justify-center gap-2 whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => onDetails(u)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => onEdit(u)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => askDelete(u)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* footer/pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t">
            <div className="text-sm text-neutral-500">
              {loading
                ? ""
                : qDebounced
                ? `Found ${filtered.length} result${filtered.length === 1 ? "" : "s"}`
                : totalCount > 0
                ? `Showing ${startIndex + 1}–${Math.min(startIndex + users.length, totalCount)} of ${totalCount}`
                : ""}
            </div>

            {pagesForView > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg"
                  disabled={pageNumber === 1}
                  onClick={() => goto(pageNumber - 1)}
                >
                  Prev
                </Button>

                {Array.from({ length: pagesForView }).slice(0, 7).map((_, i) => {
                  const n = i + 1;
                  const active = n === pageNumber;
                  return (
                    <Button
                      key={n}
                      size="sm"
                      variant={active ? "default" : "secondary"}
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
                  disabled={pageNumber === pagesForView}
                  onClick={() => goto(pageNumber + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      {detailsOpen && (
        <UserDetailsDialog open={detailsOpen} userId={detailsId} onClose={closeDetails} />
      )}

      {/* Edit */}
      <EditAccountDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editUser}
        onSaved={async () => {
          setEditOpen(false);
          await load();
        }}
      />

      {/* Create */}
      <NewUserDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={async () => {
          setNewOpen(false);
          // Sau khi tạo, về trang 1 để dễ thấy user mới (tùy BE sắp xếp)
          if (pageNumber !== 1) setPageNumber(1);
          await load();
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(v) => !deleting && setConfirmOpen(v)}
        title="Remove user"
        message={
          <span>
            Are you sure you want to remove this user from the list?
            {targetUser && (
              <>
                <br />
                <b>{targetUser.fullName}</b> ({targetUser.email})
              </>
            )}
          </span>
        }
        confirmText="Yes"
        cancelText="No"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
