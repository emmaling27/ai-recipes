import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/convex-lucia-auth";
import { v } from "convex/values";

export default defineSchema({
  recipes: defineTable({
    NER: v.string(),
    directions: v.string(),
    id: v.float64(),
    ingredients: v.string(),
    link: v.string(),
    source: v.string(),
    title: v.string(),
    embeddingId: v.optional(v.id("recipe_embeddings")),
  })
    .index("by_embedding", ["embeddingId"])
    .searchIndex("search_title", {
      searchField: "title",
    }),
  recipe_embeddings: defineTable({
    embedding: v.array(v.float64()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536,
  }),
  ...authTables({
    user: {
      email: v.string(),
    },
    session: {},
  }),
});
