import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { AuthProvider } from "@/context/AuthContext";
import { UserDataProvider } from "@/context/UserDataContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const BlogList   = lazy(() => import("@/pages/BlogList"));
const BlogPost   = lazy(() => import("@/pages/BlogPost"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));
const VerifyOtp  = lazy(() => import("@/pages/VerifyOtp"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/verify-otp">
        <Suspense fallback={<PageLoader />}><VerifyOtp /></Suspense>
      </Route>
      <Route path="/blog">
        <Suspense fallback={<PageLoader />}><BlogList /></Suspense>
      </Route>
      <Route path="/blog/:slug">
        <Suspense fallback={<PageLoader />}><BlogPost /></Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserDataProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ErrorBoundary>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
            </ErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </UserDataProvider>
    </AuthProvider>
  );
}

export default App;
