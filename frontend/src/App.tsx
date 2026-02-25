import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import MealPlannerPage from './pages/MealPlannerPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './pages/AdminPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';

// Root layout with Navbar
function RootLayout() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="bg-card border-t border-border py-6 mt-auto">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>© {new Date().getFullYear()} GreenChef</span>
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    </div>
                    <div className="flex items-center gap-1">
                        <span>Built with</span>
                        <span className="text-primary">♥</span>
                        <span>using</span>
                        <a
                            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'greenchef')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-semibold hover:underline"
                        >
                            caffeine.ai
                        </a>
                    </div>
                </div>
            </footer>
            <Toaster richColors position="top-right" />
        </div>
    );
}

// Route definitions
const rootRoute = createRootRoute({
    component: RootLayout,
});

const landingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage,
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard',
    component: DashboardPage,
});

const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfilePage,
});

const savedRecipesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/saved-recipes',
    component: SavedRecipesPage,
});

const mealPlannerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/meal-planner',
    component: MealPlannerPage,
});

const pricingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pricing',
    component: PricingPage,
});

const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: AdminPage,
});

const paymentSuccessRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-success',
    component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/payment-failure',
    component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
    landingRoute,
    dashboardRoute,
    profileRoute,
    savedRecipesRoute,
    mealPlannerRoute,
    pricingRoute,
    adminRoute,
    paymentSuccessRoute,
    paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

export default function App() {
    return <RouterProvider router={router} />;
}
