import { Redirect, Route, Switch } from "wouter";
import DashboardLayout from "./DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import DashboardBlogs from "@/pages/DashboardBlogs";
import DashboardProducts from "@/pages/DashboardProducts";
import useAuthReq from "@/hooks/useAuthReq";

export default function DashboardShell() {
  const { isSignedIn } = useAuthReq();

  if (!isSignedIn) {
    return <Redirect to="/pamik-sign-in" />;
  }

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/products" component={DashboardProducts} />
        <Route path="/dashboard/blogs" component={DashboardBlogs} />
      </Switch>
    </DashboardLayout>
  );
}
