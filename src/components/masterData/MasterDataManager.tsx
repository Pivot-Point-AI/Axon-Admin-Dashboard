"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { asRecordArray } from "@/lib/api/normalize";
import {
  createBank,
  createBiller,
  createBillerCategory,
  createBillerType,
  createCardType,
  createDonation,
  getBanks,
  getBillerCategories,
  getBillerTypes,
  getCardTypes,
  getBillers,
  getDonations,
  removeBank,
  removeBiller,
  removeDonation,
  updateBank,
  updateBiller,
  updateDonation,
} from "@/lib/api/masterData";
import MasterDataSection, {
  type MasterDataField,
  type MasterDataFilter,
} from "./MasterDataSection";

const bankFields: MasterDataField[] = [
  { key: "bank_name", label: "Bank Name", type: "text", required: true },
  { key: "abbreviation", label: "Abbreviation", type: "text" },
  { key: "is_active", label: "Active", type: "checkbox" },
];

// Biller types / categories come back as rows like { type_name } /
// { category_name } (ids and extra columns may be present). Pull out the
// display name and drop deactivated entries.
function namesFrom(payload: unknown, nameKey: string): string[] {
  const names = asRecordArray(payload)
    .filter((row) => row.is_active !== false)
    .map((row) => row[nameKey] ?? row.name)
    .filter((name): name is string => typeof name === "string" && !!name.trim());
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
}

const uniqueSorted = (values: unknown[]) =>
  Array.from(
    new Set(
      values.filter((v): v is string => typeof v === "string" && !!v.trim()),
    ),
  ).sort((a, b) => a.localeCompare(b));

const donationFields: MasterDataField[] = [
  { key: "org_name", label: "Organization Name", type: "text", required: true },
  { key: "is_zakat_eligible", label: "Zakat Eligible", type: "checkbox" },
  { key: "is_donation_eligible", label: "Donation Eligible", type: "checkbox" },
  { key: "is_active", label: "Active", type: "checkbox" },
];

const cardFields: MasterDataField[] = [
  { key: "type_name", label: "Card Type", type: "text", required: true },
  { key: "is_active", label: "Active", type: "checkbox" },
];

const tabs = [
  { key: "banks", label: "Banks" },
  { key: "billers", label: "Billers" },
  { key: "donations", label: "Donations" },
  { key: "cards", label: "Cards" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function MasterDataManager() {
  const { accessToken } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("banks");
  const [billerTypes, setBillerTypes] = useState<string[]>([]);
  const [billerCategories, setBillerCategories] = useState<string[]>([]);

  const loadLookups = useCallback(async () => {
    if (!accessToken) return;
    const [types, categories] = await Promise.allSettled([
      getBillerTypes(accessToken),
      getBillerCategories(accessToken),
    ]);
    if (types.status === "fulfilled") {
      setBillerTypes(namesFrom(types.value, "type_name"));
    }
    if (categories.status === "fulfilled") {
      setBillerCategories(namesFrom(categories.value, "category_name"));
    }
  }, [accessToken]);

  useEffect(() => {
    void Promise.resolve().then(loadLookups);
  }, [loadLookups]);

  // Dropdowns offer every existing value, plus whatever billers already use
  // (covers legacy rows saved before the lookup tables existed).
  const billerFields: MasterDataField[] = [
    { key: "company", label: "Company", type: "text", required: true },
    { key: "abbreviation", label: "Abbreviation", type: "text" },
    {
      key: "biller_type",
      label: "Biller Type",
      type: "creatable",
      creatable: {
        options: (_form, items) =>
          uniqueSorted([...billerTypes, ...items.map((i) => i.biller_type)]),
        onCreate: async (name, token) => {
          await createBillerType({ type_name: name, is_active: true }, token);
          await loadLookups();
        },
      },
    },
    {
      key: "category",
      label: "Category",
      type: "creatable",
      required: true,
      creatable: {
        // Once a biller type is chosen, only categories already used with
        // that type are offered ("Show all options" widens the list).
        options: (form, items) => {
          const all = uniqueSorted([
            ...billerCategories,
            ...items.map((i) => i.category),
          ]);
          const type = String(form.biller_type ?? "");
          if (!type) return all;
          const forType = uniqueSorted(
            items.filter((i) => i.biller_type === type).map((i) => i.category),
          );
          return forType.length > 0 ? forType : all;
        },
        allOptions: (items) =>
          uniqueSorted([...billerCategories, ...items.map((i) => i.category)]),
        onCreate: async (name, token) => {
          await createBillerCategory({ category_name: name, is_active: true }, token);
          await loadLookups();
        },
      },
    },
    { key: "is_active", label: "Active", type: "checkbox" },
  ];

  const billerFilters: MasterDataFilter[] = [
    {
      key: "biller_type",
      label: "Biller Type",
      options: (items) => uniqueSorted(items.map((i) => i.biller_type)),
    },
    {
      key: "category",
      label: "Category",
      options: (items) => uniqueSorted(items.map((i) => i.category)),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "banks" && (
        <MasterDataSection
          title="Banks"
          idField="bank_id"
          fields={bankFields}
          fetchItems={getBanks}
          createItem={(body, token) => createBank(body as never, token)}
          updateItem={(id, body, token) => updateBank(id, body as never, token)}
          removeItem={removeBank}
        />
      )}
      {activeTab === "billers" && (
        <MasterDataSection
          title="Billers"
          idField="biller_id"
          fields={billerFields}
          filters={billerFilters}
          fetchItems={getBillers}
          createItem={(body, token) => createBiller(body as never, token)}
          updateItem={(id, body, token) => updateBiller(id, body as never, token)}
          removeItem={removeBiller}
        />
      )}
      {activeTab === "donations" && (
        <MasterDataSection
          title="Donations"
          idField="org_id"
          fields={donationFields}
          preserveKeys={["synonyms"]}
          fetchItems={getDonations}
          createItem={(body, token) => createDonation(body as never, token)}
          updateItem={(id, body, token) => updateDonation(id, body as never, token)}
          removeItem={removeDonation}
        />
      )}
      {activeTab === "cards" && (
        <MasterDataSection
          title="Card Types"
          idField="card_type_id"
          fields={cardFields}
          fetchItems={getCardTypes}
          createItem={(body, token) => createCardType(body as never, token)}
        />
      )}
    </div>
  );
}
