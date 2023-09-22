import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { RecipeTitle } from "../lib/types";

export const getRecipe = query({
  args: { id: v.id("recipes") },
  handler(ctx, args) {
    return ctx.db.get(args.id);
  },
});

export const getRecipeTitleByEmbedding = query({
  args: { embeddingId: v.id("recipe_embeddings") },
  handler: async (ctx, { embeddingId }) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_embedding", (q) => q.eq("embeddingId", embeddingId))
      .collect();
    if (recipes.length > 1) {
      const recipeIds = recipes.map((recipe) => recipe._id);
      throw new Error(`Duplicate embeddings found for recipes: ${recipeIds}`);
    }
    if (recipes.length == 0) {
      throw new Error(`Found no recipes with embedding id: ${embeddingId}`);
    }
    const recipe = recipes[0];
    return { _id: recipe._id, title: recipe.title };
  },
});

export const similarRecipes = action({
  args: {
    recipeId: v.id("recipes"),
    embeddingId: v.optional(v.id("recipe_embeddings")),
  },
  handler: async (ctx, { recipeId, embeddingId }): Promise<RecipeTitle[]> => {
    if (!embeddingId) {
      return [];
    }
    const embedding = await ctx.runQuery(api.recipe.getEmbedding, {
      id: embeddingId,
    });
    if (!embedding) {
      throw new Error(`Could not find embedding ${embeddingId}`);
    }
    const similarEmbeddings = await ctx.vectorSearch(
      "recipe_embeddings",
      "by_embedding",
      {
        vector: embedding.embedding,
        limit: 10,
      }
    );
    const similarRecipes = await Promise.all(
      similarEmbeddings.map(async (embedding) => {
        return await ctx.runQuery(api.recipe.getRecipeTitleByEmbedding, {
          embeddingId: embedding._id,
        });
      })
    );

    return similarRecipes.filter((recipe) => recipe._id != recipeId);
  },
});

export const getEmbedding = query({
  args: { id: v.id("recipe_embeddings") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const insertGlutenFreeRecipe = mutation({
  args: {
    NER: v.array(v.string()),
    directions: v.array(v.string()),
    ingredients: v.array(v.string()),
    title: v.string(),
    originalRecipe: v.id("recipes"),
  },
  handler: async (
    ctx,
    { NER, directions, ingredients, title, originalRecipe }
  ) => {
    const recipeId = await ctx.db.insert("glutenFreeRecipes", {
      NER,
      directions,
      ingredients,
      title,
      originalRecipe,
    });
    return recipeId;
  },
});
