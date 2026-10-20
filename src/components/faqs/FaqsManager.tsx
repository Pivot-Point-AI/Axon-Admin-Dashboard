"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useConfirm } from "@/context/FeedbackContext";
import useModal from "@/hooks/useModal";
import { ApiError } from "@/lib/api/client";
import { getFaqs, removeFaq } from "@/lib/api/faqs";
import { faqData, type FAQItem } from "./faqData";
import FaqEditor from "./FaqEditor";
import FaqHeaderSettings from "./FaqHeaderSettings";
import FaqSections from "./FaqSections";
import FaqQuestionsPanel from "./FaqQuestionsPanel";

export default function FaqsManager() {
  const t = useTranslations("faqs");
  const { accessToken } = useAdminAuth();
  const confirm = useConfirm();
  const editor = useModal();
  const [target, setTarget] = useState<FAQItem | null>(null);
  const [data, setData] = useState<ReturnType<typeof faqData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!accessToken) return;
      setLoading(true);
      setError("");
      try {
        const response = await getFaqs(accessToken, signal);
        if (!signal?.aborted) setData(faqData(response));
      } catch (err) {
        if (!signal?.aborted)
          setError(err instanceof ApiError ? err.message : t("loadFailed"));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [accessToken, t],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const sections = [
    ...new Set((data?.items ?? []).map((item) => item.section_title)),
  ];
  const selected =
    selectedSection !== null && sections.includes(selectedSection)
      ? selectedSection
      : null;
  const handleDelete = async (item: FAQItem) => {
    if (
      item.id == null ||
      !accessToken ||
      busyId !== null ||
      !(await confirm(t("deleteConfirm", { question: item.question })))
    )
      return;
    setBusyId(item.id);
    setError("");
    try {
      await removeFaq(item.id, accessToken);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("deleteFailed"));
    } finally {
      setBusyId(null);
    }
  };
  return (
    <div className="space-y-5">
      {data && accessToken && (
        <FaqHeaderSettings
          key={`${data.settings.title}:${data.settings.subtitle}`}
          settings={data.settings}
          accessToken={accessToken}
          onSaved={(settings) =>
            setData((current) => (current ? { ...current, settings } : current))
          }
        />
      )}
      <div className="grid items-start gap-4 xl:grid-cols-7">
        <aside className="hidden min-w-0 xl:col-span-2 xl:block">
          <FaqSections
            items={data?.items ?? []}
            selected={selected}
            onSelect={setSelectedSection}
          />
        </aside>
        <div className="min-w-0 xl:col-span-5">
          <FaqQuestionsPanel
            items={data?.items ?? null}
            selected={selected}
            loading={loading}
            error={error}
            busyId={busyId}
            onRefresh={() => void load()}
            onCreate={() => {
              setTarget(null);
              editor.openModal();
            }}
            onEdit={(item) => {
              setTarget(item);
              editor.openModal();
            }}
            onDelete={(item) => void handleDelete(item)}
            onSelectSection={setSelectedSection}
          />
        </div>
      </div>
      {editor.isOpen && accessToken && (
        <FaqEditor
          item={target}
          accessToken={accessToken}
          sections={sections}
          initialSection={selected ?? ""}
          onClose={editor.closeModal}
          onSaved={() => {
            editor.closeModal();
            void load();
          }}
        />
      )}
    </div>
  );
}
