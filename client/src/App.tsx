import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Redirect, Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import DashboardShell from "@/components/DashboardShell";
import Home from "@/pages/Home";
import BlogIndex from "@/pages/BlogIndex";
import BlogPost from "@/pages/BlogPost";
import Products from "./pages/Products";
import About from "./pages/About";
import Contact from "./pages/Contact";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";
import LoginPage from "./pages/LoginPage";
import GuestDashboard from "./pages/GuestDashboard";

function GuestDashboardRoute() {
  const { isClerkLoaded, isSignedIn } = useAuthReq();
  if (!isClerkLoaded) return null;
  if (!isSignedIn) return <Redirect to="/pamik-sign-in" />;
  return (
    <Layout>
      <GuestDashboard />
    </Layout>
  );
}

function Router() {
  return (
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
      <Route path="/pamik-sign-in">
        <Layout>
          <LoginPage />
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

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isClerkLoaded, isSignedIn } = useAuthReq();
  useUserSync();
  if (!isClerkLoaded) return null;
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
