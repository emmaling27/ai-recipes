"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export default function RecipePage({
  params,
}: {
  params: { recipeId: Id<"recipes"> };
}) {
  const recipe = useQuery(api.recipe.getRecipe, { id: params.recipeId });
  return (
    <>
      <h1>{recipe?.title}</h1>
      <h2>Ingredients</h2>
      <ul>
        {recipe?.ingredients.map((ingredient) => (
          <li key={ingredient}>{ingredient}</li>
        ))}
      </ul>
      <h2>Directions</h2>
      <ol>
        {recipe?.directions.map((direction) => (
          <li key={direction}>{direction}</li>
        ))}
      </ol>
    </>
  );
}
