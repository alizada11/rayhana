import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";
import { ConfirmProvider } from "./components/ConfirmProvider";
import FullPageLoader from "./components/FullPageLoader";

import Layout from "./components/Layout";
const DashboardShell = lazy(() => import("@/components/DashboardShell"));
const Home = lazy(() => import("@/pages/Home"));
const BlogIndex = lazy(() => import("@/pages/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const Privacy = lazy(() => import("./pages/Privacy"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const GuestDashboard = lazy(() => import("./pages/GuestDashboard"));
const Gallery = lazy(() => import("./pages/Gallery"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function GuestDashboardRoute() {
  const { isLoaded, isSignedIn } = useAuthReq();
  if (!isLoaded) return <FullPageLoader />;
  if (!isSignedIn) return <Redirect to="/login" />;
  return (
    <Layout>
      <GuestDashboard />
    </Layout>
  );
}

function Router() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Switch>
        {/* Public site */}
        <Route path="/">
          <Layout>
            <Home />
          </Layout>
        </Route>

        <Route path="/blog/:slug">
          <Layout>
            <BlogPost />
          </Layout>
        </Route>

        <Route path="/blog">
          <Layout>
            <BlogIndex />
          </Layout>
        </Route>
        <Route path="/products">
          <Layout>
            <Products />
          </Layout>
        </Route>

        <Route path="/about">
          <Layout>
            <About />
          </Layout>
        </Route>

        <Route path="/contact">
          <Layout>
            <Contact />
          </Layout>
        </Route>
        <Route path="/terms">
          <Layout>
            <Terms />
          </Layout>
        </Route>
        <Route path="/privacy">
          <Layout>
            <Privacy />
          </Layout>
        </Route>
        <Route path="/gallery">
          <Layout>
            <Gallery />
          </Layout>
        </Route>
        <Route path="/reset-password">
          <Layout>
            <ResetPassword />
          </Layout>
        </Route>
        <Route path="/verify-email">
          <Layout>
            <VerifyEmail />
          </Layout>
        </Route>
        <Route path="/help/:slug">
          <Layout>
            <HelpPage />
          </Layout>
        </Route>
        <Route path="/help">
          <Layout>
            <HelpCenter />
          </Layout>
        </Route>
        <Route path="/login">
          <Layout>
            <LoginPage />
          </Layout>
        </Route>
        <Route path="/profile">
          <Layout>
            <Profile />
          </Layout>
        </Route>
        <Route path="/my-submissions">
          <GuestDashboardRoute />
        </Route>

        {/* Dashboard group */}
        <Route path="/dashboard">
          <DashboardShell />
        </Route>
        <Route path="/dashboard/:rest*">
          <DashboardShell />
        </Route>

        <Route>
          <Layout>
            <NotFound />
          </Layout>
        </Route>
      </Switch>
    </Suspense>
  );
}

function App() {
  useUserSync();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ConfirmProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
