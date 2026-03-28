import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AppLayout } from "@/components/layout/AppLayout";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Invite from "@/pages/invite";
import Join from "@/pages/join";
import MatchCelebration from "@/pages/match-celebration";
import Dashboard from "@/pages/dashboard";
import MoodCheckIn from "@/pages/mood";
import AIHub from "@/pages/ai-hub";
import AIDates from "@/pages/ai-dates";
import AIMediation from "@/pages/ai-mediation";
import AIChat from "@/pages/ai-chat";
import CoupleProfile from "@/pages/couple-profile";
import Upgrade from "@/pages/upgrade";
import Settings from "@/pages/settings";

import { setAuthTokenGetter } from "@workspace/api-client-react";

// Tell the API client to inject the JWT on every request automatically
setAuthTokenGetter(() => localStorage.getItem("sincronia_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/invite" component={Invite} />
        <Route path="/join/:token" component={Join} />
        <Route path="/match" component={MatchCelebration} />
        <Route path="/app" component={Dashboard} />
        <Route path="/mood" component={MoodCheckIn} />
        <Route path="/ai" component={AIHub} />
        <Route path="/ai/dates" component={AIDates} />
        <Route path="/ai/mediation" component={AIMediation} />
        <Route path="/ai/chat" component={AIChat} />
        <Route path="/couple" component={CoupleProfile} />
        <Route path="/upgrade" component={Upgrade} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
