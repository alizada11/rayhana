import { ReactNode } from "react";
import { Link, useLocation } from "wouter";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();

  const linkClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
    ${
      location === path
        ? "bg-primary/10 text-primary font-medium border-l-4 border-primary"
        : "text-gray-600 hover:bg-secondary/10 hover:text-gray-900"
    }
  `;

  const sidebarLinks = [
    { path: "/dashboard", label: "Overview", icon: "📊" },
    { path: "/dashboard/blogs", label: "Blogs", icon: "📝" },
    { path: "/dashboard/products", label: "Products", icon: "📦" },
    { path: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Brand */}
        <div className="h-20 px-6 flex items-center border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-gray-900">
                Rayhana
              </h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map(link => (
            <Link
              key={link.path}
              href={link.path}
              className={linkClass(link.path)}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/10">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground truncate">
                admin@rayhana.com
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif font-bold text-gray-900">
              {sidebarLinks.find(link => link.path === location)?.label ||
                "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your content and products
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <span className="text-lg relative">
                🔔
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </span>
            </button>

            {/* Search */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="w-48 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>

            {/* Quick Actions */}
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
              + New
            </button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
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
        <main className="flex-1 p-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[calc(100vh-280px)]">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Rayhana. All rights reserved.</p>
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
