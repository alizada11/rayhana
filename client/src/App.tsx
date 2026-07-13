import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Redirect, Route, Router as WouterRouter, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";
import { ConfirmProvider } from "./components/ConfirmProvider";
import FullPageLoader from "./components/FullPageLoader";
import i18n from "./lib/i18n";
import { type SupportedLocale } from "./lib/locales";

import Layout from "./components/Layout";
const LazyToaster = lazy(() =>
  import("@/components/ui/sonner").then(mod => ({ default: mod.Toaster }))
);
const DashboardShell = lazy(() => import("@/components/DashboardShell"));
const Home = lazy(() => import("@/pages/Home"));
const BlogIndex = lazy(() => import("@/pages/BlogIndex"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const Products = lazy(() => import("./pages/Products"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const Privacy = lazy(() => import("./pages/Privacy"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const GuestDashboard = lazy(() => import("./pages/GuestDashboard"));
const Gallery = lazy(() => import("./pages/Gallery"));
const WorldCupPrediction = lazy(() => import("./pages/WorldCupPrediction"));
const WorldCupTerms = lazy(() => import("./pages/WorldCupTerms"));
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

function PublicRoutes() {
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
        <Route path="/faq">
          <Layout>
            <FAQPage />
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
        <Route path="/world-cup-prediction">
          <Layout>
            <WorldCupPrediction />
          </Layout>
        </Route>
        <Route path="/world-cup-prediction/terms">
          <Layout>
            <WorldCupTerms />
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

function LocalizedPublicRoutes({ locale }: { locale: SupportedLocale }) {
  useEffect(() => {
    if (i18n.language?.split("-")[0] !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  return <PublicRoutes />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Switch>
        <Route path="/en" nest>
          <LocalizedPublicRoutes locale="en" />
        </Route>
        <Route path="/fa" nest>
          <LocalizedPublicRoutes locale="fa" />
        </Route>
        <Route path="/ps" nest>
          <LocalizedPublicRoutes locale="ps" />
        </Route>
        <Route>
          <PublicRoutes />
        </Route>
      </Switch>
    </Suspense>
  );
}

type AppProps = {
  ssrPath?: string;
  ssrSearch?: string;
};

function App({ ssrPath, ssrSearch }: AppProps) {
  useUserSync();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ConfirmProvider>
          <TooltipProvider>
            <Suspense fallback={null}>
              <LazyToaster />
            </Suspense>
            <WouterRouter ssrPath={ssrPath} ssrSearch={ssrSearch}>
              <AppRoutes />
            </WouterRouter>
          </TooltipProvider>
        </ConfirmProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
