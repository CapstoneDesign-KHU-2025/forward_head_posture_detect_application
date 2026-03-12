import { getTranslations } from "next-intl/server";

export default async function ContactPage() {
  const t = await getTranslations("ContactPage");

  const FEEDBACK_LINK =
    "https://docs.google.com/forms/d/e/1FAIpQLSeRNoOKH3aNfmu0_JMZFy6Vslur6jfBuNlrj-5-Cekjen9wpw/viewform";

  return (
    <main className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-24 mb-5 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("title")}</h1>
        <p className="text-gray-600 mb-12 leading-relaxed">{t("description")}</p>

        <div className="space-y-8">
          <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t("email.title")}</h2>
            <a
              href={`mailto:${t("email.address")}`}
              className="text-blue-600 hover:underline text-lg font-medium inline-block"
            >
              {t("email.address")}
            </a>
          </section>

          <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{t("feedback.title")}</h2>
            <p className="text-gray-600 mb-4">{t("feedback.text")}</p>
            <a
              href={FEEDBACK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gray-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {t("feedback.linkText")}
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}
