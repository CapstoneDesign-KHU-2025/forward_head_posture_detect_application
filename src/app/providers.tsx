"use client";

import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useMemo } from "react";

function QueryProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const { status, data } = useSession();

  const userId = data?.user?.id;

  useEffect(() => {
    if (status === "authenticated") {
      queryClient.clear();
    }
  }, [status, queryClient]);

  useEffect(() => {
    if (userId) {
      queryClient.clear();
    }
  }, [userId, queryClient]);

  return <QueryClientProvider client={queryClient}>{children} </QueryClientProvider>;
}

export default function Providers({ children, session }: { children: ReactNode; session?: Session | null }) {
  return (
    <SessionProvider session={session}>
      <QueryProviders>{children}</QueryProviders>
    </SessionProvider>
  );
}
