import { getRequestConfig } from "next-intl/server";

const locales = ["ko", "en"] as const;
const defaultLocale = "en";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  };
});
