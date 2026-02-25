import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { UserProfile, PlanType, ShoppingItem } from '../backend';

// ---- User Profile ----
export function useGetCallerUserProfile() {
    const { actor, isFetching: actorFetching } = useActor();

    const query = useQuery<UserProfile | null>({
        queryKey: ['currentUserProfile'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getCallerUserProfile();
        },
        enabled: !!actor && !actorFetching,
        retry: false,
    });

    return {
        ...query,
        isLoading: actorFetching || query.isLoading,
        isFetched: !!actor && query.isFetched,
    };
}

export function useSaveCallerUserProfile() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profile: UserProfile) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveCallerUserProfile(profile);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

export function useCreateUser() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (email: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.createUser(email);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}

// ---- Recipe Generation ----
export function useGenerateRecipe() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (ingredientsInput: string[]) => {
            if (!actor) throw new Error('Actor not available');
            return actor.generateRecipe(ingredientsInput);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
            queryClient.invalidateQueries({ queryKey: ['userRecipes'] });
        },
    });
}

export function useGetUserRecipes() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery({
        queryKey: ['userRecipes', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor || !identity) return [];
            return actor.getUserRecipes(identity.getPrincipal());
        },
        enabled: !!actor && !actorFetching && !!identity,
    });
}

// ---- Saved Recipes ----
export function useSaveRecipe() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (recipeId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.saveRecipe(recipeId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
        },
    });
}

export function useGetSavedRecipes() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery({
        queryKey: ['savedRecipes', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor || !identity) return [];
            return actor.getSavedRecipes(identity.getPrincipal());
        },
        enabled: !!actor && !actorFetching && !!identity,
    });
}

export function useDeleteSavedRecipe() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (recipeId: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.deleteSavedRecipe(recipeId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['savedRecipes'] });
        },
    });
}

// ---- Meal Planner ----
export function useGenerateMealPlan() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (weekPlan: string) => {
            if (!actor) throw new Error('Actor not available');
            return actor.generateMealPlan(weekPlan);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
        },
    });
}

export function useGetUserMealPlans() {
    const { actor, isFetching: actorFetching } = useActor();
    const { identity } = useInternetIdentity();

    return useQuery({
        queryKey: ['mealPlans', identity?.getPrincipal().toString()],
        queryFn: async () => {
            if (!actor || !identity) return [];
            return actor.getUserMealPlans(identity.getPrincipal());
        },
        enabled: !!actor && !actorFetching && !!identity,
    });
}

// ---- Admin ----
export function useAdminGetStats() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['adminStats'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.adminGetStats();
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useAdminGetAllUsers() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['adminAllUsers'],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.adminGetAllUsers();
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useAdminSetUserPlan() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userPrincipal, plan }: { userPrincipal: any; plan: PlanType }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.adminSetUserPlan(userPrincipal, plan);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminAllUsers'] });
            queryClient.invalidateQueries({ queryKey: ['adminStats'] });
        },
    });
}

export function useIsCallerAdmin() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['isCallerAdmin'],
        queryFn: async () => {
            if (!actor) return false;
            return actor.isCallerAdmin();
        },
        enabled: !!actor && !actorFetching,
    });
}

// ---- Stripe ----
export function useIsStripeConfigured() {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['isStripeConfigured'],
        queryFn: async () => {
            if (!actor) return false;
            return actor.isStripeConfigured();
        },
        enabled: !!actor && !actorFetching,
    });
}

export function useSetStripeConfiguration() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (config: { secretKey: string; allowedCountries: string[] }) => {
            if (!actor) throw new Error('Actor not available');
            return actor.setStripeConfiguration(config);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['isStripeConfigured'] });
        },
    });
}

export type CheckoutSession = {
    id: string;
    url: string;
};

export function useCreateCheckoutSession() {
    const { actor } = useActor();

    return useMutation({
        mutationFn: async (items: ShoppingItem[]): Promise<CheckoutSession> => {
            if (!actor) throw new Error('Actor not available');
            const baseUrl = `${window.location.protocol}//${window.location.host}`;
            const successUrl = `${baseUrl}/payment-success`;
            const cancelUrl = `${baseUrl}/payment-failure`;
            const result = await actor.createCheckoutSession(items, successUrl, cancelUrl);
            const session = JSON.parse(result) as CheckoutSession;
            if (!session?.url) {
                throw new Error('Stripe session missing url');
            }
            return session;
        },
    });
}

export function useGetStripeSessionStatus(sessionId: string) {
    const { actor, isFetching: actorFetching } = useActor();

    return useQuery({
        queryKey: ['stripeSessionStatus', sessionId],
        queryFn: async () => {
            if (!actor) throw new Error('Actor not available');
            return actor.getStripeSessionStatus(sessionId);
        },
        enabled: !!actor && !actorFetching && !!sessionId,
    });
}

export function useUpgradePlan() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (plan: PlanType) => {
            if (!actor) throw new Error('Actor not available');
            return actor.upgradePlan(plan);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        },
    });
}
