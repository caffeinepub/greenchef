import { Link } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChefHat, Sparkles, Clock, Leaf, Star, CheckCircle, ArrowRight, Zap, BookOpen, ShoppingCart } from 'lucide-react';

const testimonials = [
    {
        name: 'Sarah M.',
        role: 'Home Cook',
        text: 'GreenChef transformed how I cook! I just throw in whatever I have and get amazing recipes instantly.',
        rating: 5,
        avatar: '👩‍🍳',
    },
    {
        name: 'James K.',
        role: 'Busy Parent',
        text: 'No more food waste! I use up everything in my fridge and my family loves the creative meals.',
        rating: 5,
        avatar: '👨‍👩‍👧',
    },
    {
        name: 'Priya R.',
        role: 'Fitness Enthusiast',
        text: 'The Premium plan with nutrition breakdown is a game changer for my meal prep routine.',
        rating: 5,
        avatar: '🏃‍♀️',
    },
];

const faqs = [
    {
        q: 'How does GreenChef work?',
        a: 'Simply enter the ingredients you have on hand, click "Generate Recipe", and our AI creates a personalized recipe just for you in seconds.',
    },
    {
        q: 'Is the free plan really free?',
        a: 'Yes! The free plan gives you 5 recipe generations per day at no cost. Upgrade to Pro or Premium for unlimited recipes and more features.',
    },
    {
        q: 'Can I save my favorite recipes?',
        a: 'Yes, Pro and Premium subscribers can save unlimited recipes to their personal collection for easy access anytime.',
    },
    {
        q: 'What is the Meal Planner feature?',
        a: 'Premium subscribers get access to our AI-powered weekly meal planner that creates a full 7-day meal plan and auto-generates a grocery list.',
    },
    {
        q: 'How do I cancel my subscription?',
        a: 'You can cancel anytime from your profile page. Your access continues until the end of your billing period.',
    },
];

export default function LandingPage() {
    const { identity, login, loginStatus } = useInternetIdentity();
    const isAuthenticated = !!identity;
    const isLoggingIn = loginStatus === 'logging-in';

    const handleCTA = () => {
        if (!isAuthenticated) {
            login();
        }
    };

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/assets/generated/hero-kitchen.dim_1440x600.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />

                <div className="relative container mx-auto px-4 py-20">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6 border border-primary/20">
                            <Sparkles className="w-4 h-4" />
                            AI-Powered Recipe Generation
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
                            Cook Smart With{' '}
                            <span className="text-primary">What You Already Have</span>
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
                            Turn simple ingredients into delicious meals instantly with AI.
                            No more food waste, no more recipe hunting.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {isAuthenticated ? (
                                <Link to="/dashboard">
                                    <Button size="lg" className="rounded-xl text-base px-8 shadow-green-glow">
                                        <ChefHat className="w-5 h-5 mr-2" />
                                        Go to Dashboard
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    size="lg"
                                    className="rounded-xl text-base px-8 shadow-green-glow"
                                    onClick={handleCTA}
                                    disabled={isLoggingIn}
                                >
                                    <ChefHat className="w-5 h-5 mr-2" />
                                    {isLoggingIn ? 'Logging in...' : 'Start Cooking Free'}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                            <Link to="/pricing">
                                <Button size="lg" variant="outline" className="rounded-xl text-base px-8">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span>Free to start</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span>No credit card needed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span>5 recipes/day free</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-card">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            How It Works
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Three simple steps to your next delicious meal
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                step: '01',
                                icon: <Leaf className="w-7 h-7 text-primary" />,
                                title: 'Enter Your Ingredients',
                                desc: 'Type in whatever ingredients you have in your fridge or pantry. No need for a full list.',
                            },
                            {
                                step: '02',
                                icon: <Sparkles className="w-7 h-7 text-primary" />,
                                title: 'AI Generates Recipe',
                                desc: 'Our AI chef creates a personalized, easy-to-follow recipe using exactly what you have.',
                            },
                            {
                                step: '03',
                                icon: <ChefHat className="w-7 h-7 text-primary" />,
                                title: 'Cook & Enjoy',
                                desc: 'Follow the step-by-step instructions and enjoy a delicious home-cooked meal in under 30 minutes.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="relative text-center group">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors shadow-soft">
                                    {item.icon}
                                </div>
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 text-5xl font-black text-primary/5 select-none">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Start free, upgrade when you're ready
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                name: 'Free',
                                price: '$0',
                                period: '/month',
                                desc: 'Perfect for casual cooks',
                                features: ['5 recipes per day', 'Basic recipe generation', 'Share recipes', 'Ad-supported'],
                                cta: 'Get Started Free',
                                highlight: false,
                            },
                            {
                                name: 'Pro',
                                price: '$10',
                                period: '/month',
                                desc: 'For passionate home chefs',
                                features: ['Unlimited recipes', 'Save favorites', 'Download recipes', 'No ads', 'Priority generation'],
                                cta: 'Upgrade to Pro',
                                highlight: true,
                            },
                            {
                                name: 'Premium',
                                price: '$20',
                                period: '/month',
                                desc: 'The complete cooking suite',
                                features: ['Everything in Pro', 'Weekly meal planner', 'Grocery list generation', 'Nutrition breakdown', 'Leftover suggestions'],
                                cta: 'Go Premium',
                                highlight: false,
                            },
                        ].map((plan, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl p-6 border ${plan.highlight
                                    ? 'bg-primary text-primary-foreground border-primary shadow-green-glow scale-105'
                                    : 'bg-card border-border shadow-card'
                                    }`}
                            >
                                {plan.highlight && (
                                    <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm mb-4 ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {plan.desc}
                                </p>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                                <ul className="space-y-2.5 mb-6">
                                    {plan.features.map((f, j) => (
                                        <li key={j} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-primary-foreground' : 'text-foreground'}`}>
                                            <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/pricing">
                                    <Button
                                        className={`w-full rounded-xl ${plan.highlight
                                            ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                                            : ''
                                            }`}
                                        variant={plan.highlight ? 'secondary' : 'default'}
                                    >
                                        {plan.cta}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-card">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Loved by Home Chefs
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            Join thousands of happy cooks
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-background rounded-2xl p-6 shadow-card border border-border">
                                <div className="flex items-center gap-1 mb-3">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                                    ))}
                                </div>
                                <p className="text-foreground text-sm leading-relaxed mb-4">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-xl">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-foreground">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <Accordion type="single" collapsible className="space-y-3">
                        {faqs.map((faq, i) => (
                            <AccordionItem
                                key={i}
                                value={`faq-${i}`}
                                className="bg-card rounded-xl border border-border px-5 shadow-soft"
                            >
                                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-16 bg-primary">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
                        Ready to Cook Smarter?
                    </h2>
                    <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                        Join thousands of home chefs using AI to create amazing meals from everyday ingredients.
                    </p>
                    {isAuthenticated ? (
                        <Link to="/dashboard">
                            <Button size="lg" variant="secondary" className="rounded-xl text-base px-10">
                                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    ) : (
                        <Button
                            size="lg"
                            variant="secondary"
                            className="rounded-xl text-base px-10"
                            onClick={handleCTA}
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? 'Logging in...' : 'Start Cooking Free'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </div>
            </section>
        </div>
    );
}
