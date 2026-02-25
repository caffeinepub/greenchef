import Time "mo:core/Time";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ----- Types -----
  public type PlanType = {
    #free;
    #pro;
    #premium;
  };

  public type UserProfile = {
    email : Text;
    planType : PlanType;
    dailyRecipeCount : Nat;
    dailyLimit : Nat;
    createdAt : Time.Time;
  };

  public type User = {
    principal : Principal;
    email : Text;
    planType : PlanType;
    dailyRecipeCount : Nat;
    dailyLimit : Nat;
    createdAt : Time.Time;
  };

  public type Recipe = {
    id : Text;
    userId : Principal;
    ingredientsInput : [Text];
    generatedRecipe : Text;
    createdAt : Time.Time;
  };

  public type MealPlanner = {
    id : Text;
    userId : Principal;
    weekPlan : Text;
    createdAt : Time.Time;
  };

  // ----- Initialization -----
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let recipes = Map.empty<Text, Recipe>();
  let savedRecipes = Map.empty<Principal, List.List<Text>>();
  let mealPlanners = Map.empty<Text, MealPlanner>();

  var recipeCounter = 0;
  var mealPlanCounter = 0;

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // ----- Profile Management (required by frontend) -----
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ----- User Management -----
  public query ({ caller }) func getUser(userPrincipal : Principal) : async ?User {
    if (caller != userPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own user record");
    };
    users.get(userPrincipal);
  };

  public shared ({ caller }) func createUser(email : Text) : async User {
    // Any caller (including guests transitioning to users) can register
    if (users.containsKey(caller)) {
      Runtime.trap("User already exists");
    };

    let newUser : User = {
      principal = caller;
      email;
      planType = #free;
      dailyRecipeCount = 0;
      dailyLimit = 5;
      createdAt = Time.now();
    };

    users.add(caller, newUser);

    // Also store the profile
    let profile : UserProfile = {
      email;
      planType = #free;
      dailyRecipeCount = 0;
      dailyLimit = 5;
      createdAt = Time.now();
    };
    userProfiles.add(caller, profile);

    // Assign user role in access control
    AccessControl.assignRole(accessControlState, caller, caller, #user);

    newUser;
  };

  public shared ({ caller }) func upgradePlan(plan : PlanType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upgrade plans");
    };

    switch (users.get(caller)) {
      case (?user) {
        let newLimit = switch (plan) {
          case (#free) { 5 };
          case (#pro) { 10000 };
          case (#premium) { 10000 };
        };
        let updatedUser = {
          user with planType = plan;
          dailyLimit = newLimit;
        };
        users.add(caller, updatedUser);

        // Update profile too
        switch (userProfiles.get(caller)) {
          case (?profile) {
            let updatedProfile = {
              profile with planType = plan;
              dailyLimit = newLimit;
            };
            userProfiles.add(caller, updatedProfile);
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // ----- Admin: Update any user's plan -----
  public shared ({ caller }) func adminSetUserPlan(userPrincipal : Principal, plan : PlanType) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (users.get(userPrincipal)) {
      case (?user) {
        let newLimit = switch (plan) {
          case (#free) { 5 };
          case (#pro) { 10000 };
          case (#premium) { 10000 };
        };
        let updatedUser = {
          user with planType = plan;
          dailyLimit = newLimit;
        };
        users.add(userPrincipal, updatedUser);

        switch (userProfiles.get(userPrincipal)) {
          case (?profile) {
            let updatedProfile = {
              profile with planType = plan;
              dailyLimit = newLimit;
            };
            userProfiles.add(userPrincipal, updatedProfile);
          };
          case (null) {};
        };
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  // ----- Admin: Get all users -----
  public query ({ caller }) func adminGetAllUsers() : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    users.values().toArray();
  };

  // ----- Admin: Get stats -----
  public query ({ caller }) func adminGetStats() : async { totalUsers : Nat; totalRecipes : Nat } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    {
      totalUsers = users.size();
      totalRecipes = recipeCounter;
    };
  };

  // ----- Recipe Management -----
  public shared ({ caller }) func generateRecipe(ingredientsInput : [Text]) : async Recipe {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate recipes");
    };

    let user = getUserOrTrap(caller);

    if (user.dailyRecipeCount >= user.dailyLimit) {
      Runtime.trap("Daily limit reached");
    };

    // Make HTTP call to OpenAI (Simulated)
    let openAIResponse = await OutCall.httpGetRequest("https://icp1.io", [], transform);

    let newRecipe : Recipe = {
      id = recipeCounter.toText();
      userId = caller;
      ingredientsInput;
      generatedRecipe = openAIResponse;
      createdAt = Time.now();
    };

    recipes.add(newRecipe.id, newRecipe);
    recipeCounter += 1;

    // Update user's daily count
    let updatedUser = {
      user with dailyRecipeCount = user.dailyRecipeCount + 1;
    };
    users.add(caller, updatedUser);

    // Update profile daily count
    switch (userProfiles.get(caller)) {
      case (?profile) {
        let updatedProfile = {
          profile with dailyRecipeCount = profile.dailyRecipeCount + 1;
        };
        userProfiles.add(caller, updatedProfile);
      };
      case (null) {};
    };

    newRecipe;
  };

  public query ({ caller }) func getUserRecipes(principal : Principal) : async [Recipe] {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own recipes");
    };
    recipes.values().filter(func(recipe) { recipe.userId == principal }).toArray();
  };

  public shared ({ caller }) func saveRecipe(recipeId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save recipes");
    };

    let user = getUserOrTrap(caller);
    switch (user.planType) {
      case (#free) { Runtime.trap("Only Pro or Premium users can save recipes") };
      case (_) {};
    };

    // Verify the recipe exists
    let _ = getRecipeOrTrap(recipeId);

    let userSavedRecipes = switch (savedRecipes.get(caller)) {
      case (null) { List.empty<Text>() };
      case (?existing) { existing };
    };

    userSavedRecipes.add(recipeId);
    savedRecipes.add(caller, userSavedRecipes);
  };

  public query ({ caller }) func getSavedRecipes(principal : Principal) : async [Recipe] {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own saved recipes");
    };

    switch (savedRecipes.get(principal)) {
      case (null) { [] };
      case (?recipeIds) {
        recipeIds.values().map(func(recipeId) { getRecipeOrTrap(recipeId) }).toArray();
      };
    };
  };

  public shared ({ caller }) func deleteSavedRecipe(recipeId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete saved recipes");
    };

    let user = getUserOrTrap(caller);
    switch (user.planType) {
      case (#free) { Runtime.trap("Only Pro or Premium users can delete saved recipes") };
      case (_) {};
    };

    switch (savedRecipes.get(caller)) {
      case (null) { Runtime.trap("No saved recipes to delete") };
      case (?existing) {
        let filteredRecipes = existing.filter(func(id) { id != recipeId });
        savedRecipes.add(caller, filteredRecipes);
      };
    };
  };

  // ----- Meal Planner & Grocery List -----
  public shared ({ caller }) func generateMealPlan(weekPlan : Text) : async MealPlanner {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate meal plans");
    };

    let user = getUserOrTrap(caller);
    switch (user.planType) {
      case (#premium) {};
      case (_) { Runtime.trap("Meal planner is a premium feature") };
    };

    let mealPlan : MealPlanner = {
      id = mealPlanCounter.toText();
      userId = caller;
      weekPlan;
      createdAt = Time.now();
    };

    mealPlanners.add(mealPlan.id, mealPlan);
    mealPlanCounter += 1;
    mealPlan;
  };

  public query ({ caller }) func getUserMealPlans(principal : Principal) : async [MealPlanner] {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own meal plans");
    };
    mealPlanners.values().filter(func(plan) { plan.userId == principal }).toArray();
  };

  // ----- Subscription Payments -----
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfigOrTrap() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfigOrTrap(), caller, items, successUrl, cancelUrl, transform);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfigOrTrap(), sessionId, transform);
  };

  // ----- Helper Functions -----
  func getUserOrTrap(principal : Principal) : User {
    switch (users.get(principal)) {
      case (null) { Runtime.trap("Could not find user") };
      case (?user) { user };
    };
  };

  func getRecipeOrTrap(id : Text) : Recipe {
    switch (recipes.get(id)) {
      case (null) { Runtime.trap("Could not find recipe") };
      case (?recipe) { recipe };
    };
  };
};
