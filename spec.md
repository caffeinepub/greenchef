# Specification

## Summary
**Goal:** Build GreenChef, a full-stack AI-powered recipe generator SaaS app with a green design system, Internet Identity authentication, Stripe subscriptions, and a Motoko backend.

**Planned changes:**

### Landing Page
- Hero section with headline "Cook Smart With What You Already Have", subheadline, and "Start Cooking Free" CTA button
- "How It Works" section with 3 steps
- Pricing table showing Free, Pro ($10/mo), and Premium ($20/mo) plans
- Testimonials section, FAQ section, and footer with Privacy Policy and Terms of Service links
- GreenChef logo in navbar and hero; hero kitchen illustration as hero visual

### Design System
- Primary green #2E7D32, light green #A5D6A7, background #F1F8E9
- 12px border-radius on all buttons, soft shadows on cards/modals, modern sans-serif font (Inter or similar)
- Fully mobile responsive layout across all pages
- Ad placeholder banners visible to free-plan users in the dashboard; hidden for paid users

### Authentication
- Internet Identity login/signup
- User record created on first login with fields: id, principal, plan_type (default: free), daily_recipe_count, daily_limit, created_at
- Profile page showing user identity and current subscription plan
- Protected routes redirect unauthenticated users to login

### Home Dashboard
- Ingredient input field with "Enter ingredients (e.g. rice, tomato, onion)" placeholder
- "Add ingredient" button adding ingredients as removable chips
- "Generate Recipe" primary button triggering AI recipe generation
- Daily usage counter (e.g. "3 / 5 recipes used today") visible to free-plan users

### Recipe Generation
- Motoko backend makes HTTP outcall to OpenAI-compatible API using the defined chef system prompt with user ingredients
- Returns structured recipe: name, cooking time, difficulty, ingredients used, step-by-step instructions
- Enforces daily limit (5/day for free, unlimited for Pro/Premium); rejects and returns error when limit reached
- Increments daily_recipe_count on each successful generation

### Recipe Card & Actions
- Displays recipe name, cooking time, difficulty badge, ingredients list, and step-by-step instructions
- "Share" button copies recipe text to clipboard (all users)
- "Save" and "Download PDF" buttons available to Pro/Premium users only
- Free users see an upgrade prompt when clicking Save or Download PDF

### Recipe Persistence
- Generated recipes stored per user (id, user_id, ingredients_input, generated_recipe, created_at)
- Saved recipes table (id, user_id, recipe_id) for Pro/Premium users
- Backend methods: get user recipes, save recipe, get saved recipes, delete saved recipe
- Only Pro/Premium users can save; free users get authorization error

### Saved Recipes Page
- Accessible from navigation for Pro/Premium users
- Grid of saved recipe cards showing name, difficulty, cooking time
- Each card links to full recipe detail view; users can remove saved recipes

### Subscription & Payments
- Stripe Checkout integration for plan upgrades
- On successful payment, user's plan_type updated to "pro" or "premium" in the backend
- Plan-gated features unlock immediately after upgrade

### Premium Meal Planner
- Accessible to Premium users only
- Generate a 7-day meal plan based on available ingredients
- Auto-generate grocery list aggregating missing ingredients across the meal plan
- Nutrition breakdown placeholder section per recipe showing estimated values

### Admin Panel
- Accessible only to a designated admin principal
- Displays: total registered users count, simulated revenue summary, total recipes generated (API usage counter)
- User list with ability to change a user's plan_type
- Route protected; non-admin users cannot access

**User-visible outcome:** Users can visit the landing page, sign up via Internet Identity, enter ingredients to generate AI-powered recipes, save and manage favorites (Pro/Premium), upgrade via Stripe, access a weekly meal planner (Premium), and admins can manage users and view platform stats.
