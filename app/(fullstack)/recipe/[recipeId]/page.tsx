"use client";
import { StickyHeader } from "@/components/layout/sticky-header";
import { StickySidebar } from "@/components/layout/sticky-sidebar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DietaryRestriction, RecipeContent, RecipeTitle } from "@/lib/types";
import { useAction, useQuery } from "convex/react";
import Link from "next/link";
import { useState } from "react";

export default function RecipePage({
  params,
}: {
  params: { recipeId: Id<"recipes"> };
}) {
  const recipeId = params.recipeId;
  const recipe = useQuery(api.recipe.getRecipe, { id: recipeId });
  const similarRecipesAction = useAction(api.recipe.similarRecipes);
  const newRecipeAction = useAction(api.openai.generateNewRecipe);
  const [similarRecipes, setSimilarRecipes] = useState<RecipeTitle[]>([]);
  const fetchSimilarRecipes = async () => {
    const similarRecipes = await similarRecipesAction({
      recipeId,
      embeddingId: recipe?.embeddingId,
    });
    setSimilarRecipes(similarRecipes);
  };
  fetchSimilarRecipes();
  const [newRecipe, setNewRecipe] = useState<RecipeContent | null>();
  const fetchNewRecipe = async (dietaryRestriction: DietaryRestriction) => {
    const newRecipe = await newRecipeAction({
      recipeId,
      dietaryRestriction,
    });

    setNewRecipe(newRecipe);
  };
  return (
    <>
      <StickyHeader className="p-2">{recipe?.title}</StickyHeader>
      <div className="grid grid-cols-[240px_minmax(0,1fr)]">
        <StickySidebar className="top-[calc(2.5rem+1px)] h-[calc(100vh-(5rem+2px))]">
          <h2>Similar recipes</h2>
          <ul>
            {similarRecipes.map((recipe) => (
              <li key={recipe._id}>
                <Link href={`/recipe/${recipe._id}`}>{recipe.title}</Link>
              </li>
            ))}
          </ul>
        </StickySidebar>
        <main className="h-[calc(100vh-(5rem+2px))] p-4">
          <div className="w-full h-full overflow-scroll">
            <div className="p-4 bg-slate-100">
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
            </div>
            <Button
              variant="outline"
              onClick={() => fetchNewRecipe("glutenFree")}
            >
              Make it gluten free!
            </Button>
            <Button variant="outline" onClick={() => fetchNewRecipe("vegan")}>
              Make it vegan!
            </Button>
            {newRecipe && (
              <>
                <h2>Ingredients</h2>
                <ul>
                  {newRecipe.ingredients.map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
                <h2>Directions</h2>
                <ol>
                  {newRecipe.directions.map((direction) => (
                    <li key={direction}>{direction}</li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
