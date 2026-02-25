import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGenerateRecipe } from '../hooks/useQueries';
import { PlanType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import RecipeCard from '../components/RecipeCard';
import AdBanner from '../components/AdBanner';
import ProfileSetupModal from '../components/ProfileSetupModal';
import { Link } from '@tanstack/react-router';
import { Plus, X, Sparkles, Loader2, ChefHat, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { Recipe } from '../backend';

export default function DashboardPage() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
    const generateRecipe = useGenerateRecipe();

    const [ingredientInput, setIngredientInput] = useState('');
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);

    const isAuthenticated = !!identity;
    const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

    const planType = userProfile?.planType;
    const isFree = planType === PlanType.free || planType === undefined;
    const dailyCount = Number(userProfile?.dailyRecipeCount ?? 0);
    const dailyLimit = Number(userProfile?.dailyLimit ?? 5);
    const usagePercent = dailyLimit > 0 ? Math.min((dailyCount / dailyLimit) * 100, 100) : 0;
    const limitReached = isFree && dailyCount >= dailyLimit;

    const addIngredient = () => {
        const trimmed = ingredientInput.trim();
        if (!trimmed) return;
        const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
        const newIngredients = parts.filter(p => !ingredients.includes(p));
        if (newIngredients.length > 0) {
            setIngredients(prev => [...prev, ...newIngredients]);
        }
        setIngredientInput('');
    };

    const removeIngredient = (ing: string) => {
        setIngredients(prev => prev.filter(i => i !== ing));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addIngredient();
        }
    };

    const handleGenerate = async () => {
        if (ingredients.length === 0) {
            toast.error('Please add at least one ingredient');
            return;
        }
        if (limitReached) {
            toast.error('Daily limit reached. Upgrade to Pro for unlimited recipes!');
            return;
        }
        try {
            const recipe = await generateRecipe.mutateAsync(ingredients);
            setGeneratedRecipe(recipe);
            toast.success('Recipe generated! 🍳');
        } catch (err: any) {
            const msg = err?.message || '';
            if (msg.includes('Daily limit')) {
                toast.error('Daily limit reached! Upgrade to Pro for unlimited recipes.');
            } else if (msg.includes('Unauthorized')) {
                toast.error('Please log in to generate recipes.');
            } else {
                toast.error('Failed to generate recipe. Please try again.');
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">Sign In to Cook</h2>
                    <p className="text-muted-foreground mb-6">
                        Create your free account to start generating AI-powered recipes.
                    </p>
                    <Link to="/">
                        <Button className="rounded-xl px-8">Get Started Free</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <ProfileSetupModal open={showProfileSetup} />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                        What's in your kitchen? 🌿
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your ingredients and let AI create a delicious recipe for you.
                    </p>
                </div>

                {/* Usage Counter (Free users) */}
                {isFree && userProfile && (
                    <div className="bg-card rounded-2xl border border-border p-4 mb-6 shadow-soft">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Daily Recipes Used</span>
                            <span className="text-sm font-bold text-primary">{dailyCount} / {dailyLimit}</span>
                        </div>
                        <Progress value={usagePercent} className="h-2 mb-2" />
                        {limitReached ? (
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-destructive flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Daily limit reached
                                </p>
                                <Link to="/pricing">
                                    <Button size="sm" className="rounded-lg text-xs h-7">
                                        Upgrade to Pro
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                {dailyLimit - dailyCount} recipes remaining today.{' '}
                                <Link to="/pricing" className="text-primary font-medium hover:underline">
                                    Upgrade for unlimited
                                </Link>
                            </p>
                        )}
                    </div>
                )}

                {/* Ingredient Input */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-card mb-6">
                    <label className="block text-sm font-semibold text-foreground mb-3">
                        Add Ingredients
                    </label>
                    <div className="flex gap-2 mb-4">
                        <Input
                            value={ingredientInput}
                            onChange={e => setIngredientInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter ingredients (e.g. rice, tomato, onion)"
                            className="rounded-xl flex-1"
                            disabled={generateRecipe.isPending}
                        />
                        <Button
                            onClick={addIngredient}
                            variant="outline"
                            className="rounded-xl shrink-0"
                            disabled={!ingredientInput.trim() || generateRecipe.isPending}
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {/* Ingredient Chips */}
                    {ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-5">
                            {ingredients.map(ing => (
                                <span key={ing} className="ingredient-chip">
                                    {ing}
                                    <button
                                        onClick={() => removeIngredient(ing)}
                                        className="ml-1 hover:text-destructive transition-colors"
                                        aria-label={`Remove ${ing}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {ingredients.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                            <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Add ingredients above to get started</p>
                        </div>
                    )}

                    <Button
                        onClick={handleGenerate}
                        className="w-full rounded-xl text-base py-6 shadow-green-glow"
                        size="lg"
                        disabled={ingredients.length === 0 || generateRecipe.isPending || limitReached}
                    >
                        {generateRecipe.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Generating your recipe...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 mr-2" />
                                Generate Recipe
                            </>
                        )}
                    </Button>
                </div>

                {/* Ad Banner for free users */}
                {isFree && <AdBanner planType={planType} />}

                {/* Generated Recipe */}
                {generatedRecipe && (
                    <div className="mt-6">
                        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Your Recipe
                        </h2>
                        <RecipeCard
                            recipe={generatedRecipe}
                            planType={planType}
                            showNutrition={planType === PlanType.premium}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
