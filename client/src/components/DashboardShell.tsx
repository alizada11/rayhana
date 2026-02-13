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
import DashboardContactMessages from "@/pages/DashboardContactMessages";
import DashboardNewsletter from "@/pages/DashboardNewsletter";
import useAuthReq from "@/hooks/useAuthReq";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import FullPageLoader from "./FullPageLoader";
import { useTranslation } from "react-i18next";

export default function DashboardShell() {
  const { t } = useTranslation();

  const { isSignedIn, isLoaded } = useAuthReq();
  const { data, isLoading } = useUserRole();
  const hasShownToast = useRef(false);
  if (!isLoaded) {
    return <FullPageLoader />;
  }
  if (!isSignedIn) {
    return <Redirect to="/login" />;
  }
  if (isLoading) {
    return null;
  }
  if (data?.role !== "admin") {
    if (!hasShownToast.current) {
      hasShownToast.current = true;
      toast.error(t("login_page.adminRequired", "Admin access required"));
    }
    return <Redirect to="/login" />;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/content" component={DashboardContent} />
        <Route
          path="/dashboard/contact-messages"
          component={DashboardContactMessages}
        />
        <Route path="/dashboard/products" component={DashboardProducts} />
        <Route path="/dashboard/blogs" component={DashboardBlogs} />
        <Route path="/dashboard/comments" component={DashboardBlogComments} />
        <Route path="/dashboard/media" component={DashboardMedia} />
        <Route path="/dashboard/settings" component={DashboardSettings} />
        <Route path="/dashboard/gallery" component={DashboardGallery} />
        <Route path="/dashboard/newsletter" component={DashboardNewsletter} />
      </Switch>
    </DashboardLayout>
  );
}
