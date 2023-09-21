"use client";
import { FakeWordList } from "@/components/helpers/FakeWordList";
import { StickyHeader } from "@/components/layout/sticky-header";
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
      <StickyHeader className="p-2">{recipe?.title}</StickyHeader>
      {/* For Footer to appear at the bottom, and the page
              to not have unnecessary scrollbar, the subtrahend
              inside calc() must be the same height as the header + footer */}
      <div className="grid grid-cols-[240px_minmax(0,1fr)]">
        <StickySidebar className="top-[calc(2.5rem+1px)] h-[calc(100vh-(5rem+2px))]">
          <div>Sticky sidebar</div>
          <FakeWordList count={60} length={[4, 15]} />
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
          </div>
        </main>
      </div>
    </>
  );
}
