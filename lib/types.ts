import { Id } from "../convex/_generated/dataModel";

export type RecipeTitle = {
  _id: Id<"recipes">;
  title: string;
};

export type RecipeContent = {
  title: string;
  ingredients: string[];
  directions: string[];
}

export type DietaryRestriction = "glutenFree" | "vegan";