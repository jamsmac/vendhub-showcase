import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import TelegramOnboarding from "./pages/TelegramOnboarding";
import MasterData from "./pages/MasterData";
import ComponentLifecycle from "./pages/ComponentLifecycle";
import Reports from "./pages/Reports";

function Router() {
  return (
    <Switch>
      <Route path={"/login"} component={Login} />
      <Route path={"/onboarding"} component={TelegramOnboarding} />
      <Route path={"/master-data"} component={MasterData} />
      <Route path={"/components/:id"} component={ComponentLifecycle} />
      <Route path={"/reports"} component={Reports} />
      <Route path={"/"} component={Dashboard} />
      <Route path={"/machines"} component={Machines} />
      <Route path={"/inventory"} component={Inventory} />
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/users"} component={Users} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
