import * as Sentry from "@sentry/nextjs";

export const logger = {
  error: (context: string, error: unknown, userId?: string) => {
    if (process.env.NODE_ENV === "production") {
      Sentry.withScope((scope) => {
        scope.setTag("context", context);
        if (userId) scope.setUser({ id: userId });
        Sentry.captureException(error);
      });
      return;
    }
    console.error(`🚩 [${context}]`, error);
  },
};
