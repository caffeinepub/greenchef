import { PlanType } from '../backend';
import { X } from 'lucide-react';
import { useState } from 'react';

interface AdBannerProps {
    planType?: PlanType;
}

export default function AdBanner({ planType }: AdBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    // Only show for free users
    if (planType !== PlanType.free && planType !== undefined) return null;
    if (dismissed) return null;

    return (
        <div className="relative bg-gradient-to-r from-accent to-secondary border border-border rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">🌿</span>
                </div>
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                        Sponsored
                    </p>
                    <p className="text-sm font-medium text-foreground">
                        Fresh organic ingredients delivered to your door
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Upgrade to Pro to remove ads →{' '}
                        <a href="/pricing" className="text-primary font-semibold hover:underline">
                            View Plans
                        </a>
                    </p>
                </div>
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-lg hover:bg-accent transition-colors shrink-0"
                aria-label="Dismiss ad"
            >
                <X className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
    );
}
