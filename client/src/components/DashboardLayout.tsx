import { SignedIn, SignedOut, SignOutButton } from "@clerk/clerk-react";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  FileText,
  Mails,
  FilePenLine,
  MessageSquare,
  Images,
  Settings,
  Boxes,
  GalleryHorizontal,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useUser();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = (path: string) => `
    flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150
    ${
      location === path
        ? "bg-gray-900 text-white"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }
  `;

  const sidebarLinks: {
    path: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { path: "/dashboard", label: "Overview", Icon: LayoutDashboard },
    { path: "/dashboard/content", label: "Content", Icon: FileText },
    {
      path: "/dashboard/contact-messages",
      label: "Contact Messages",
      Icon: Mails,
    },
    { path: "/dashboard/blogs", label: "Blogs", Icon: FilePenLine },
    { path: "/dashboard/comments", label: "Comments", Icon: MessageSquare },
    { path: "/dashboard/media", label: "Media", Icon: Images },
    { path: "/dashboard/settings", label: "Settings", Icon: Settings },
    { path: "/dashboard/products", label: "Products", Icon: Boxes },
    { path: "/dashboard/gallery", label: "Gallery", Icon: GalleryHorizontal },
    { path: "/dashboard/newsletter", label: "Newsletter", Icon: Mails },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-16 px-5 flex items-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gray-900 text-white flex items-center justify-center text-sm font-semibold">
              RH
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">Rayhana</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map(link => (
            <Link
              key={link.path}
              href={link.path}
              className={linkClass(link.path)}
              onClick={() => setSidebarOpen(false)}
            >
              <link.Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-3 rounded-md bg-gray-100">
            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm">
              {user?.firstName?.[0] || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-md border border-gray-200 hover:bg-gray-100"
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-serif font-bold text-gray-900">
              {sidebarLinks.find(link => link.path === location)?.label ||
                "Dashboard"}
            </h1>
            <p className="hidden md:block text-xs text-gray-500">
              Manage content, media, and customers
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <SignedIn>
              <SignOutButton>
                <Link
                  to="#"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <LogOut className="w-5 h-5" />
                  Sign out
                </Link>
              </SignOutButton>
            </SignedIn>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-8 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-primary font-medium">Dashboard</span>
            {location !== "/dashboard" && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900">
                  {sidebarLinks.find(link => link.path === location)?.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[calc(100vh-240px)]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Rayhana</p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/help"
                className="hover:text-primary transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
