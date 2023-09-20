import { v } from "convex/values";
import { query } from "./_generated/server";

export default query({
  args: { text: v.string() },
  handler(ctx, args) {
    return ctx.db
      .query("recipes")
      .withSearchIndex("search_title", (q) => q.search("title", args.text))
      .take(10);
  },
});
