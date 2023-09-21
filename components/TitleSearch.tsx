"use client";
import { useState } from "react";
import { Input } from "./ui/input";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function TitleSearch() {
  const [searchText, setSearchText] = useState("");
  const searchResults =
    useQuery(api.searchRecipes.default, { text: searchText }) || [];
  return (
    <>
      <Input
        type="text"
        placeholder="Recipe"
        onChange={(event) => setSearchText(event.target.value)}
      />
      <ul>
        {searchResults.map((recipe) => (
          <li key={recipe._id}>
            <Link href={`/recipe/${recipe._id}`}>{recipe.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
