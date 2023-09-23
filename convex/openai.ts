import OpenAI from "openai";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import { Doc } from "./_generated/dataModel";
import { ChatCompletion } from "openai/resources/chat";

const GLUTEN_FREE_PROMPT =
  "Create a gluten free version of the following recipe and return it in the same JSON format as the original recipe.";

const VEGAN_PROMPT =
  "Create a vegan version of the following recipe. Don't just describe the new ingredients as vegan, actually find substitutes. Return it in the same JSON format as the original recipe.";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

export const backfillEmbeddings = internalAction({
  handler: async (ctx) => {
    let recipes = await ctx.runQuery(internal.openai.unembeddedRecipes, {});
    while (recipes.length > 0) {
      const input = recipes.map((recipe: Doc<"recipes">) =>
        [recipe.title, recipe.ingredients, recipe.directions].join(" ")
      );
      const response = await openai.embeddings.create({
        input,
        model: "text-embedding-ada-002",
      });
      for (let i = 0; i < response.data.length; i++) {
        const embedding = response.data[i].embedding;
        await ctx.runMutation(internal.openai.backfillEmbedding, {
          embedding,
          recipeId: recipes[i]._id,
        });
      }
      recipes = await ctx.runQuery(internal.openai.unembeddedRecipes, {});
    }
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
      .take(50);
    return recipes;
  },
});

export const generateNewRecipe = action({
  args: {
    recipeId: v.id("recipes"),
    dietaryRestriction: v.union(v.literal("glutenFree"), v.literal("vegan")),
  },
  handler: async (ctx, { recipeId, dietaryRestriction }) => {
    const recipe: Doc<"recipes"> | null = await ctx.runQuery(
      api.recipe.getRecipe,
      {
        id: recipeId,
      }
    );
    if (!recipe) {
      throw new Error(`Could not find recipe ${recipeId}`);
    }
    const prompt =
      dietaryRestriction === "glutenFree" ? GLUTEN_FREE_PROMPT : VEGAN_PROMPT;
    const response: ChatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
        {
          role: "user",
          content: JSON.stringify({
            NER: recipe.NER,
            directions: recipe.directions,
            ingredients: recipe.ingredients,
            title: recipe.title,
          }),
        },
      ],
    });
    const content = response.choices[0].message.content;
    if (content === null) {
      throw new Error("OpenAI returned null response");
    }
    const json = JSON.parse(content);
    const newRecipe = {
      NER: json.NER,
      directions: json.directions,
      ingredients: json.ingredients,
      title: json.title,
    };
    // await ctx.runMutation(api.recipe.insertGlutenFreeRecipe, {
    //   NER: json.NER,
    //   directions: json.directions,
    //   ingredients: json.ingredients,
    //   title: json.title,
    //   originalRecipe: recipeId,
    // });
    return newRecipe;
  },
});
