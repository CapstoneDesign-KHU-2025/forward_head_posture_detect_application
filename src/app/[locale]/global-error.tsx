"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default async function GlobalError({
  error,
  params,
}: {
  error: Error & { digest?: string };
  params: { locale: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const { locale } = params;

  return (
    <html lang={locale}>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
