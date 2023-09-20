import { internalMutation } from "./_generated/server";

export const cleanRecipeData = internalMutation({
  handler: async (ctx) => {
    const allRecipes = await ctx.db.query("recipes").collect();
    for (const recipe of allRecipes) {
      if (typeof recipe.NER == "string") {
        recipe.NER = JSON.parse(recipe.NER);
      }
      if (typeof recipe.directions == "string") {
        recipe.directions = JSON.parse(recipe.directions);
      }
      if (typeof recipe.ingredients == "string") {
        recipe.ingredients = JSON.parse(recipe.ingredients);
      }
      await ctx.db.patch(recipe._id, recipe);
    }
  },
});
