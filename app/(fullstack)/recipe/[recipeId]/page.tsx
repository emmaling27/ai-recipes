"use client";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export default function RecipePage({
  params,
}: {
  params: { recipeId: Id<"recipes"> };
}) {
  const recipe = useQuery(api.recipe.getRecipe, { id: params.recipeId });
  return <h1>{recipe?.title}</h1>;
}
