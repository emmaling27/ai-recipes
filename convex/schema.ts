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
  }),
  ...authTables({
    user: {
      email: v.string(),
    },
    session: {},
  }),
});
