"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Switch from "@/components/form/input/Switch";
import { ApiError } from "@/lib/api/client";
import { updateDashboardUser } from "@/lib/api/adminUsers";
import type { DashboardUserResponse } from "@/lib/api/types";

interface EditUserModalProps {
  user: DashboardUserResponse;
  accessToken: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export default function EditUserModal({
  user,
  accessToken,
  onClose,
  onSaved,
}: EditUserModalProps) {
  const t = useTranslations("userEditor");
  const common = useTranslations("common");
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.is_active);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const changed =
    username.trim() !== user.username.trim() ||
    email.trim() !== user.email.trim() ||
    role !== user.role ||
    active !== user.is_active;
  const roles = Array.from(new Set([user.role, "MANAGER", "VIEWER"]));

  const save = async () => {
    if (!changed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateDashboardUser(
        user.user_id,
        {
          username: username.trim(),
          email: email.trim(),
          role,
          is_active: active,
        },
        accessToken,
      );
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={() => {
        if (!submitting) onClose();
      }}
      className="max-w-md p-6"
    >
      <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </h4>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset disabled={submitting} className="space-y-4">
          <div>
            <Label htmlFor="edit-username">{t("username")}</Label>
            <Input
              id="edit-username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-email">{t("email")}</Label>
            <Input
              id="edit-email"
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-role">{t("role")}</Label>
            <select
              id="edit-role"
              required
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            >
              {roles.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <Switch
            id="edit-user-active"
            label={t("active")}
            checked={active}
            onChange={setActive}
          />
        </fieldset>
        {error && (
          <p
            role="alert"
            className="text-sm text-error-600 dark:text-error-400"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={submitting || !changed || !username.trim() || !email.trim()}
        >
          {submitting ? t("saving") : common("saveChanges")}
        </Button>
      </form>
    </Modal>
  );
}
