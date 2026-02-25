import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetSavedRecipes, useDeleteSavedRecipe } from '../hooks/useQueries';
import { PlanType } from '../backend';
import RecipeCard from '../components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from '@tanstack/react-router';
import { Bookmark, Lock, Crown, ChefHat } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedRecipesPage() {
    const { identity } = useInternetIdentity();
    const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
    const { data: savedRecipes, isLoading: recipesLoading } = useGetSavedRecipes();
    const deleteRecipe = useDeleteSavedRecipe();

    const planType = userProfile?.planType;
    const isPro = planType === PlanType.pro || planType === PlanType.premium;

    if (!identity) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-3">Sign In Required</h2>
                <p className="text-muted-foreground mb-6">Please log in to view saved recipes.</p>
                <Link to="/"><Button className="rounded-xl">Go to Home</Button></Link>
            </div>
        );
    }

    if (!profileLoading && !isPro) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <Crown className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Pro Feature</h2>
                    <p className="text-muted-foreground mb-6">
                        Saving recipes is available for Pro and Premium subscribers.
                    </p>
                    <Link to="/pricing">
                        <Button className="rounded-xl px-8">Upgrade to Pro</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleRemove = async (recipeId: string) => {
        try {
            await deleteRecipe.mutateAsync(recipeId);
            toast.success('Recipe removed from saved');
        } catch (err: any) {
            toast.error('Failed to remove recipe');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                        <Bookmark className="w-7 h-7 text-primary" />
                        Saved Recipes
                    </h1>
                    <p className="text-muted-foreground mt-1">Your personal recipe collection</p>
                </div>
                <Link to="/dashboard">
                    <Button variant="outline" className="rounded-xl">
                        <ChefHat className="w-4 h-4 mr-2" />
                        Generate New
                    </Button>
                </Link>
            </div>

            {recipesLoading || profileLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-64 rounded-2xl" />
                    ))}
                </div>
            ) : savedRecipes && savedRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedRecipes.map(recipe => (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            planType={planType}
                            showNutrition={planType === PlanType.premium}
                            onRemove={() => handleRemove(recipe.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Bookmark className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No saved recipes yet</h3>
                    <p className="text-muted-foreground mb-6">
                        Generate a recipe and save it to your collection!
                    </p>
                    <Link to="/dashboard">
                        <Button className="rounded-xl">Generate a Recipe</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
