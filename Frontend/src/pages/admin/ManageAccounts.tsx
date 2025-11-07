import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getUsersPaged } from "@/services/userService";
import type { UserItem } from "@/types/user";

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

  // paging
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  const filtered = useMemo(() => users, [users]);
  const startIndex = (pageNumber - 1) * pageSize;

  function goto(p: number) {
    if (p < 1 || p > totalPages) return;
    setPageNumber(p);
  }

  // TODO: hook up khi bạn sẵn sàng
  function onDetails(_u: UserItem) {}
  function onEdit(_u: UserItem) {}
  function onDelete(_u: UserItem) {}

  return (
    <div>
      <h1 className="text-3xl font-bold mb-1">Admin</h1>

      <Card className="mt-8 shadow-sm border border-neutral-200/80 rounded-2xl">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">Manage Accounts</CardTitle>
            <p className="text-sm text-neutral-500">
              Manage users in real-time. Follow business rules and keep clear audit logs.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
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

                {/* Header “Actions” căn giữa và cố định bề rộng */}
                <TableHead className="pr-4 md:pr-6 w-[280px]">
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
                filtered.map((u, idx) => (
                  <TableRow key={u.userId} className="hover:bg-neutral-50 transition-colors">
                    <TableCell className="pl-4 md:pl-6">{startIndex + idx + 1}</TableCell>
                    <TableCell className="font-medium">{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <StatusPill status={u.status} />
                    </TableCell>

                    {/* Hàng nút căn giữa, không wrap, khớp bề rộng với header */}
                    <TableCell className="pr-4 md:pr-6 w-[280px]">
                      <div className="mx-auto flex items-center justify-center gap-2 whitespace-nowrap min-w-[280px]">
                        <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => onDetails(u)}>
                          Details
                        </Button>
                        <Button variant="secondary" size="sm" className="rounded-lg" onClick={() => onEdit(u)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="rounded-lg" onClick={() => onDelete(u)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t">
            <div className="text-sm text-neutral-500">
              {totalCount > 0
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
    </div>
  );
}
