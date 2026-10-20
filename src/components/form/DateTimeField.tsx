"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import DateField from "@/components/form/DateField";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { CalenderIcon } from "@/icons";
import useRequiredFields from "@/hooks/useRequiredFields";
import useModal from "@/hooks/useModal";
import { isFutureDateTime, nextMinuteValue } from "@/utils/dateTime";

interface DateTimeFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export default function DateTimeField({
  id,
  value,
  onChange,
  error = false,
}: DateTimeFieldProps) {
  const t = useTranslations("fixes");
  const required = useRequiredFields();
  const { isOpen: open, openModal, closeModal } = useModal();
  const [minimum, setMinimum] = useState("");
  const [pastError, setPastError] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  useEffect(() => {
    if (!open) return;
    const timer = window.setInterval(() => setMinimum(nextMinuteValue()), 1000);
    return () => window.clearInterval(timer);
  }, [open]);
  return (
    <>
      <button
        id={id}
        type="button"
        data-invalid={error || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          required.reset();
          setPastError(false);
          const earliest = nextMinuteValue();
          setMinimum(earliest);
          const [day, clock] = value.split("T");
          setDate(day ?? "");
          setTime(clock || earliest.split("T")[1]);
          openModal();
        }}
        className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-gray-300 bg-white px-4 text-start text-sm text-gray-800 transition-colors hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:hover:border-brand-400"
      >
        <span>
          {value ? new Date(value).toLocaleString() : t("chooseDate")}
        </span>
        <CalenderIcon className="size-5 shrink-0 text-brand-500 dark:text-brand-400" />
      </button>
      <Modal
        isOpen={open}
        onClose={closeModal}
        ariaLabel={t("chooseDate")}
        className="max-w-md p-6"
      >
        <h3 className="mb-5 pe-12 text-lg font-semibold text-gray-900 dark:text-white">
          {t("chooseDate")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <DateField
            id={`${id}-date`}
            label={t("date")}
            value={date}
            min={minimum.split("T")[0]}
            error={required.invalid(date)}
            onChange={(value) => {
              setDate(value);
              setPastError(false);
            }}
            required
          />
          <div>
            <Label htmlFor={`${id}-time`}>{t("time")}</Label>
            <Input
              id={`${id}-time`}
              type="time"
              value={time}
              min={
                date === minimum.split("T")[0]
                  ? minimum.split("T")[1]
                  : undefined
              }
              error={required.invalid(time)}
              onChange={(e) => {
                setTime(e.target.value);
                setPastError(false);
              }}
              required
            />
          </div>
        </div>
        {pastError && (
          <p
            role="alert"
            className="mt-3 text-sm text-error-600 dark:text-error-400"
          >
            {t("futureDateRequired")}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={closeModal}>
            {t("cancel")}
          </Button>
          <Button
            onClick={() => {
              if (!required.validate([date, time])) return;
              if (!isFutureDateTime(`${date}T${time}`)) {
                setPastError(true);
                return;
              }
              onChange(`${date}T${time}`);
              closeModal();
            }}
          >
            {t("saveDate")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
