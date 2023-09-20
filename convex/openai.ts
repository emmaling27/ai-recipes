import OpenAI from "openai";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

export const backfillEmbeddings = internalAction({
  handler: async (ctx) => {
    const recipes = await ctx.runQuery(internal.openai.unembeddedRecipes, {});
    // const input = recipes.map((recipe) =>
    //   [recipe.title, recipe.ingredients, recipe.directions].join(" ")
    // );
    await Promise.all(
      recipes.map(async (recipe) => {
        const input = [
          recipe.title,
          recipe.ingredients,
          recipe.directions,
        ].join(" ");
        const response = await openai.embeddings.create({
          input,
          model: "text-embedding-ada-002",
        });
        const embedding = response.data[0].embedding;
        console.log("got embedding");
        await ctx.runMutation(internal.openai.backfillEmbedding, {
          embedding,
          recipeId: recipe._id,
        });
      })
    );
    return;
  },
});

export const backfillEmbedding = internalMutation({
  args: { embedding: v.array(v.float64()), recipeId: v.id("recipes") },
  handler: async (ctx, { embedding, recipeId }) => {
    const embeddingId = await ctx.db.insert("recipe_embeddings", { embedding });
    await ctx.db.patch(recipeId, { embeddingId });
    return;
  },
});

export const unembeddedRecipes = internalQuery({
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_embedding", (q) => q.eq("embeddingId", undefined))
      .take(10);
    return recipes;
  },
});
