import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useAdminGetStats, useAdminGetAllUsers, useAdminSetUserPlan } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Link } from '@tanstack/react-router';
import PaymentSetup from '../components/PaymentSetup';
import {
    Users,
    ChefHat,
    Lock,
    ShieldCheck,
    TrendingUp,
    DollarSign,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

function PlanBadge({ plan }: { plan: PlanType | string }) {
    const planStr = String(plan);
    const styles: Record<string, string> = {
        free: 'bg-muted text-muted-foreground',
        pro: 'bg-primary/10 text-primary border border-primary/20',
        premium: 'bg-accent text-accent-foreground border border-border',
    };
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[planStr] ?? styles.free}`}>
            {planStr}
        </span>
    );
}

export default function AdminPage() {
    const { identity } = useInternetIdentity();
    const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminGetStats();
    const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useAdminGetAllUsers();
    const setUserPlan = useAdminSetUserPlan();
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);

    if (!identity) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Sign In Required</h2>
                    <p className="text-muted-foreground mb-6">Please log in to access the admin panel.</p>
                    <Link to="/"><Button className="rounded-xl">Go to Home</Button></Link>
                </div>
            </div>
        );
    }

    if (adminLoading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground">Checking permissions...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <ShieldCheck className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
                    <p className="text-muted-foreground mb-6">
                        You don't have permission to access the admin panel.
                    </p>
                    <Link to="/dashboard">
                        <Button className="rounded-xl">Go to Dashboard</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handlePlanChange = async (userPrincipalStr: string, newPlan: string, principalObj: any) => {
        setUpdatingUser(userPrincipalStr);
        try {
            await setUserPlan.mutateAsync({ userPrincipal: principalObj, plan: newPlan as PlanType });
            toast.success('User plan updated successfully');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update user plan');
        } finally {
            setUpdatingUser(null);
        }
    };

    const handleRefresh = () => {
        refetchStats();
        refetchUsers();
        toast.success('Data refreshed');
    };

    const totalUsers = stats ? Number(stats.totalUsers) : 0;
    const totalRecipes = stats ? Number(stats.totalRecipes) : 0;
    const estimatedRevenue = users
        ? users.reduce((acc, u) => {
              const plan = String(u.planType);
              if (plan === 'pro') return acc + 10;
              if (plan === 'premium') return acc + 20;
              return acc;
          }, 0)
        : 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-primary" />
                        Admin Panel
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage users, subscriptions, and platform settings</p>
                </div>
                <Button variant="outline" className="rounded-xl" onClick={handleRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card className="rounded-2xl shadow-card border border-border">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Total Users</p>
                            {statsLoading ? (
                                <Skeleton className="h-7 w-16" />
                            ) : (
                                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-card border border-border">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <ChefHat className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Recipes Generated</p>
                            {statsLoading ? (
                                <Skeleton className="h-7 w-16" />
                            ) : (
                                <p className="text-2xl font-bold text-foreground">{totalRecipes}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-card border border-border">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Est. Monthly Revenue</p>
                            {usersLoading ? (
                                <Skeleton className="h-7 w-20" />
                            ) : (
                                <p className="text-2xl font-bold text-foreground">${estimatedRevenue}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stripe Setup */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Payment Configuration
                </h2>
                <PaymentSetup />
            </div>

            <Separator className="mb-8" />

            {/* Users Table */}
            <div>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    User Management
                </h2>

                <Card className="rounded-2xl shadow-card border border-border overflow-hidden">
                    {usersLoading ? (
                        <div className="p-6 space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-12 w-full rounded-xl" />
                            ))}
                        </div>
                    ) : users && users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Principal</TableHead>
                                        <TableHead className="font-semibold">Plan</TableHead>
                                        <TableHead className="font-semibold">Daily Usage</TableHead>
                                        <TableHead className="font-semibold">Joined</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => {
                                        const principalStr = user.principal.toString();
                                        const isUpdating = updatingUser === principalStr;
                                        return (
                                            <TableRow key={principalStr} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium text-sm">
                                                    {user.email || '—'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-xs text-muted-foreground">
                                                        {principalStr.slice(0, 12)}...
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <PlanBadge plan={user.planType} />
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {Number(user.dailyRecipeCount)} / {Number(user.dailyLimit)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {new Date(Number(user.createdAt) / 1_000_000).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Select
                                                            defaultValue={String(user.planType)}
                                                            onValueChange={(val) =>
                                                                handlePlanChange(principalStr, val, user.principal)
                                                            }
                                                            disabled={isUpdating}
                                                        >
                                                            <SelectTrigger className="w-28 h-8 rounded-lg text-xs">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="free">Free</SelectItem>
                                                                <SelectItem value="pro">Pro</SelectItem>
                                                                <SelectItem value="premium">Premium</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {isUpdating && (
                                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">No users registered yet.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
