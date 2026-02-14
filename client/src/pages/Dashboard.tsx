import { Link } from "wouter";
import {
  ArrowRight,
  FileText,
  Images,
  LayoutDashboard,
  Mail,
  Users,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function Dashboard() {
  const quickLinks = [
    { href: "/dashboard/content", label: "Content", icon: FileText },
    { href: "/dashboard/media", label: "Media", icon: Images },
    { href: "/dashboard/newsletter", label: "Newsletter", icon: Mail },
    { href: "/dashboard/gallery", label: "Gallery", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Users", icon: Users },
  ];

  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Admin Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quickly jump to the areas you manage most often.
          </p>
        </div>
        <Link
          href="/dashboard/content"
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Go to content
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-xl border border-border bg-card p-4 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted/80 text-foreground flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Manage</p>
                <p className="text-lg font-semibold text-foreground group-hover:text-foreground/90">
                  {item.label}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          At a glance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users", value: stats?.users ?? 0 },
            { label: "Blogs", value: stats?.blogs ?? 0 },
            { label: "Gallery Submissions", value: stats?.gallery ?? 0 },
            { label: "Newsletter Subs", value: stats?.newsletter ?? 0 },
          ].map(card => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-muted px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold text-foreground">
                {isLoading ? "…" : card.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
