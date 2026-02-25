import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveCallerUserProfile, useCreateUser } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { ChefHat, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
    open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const saveProfile = useSaveCallerUserProfile();
    const createUser = useCreateUser();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email');
            return;
        }

        try {
            // Create user record first
            await createUser.mutateAsync(email.trim());
        } catch (err: any) {
            // User might already exist, continue
        }

        try {
            await saveProfile.mutateAsync({
                email: email.trim(),
                planType: PlanType.free,
                dailyRecipeCount: BigInt(0),
                dailyLimit: BigInt(5),
                createdAt: BigInt(Date.now()) * BigInt(1_000_000),
            });
            toast.success('Welcome to GreenChef! 🌿');
        } catch (err: any) {
            toast.error('Failed to save profile. Please try again.');
        }
    };

    const isPending = saveProfile.isPending || createUser.isPending;

    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-soft">
                        <ChefHat className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Welcome to GreenChef!</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Let's set up your profile to get started with AI-powered recipes.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Alex Johnson"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="rounded-xl"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full rounded-xl"
                        disabled={isPending || !email.trim()}
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Setting up...</>
                        ) : (
                            'Start Cooking Free 🍳'
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
