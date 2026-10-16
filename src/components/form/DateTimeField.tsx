"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import DateField from "@/components/form/DateField";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { CalenderIcon } from "@/icons";

interface DateTimeFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export default function DateTimeField({
  id,
  value,
  onChange,
}: DateTimeFieldProps) {
  const t = useTranslations("fixes");
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => {
          const [day, clock] = value.split("T");
          setDate(day ?? "");
          setTime(clock || "00:00");
          setOpen(true);
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
        onClose={() => setOpen(false)}
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
            onChange={setDate}
            required
          />
          <div>
            <Label htmlFor={`${id}-time`}>{t("time")}</Label>
            <Input
              id={`${id}-time`}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button
            disabled={!date || !time}
            onClick={() => {
              onChange(`${date}T${time}`);
              setOpen(false);
            }}
          >
            {t("saveDate")}
          </Button>
        </div>
      </Modal>
    </>
  );
}
