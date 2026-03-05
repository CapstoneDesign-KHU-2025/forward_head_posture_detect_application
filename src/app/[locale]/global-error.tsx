"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect, use } from "react";

export default function GlobalError({
  error,
  params,
}: {
  error: Error & { digest?: string };
  params: Promise<{ locale: string }>;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const { locale } = use(params);

  return (
    <html lang={locale}>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
