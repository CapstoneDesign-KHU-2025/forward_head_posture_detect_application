import { getTranslations } from "next-intl/server";

export default async function TermsOfServicePage() {
  const t = await getTranslations("TermsOfServicePage");

  return (
    <main className="bg-gray-50 py-16 px-6 sm:px-12 lg:px-24 mb-5">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("title")}</h1>

        <p className="text-gray-600 mb-8 text-sm">{t("startDate")}</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("policy.1")}</h2>
          <p className="text-gray-600">{t("description.1.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("policy.2")}</h2>
          <p className="text-gray-600">{t("description.2.text")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("policy.3")}</h2>
          <p className="text-gray-600 mb-3">{t("description.3.title")}</p>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>
              <strong>{t("description.3.list.1.label")}:</strong> {t("description.3.list.1.text")}
            </li>
            <li>
              <strong>{t("description.3.list.2.label")}:</strong> {t("description.3.list.2.text")}
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("policy.4")}</h2>
          <p className="text-gray-600">{t("description.4.text")}</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("policy.5")}</h2>
          <p className="text-gray-600">{t("description.5.text")}</p>
        </section>
      </div>
    </main>
  );
}
