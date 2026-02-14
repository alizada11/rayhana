import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useUsers, useUpdateUserAdmin, useDeleteUserAdmin } from "@/hooks/useUsers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/components/ConfirmProvider";
import { toast } from "sonner";
import {
  Edit,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  ShieldPlus,
  Trash2,
  User2,
} from "lucide-react";
import type { AdminUser, UserRole } from "@/lib/api";

type EditForm = {
  name: string;
  email: string;
  role: UserRole;
};

const roleBadge = (role: UserRole) =>
  role === "admin" ? (
    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
      Admin
    </Badge>
  ) : (
    <Badge variant="outline" className="border-slate-300 text-slate-700">
      Guest
    </Badge>
  );

const StatPill = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs text-foreground">
    <span className="font-semibold">{value}</span>
    <span className="text-muted-foreground">{label}</span>
  </div>
);

export default function DashboardUsers() {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useUsers({ search: debouncedSearch, role: roleFilter });

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const users = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );

  const updateMutation = useUpdateUserAdmin();
  const deleteMutation = useDeleteUserAdmin();

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<EditForm>({
    name: "",
    email: "",
    role: "guest",
  });

  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      role: user.role,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    const ok = await confirm({
      title: "Apply changes to this user?",
      description:
        "Updating profile details will take effect immediately. Please confirm you want to proceed.",
      confirmText: "Save changes",
      cancelText: "Cancel",
      tone: "default",
    });
    if (!ok) return;

    updateMutation.mutate(
      {
        id: editingUser.id,
        payload: {
          name: form.name,
          email: form.email,
          role: form.role,
        },
      },
      {
        onSuccess: () => {
          toast.success("User updated");
          setEditOpen(false);
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.error ?? "Failed to update user details";
          toast.error(message);
        },
      }
    );
  };

  const handlePromote = async (user: AdminUser) => {
    const ok = await confirm({
      title: `Promote ${user.name ?? user.email} to admin?`,
      description:
        "Admins can manage all content and other users. Make sure you trust this account.",
      confirmText: "Promote to admin",
      cancelText: "Cancel",
      tone: "default",
    });
    if (!ok) return;
    updateMutation.mutate(
      { id: user.id, payload: { role: "admin" } },
      {
        onSuccess: () => toast.success("User promoted to admin"),
        onError: () => toast.error("Promotion failed"),
      }
    );
  };

  const handleDelete = async (user: AdminUser) => {
    const stats = user.stats;
    const description = `This will remove the account and all related data:
- ${stats.gallerySubmissions} gallery submissions
- ${stats.galleryLikes} likes
- ${stats.blogPosts} blog posts
- ${stats.blogComments} blog comments
- ${stats.products} products
- ${stats.mediaAssets} media files
This cannot be undone.`;

    const ok = await confirm({
      title: `Delete ${user.name ?? user.email}?`,
      description,
      confirmText: "Delete user and data",
      cancelText: "Cancel",
      tone: "danger",
    });
    if (!ok) return;

    deleteMutation.mutate(user.id, {
      onSuccess: () => toast.success("User deleted"),
      onError: (err: any) => {
        const message = err?.response?.data?.error ?? "Failed to delete user";
        toast.error(message);
      },
    });
  };

  const isSaving = updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Promote admins, update profiles, and cleanly remove users with their
            contributions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            aria-label="Refresh users"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email"
              className="pl-9"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={value => setRoleFilter(value as "all" | UserRole)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="guest">Guests</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <StatPill label="Users" value={users.length} />
          <StatPill
            label="Admins"
            value={users.filter(u => u.role === "admin").length}
          />
          <StatPill
            label="Guests"
            value={users.filter(u => u.role === "guest").length}
          />
        </div>
      </div>

      {isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "Failed to load users. Please try again."}
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading users…</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No users found for this filter.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground px-4 py-3">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-3">Activity</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          <div className="divide-y divide-border">
            {users.map(user => (
              <div
                key={user.id}
                className="grid grid-cols-12 items-center px-4 py-4 hover:bg-muted/40 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name ?? user.email}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <User2 className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate">
                      {user.name || "Unnamed user"}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">{roleBadge(user.role)}</div>
                <div className="col-span-3 flex flex-wrap gap-2">
                  <StatPill label="Gallery" value={user.stats.gallerySubmissions} />
                  <StatPill label="Likes" value={user.stats.galleryLikes} />
                  <StatPill label="Blogs" value={user.stats.blogPosts} />
                  <StatPill label="Comments" value={user.stats.blogComments} />
                </div>
                <div className="col-span-2 text-sm text-muted-foreground">
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMM d, yyyy")
                    : "—"}
                </div>
                <div className="col-span-1 flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEdit(user)}
                    aria-label="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {user.role !== "admin" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handlePromote(user)}
                      aria-label="Promote to admin"
                    >
                      <ShieldPlus className="h-4 w-4 text-emerald-600" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(user)}
                    aria-label="Delete user"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {hasNextPage && (
            <div className="p-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Select
                value={form.role}
                onValueChange={value =>
                  setForm(prev => ({ ...prev, role: value as UserRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="guest">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-slate-500" />
                      <span>Guest</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
