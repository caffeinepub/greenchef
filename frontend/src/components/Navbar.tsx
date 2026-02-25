import { useState } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { Menu, X, ChefHat, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { identity, login, clear, loginStatus } = useInternetIdentity();
    const queryClient = useQueryClient();
    const { data: userProfile } = useGetCallerUserProfile();
    const { data: isAdmin } = useIsCallerAdmin();
    const isAuthenticated = !!identity;
    const isLoggingIn = loginStatus === 'logging-in';

    const planType = userProfile?.planType;
    const isPro = planType === PlanType.pro || planType === PlanType.premium;
    const isPremium = planType === PlanType.premium;

    const handleAuth = async () => {
        if (isAuthenticated) {
            await clear();
            queryClient.clear();
        } else {
            try {
                await login();
            } catch (error: any) {
                if (error?.message === 'User is already authenticated') {
                    await clear();
                    setTimeout(() => login(), 300);
                }
            }
        }
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', show: isAuthenticated },
        { to: '/saved-recipes', label: 'Saved Recipes', show: isAuthenticated && isPro },
        { to: '/meal-planner', label: 'Meal Planner', show: isAuthenticated && isPremium },
        { to: '/pricing', label: 'Pricing', show: true },
        { to: '/profile', label: 'Profile', show: isAuthenticated },
        { to: '/admin', label: 'Admin', show: isAuthenticated && !!isAdmin },
    ].filter(l => l.show);

    return (
        <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-soft">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-soft group-hover:shadow-green-glow transition-shadow">
                        <ChefHat className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg text-foreground tracking-tight">
                        Green<span className="text-primary">Chef</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            activeProps={{ className: 'px-3 py-2 rounded-lg text-sm font-medium text-primary bg-accent' }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Auth Button */}
                <div className="hidden md:flex items-center gap-3">
                    {isAuthenticated && userProfile && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent text-accent-foreground capitalize">
                            {String(planType ?? 'free')} Plan
                        </span>
                    )}
                    <Button
                        onClick={handleAuth}
                        disabled={isLoggingIn}
                        variant={isAuthenticated ? 'outline' : 'default'}
                        className="rounded-xl"
                        size="sm"
                    >
                        {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1 animate-fade-in">
                    {navLinks.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-border mt-1">
                        <Button
                            onClick={() => { handleAuth(); setMobileOpen(false); }}
                            disabled={isLoggingIn}
                            variant={isAuthenticated ? 'outline' : 'default'}
                            className="w-full rounded-xl"
                            size="sm"
                        >
                            {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}
