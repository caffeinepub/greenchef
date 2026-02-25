import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Crown, Sparkles, X } from 'lucide-react';

interface UpgradePromptModalProps {
    open: boolean;
    onClose: () => void;
}

export default function UpgradePromptModal({ open, onClose }: UpgradePromptModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 hover:bg-accent transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <DialogHeader className="text-center">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 shadow-soft">
                        <Crown className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Upgrade to Pro</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        This feature is available for Pro and Premium subscribers.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mt-2">
                    <div className="bg-accent rounded-xl p-4 space-y-2">
                        <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            Pro Plan – $10/month
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                            <li>✓ Unlimited recipe generation</li>
                            <li>✓ Save favorite recipes</li>
                            <li>✓ Download recipes as PDF</li>
                            <li>✓ No ads</li>
                        </ul>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                            Maybe Later
                        </Button>
                        <Link to="/pricing" className="flex-1" onClick={onClose}>
                            <Button className="w-full rounded-xl">
                                View Plans
                            </Button>
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
