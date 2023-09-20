"use client";

import { api } from "@/convex/_generated/api";
import {
  SignOutButton,
  SignUpSignIn,
  useMutationWithAuth,
  useSessionId,
} from "@convex-dev/convex-lucia-auth/react";

export default function Home() {
  const sessionId = useSessionId();
  return (
    <div className="flex flex-col items-center p-20 gap-4">
      {sessionId ? (
        <SignOutButton
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
        disabled:pointer-events-none disabled:opacity-50
        bg-primary text-primary-foreground shadow hover:bg-primary/90
        h-9 px-4 py-2"
        />
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

function AuthForm() {
  const signIn = useMutationWithAuth(api.auth.signIn);
  const signUp = useMutationWithAuth(api.auth.signUp);
  return (
    <SignUpSignIn
      signIn={signIn}
      signUp={signUp}
      labelClassName="mb-4"
      inputClassName="
          flex h-9 rounded-md border border-input bg-transparent px-3 py-1
          text-sm shadow-sm transition-colors file:border-0 file:bg-transparent
          file:text-sm file:font-medium placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          mb-4 w-[18rem]"
      buttonClassName="
          inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:pointer-events-none disabled:opacity-50
          bg-primary text-primary-foreground shadow hover:bg-primary/90
          h-9 px-4 py-2
          cursor-pointer w-full mb-4"
      flowToggleClassName="block font-medium text-primary cursor-pointer text-center hover:underline underline-offset-4"
    />
  );
}
