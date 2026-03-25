import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AppLayout } from "@/components/layout/AppLayout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Invite from "@/pages/invite";
import Join from "@/pages/join";
import Dashboard from "@/pages/dashboard";
import MoodCheckIn from "@/pages/mood";
import AIHub from "@/pages/ai-hub";
import AIDates from "@/pages/ai-dates";
import AIMediation from "@/pages/ai-mediation";
import AIChat from "@/pages/ai-chat";
import CoupleProfile from "@/pages/couple-profile";
import Upgrade from "@/pages/upgrade";

// Global fetch interceptor to inject Authorization header for API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('/api')) {
    const token = localStorage.getItem('sincronia_token');
    if (token) {
      config = config || {};
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
  }
  return originalFetch(resource, config);
};

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/invite" component={Invite} />
        <Route path="/join/:token" component={Join} />
        <Route path="/" component={Dashboard} />
        <Route path="/mood" component={MoodCheckIn} />
        <Route path="/ai" component={AIHub} />
        <Route path="/ai/dates" component={AIDates} />
        <Route path="/ai/mediation" component={AIMediation} />
        <Route path="/ai/chat" component={AIChat} />
        <Route path="/couple" component={CoupleProfile} />
        <Route path="/upgrade" component={Upgrade} />
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
