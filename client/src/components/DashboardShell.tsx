import { Redirect, Route, Switch } from "wouter";
import DashboardLayout from "./DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import DashboardContent from "@/pages/DashboardContent";
import DashboardBlogs from "@/pages/DashboardBlogs";
import DashboardProducts from "@/pages/DashboardProducts";
import DashboardGallery from "@/pages/DashboardGallery";
import DashboardBlogComments from "@/pages/DashboardBlogComments";
import DashboardMedia from "@/pages/DashboardMedia";
import DashboardSettings from "@/pages/DashboardSettings";
import useAuthReq from "@/hooks/useAuthReq";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function DashboardShell() {
  const { isSignedIn, isClerkLoaded } = useAuthReq();
  const { data, isLoading } = useUserRole();
  const hasShownToast = useRef(false);
  if (!isClerkLoaded) {
    return null;
  }
  if (!isSignedIn) {
    return <Redirect to="/pamik-sign-in" />;
  }
  if (isLoading) {
    return null;
  }
  if (data?.role !== "admin") {
    if (!hasShownToast.current) {
      hasShownToast.current = true;
      toast.error("Admin access required");
    }
    return <Redirect to="/pamik-sign-in" />;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/content" component={DashboardContent} />
        <Route path="/dashboard/products" component={DashboardProducts} />
        <Route path="/dashboard/blogs" component={DashboardBlogs} />
        <Route path="/dashboard/comments" component={DashboardBlogComments} />
        <Route path="/dashboard/media" component={DashboardMedia} />
        <Route path="/dashboard/settings" component={DashboardSettings} />
        <Route path="/dashboard/gallery" component={DashboardGallery} />
      </Switch>
    </DashboardLayout>
  );
}
