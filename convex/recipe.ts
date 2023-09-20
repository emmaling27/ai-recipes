import { v } from "convex/values";
import { query } from "./_generated/server";

export const getRecipe = query({
  args: { id: v.id("recipes") },
  handler(ctx, args) {
    return ctx.db.get(args.id);
  },
});
