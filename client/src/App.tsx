import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Kanban from "./pages/Kanban";
import Products from "./pages/Products";
import Appointments from "./pages/Appointments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import WhatsAppIntegration from "./pages/WhatsAppIntegration";

function Router() {
  return (
    <Switch>
      <Route path={"/"}>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      <Route path={"/clients"}>
        <DashboardLayout>
          <Clients />
        </DashboardLayout>
      </Route>
      
      <Route path={"/kanban"}>
        <DashboardLayout>
          <Kanban />
        </DashboardLayout>
      </Route>
      
      <Route path={"/products"}>
        <DashboardLayout>
          <Products />
        </DashboardLayout>
      </Route>
      
      <Route path={"/appointments"}>
        <DashboardLayout>
          <Appointments />
        </DashboardLayout>
      </Route>
      
      <Route path={"/analytics"}>
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      
      <Route path={"/settings"}>
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      
      <Route path={"/whatsapp"}>
        <DashboardLayout>
          <WhatsAppIntegration />
        </DashboardLayout>
      </Route>
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
