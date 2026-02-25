import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { CheckCircle, Settings, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentSetup() {
    const [secretKey, setSecretKey] = useState('');
    const [countries, setCountries] = useState('US, CA, GB, AU');
    const { data: isConfigured, isLoading } = useIsStripeConfigured();
    const setConfig = useSetStripeConfiguration();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!secretKey.trim()) {
            toast.error('Please enter your Stripe secret key');
            return;
        }
        const allowedCountries = countries.split(',').map(c => c.trim()).filter(Boolean);
        try {
            await setConfig.mutateAsync({ secretKey: secretKey.trim(), allowedCountries });
            toast.success('Stripe configured successfully!');
            setSecretKey('');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to configure Stripe');
        }
    };

    if (isLoading) return null;

    if (isConfigured) {
        return (
            <Card className="rounded-2xl border border-border shadow-card">
                <CardContent className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Stripe Configured</p>
                        <p className="text-sm text-muted-foreground">Payment processing is active</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-2xl border border-border shadow-card">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Configure Stripe Payments</CardTitle>
                </div>
                <CardDescription>
                    Set up Stripe to enable subscription payments for your users.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                        <Input
                            id="stripe-key"
                            type="password"
                            placeholder="sk_live_..."
                            value={secretKey}
                            onChange={e => setSecretKey(e.target.value)}
                            className="rounded-xl font-mono text-sm"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="countries">Allowed Countries (comma-separated)</Label>
                        <Input
                            id="countries"
                            placeholder="US, CA, GB, AU"
                            value={countries}
                            onChange={e => setCountries(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>
                    <Button type="submit" className="w-full rounded-xl" disabled={setConfig.isPending}>
                        {setConfig.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Configuring...</>
                        ) : (
                            <><Settings className="w-4 h-4 mr-2" /> Save Configuration</>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
