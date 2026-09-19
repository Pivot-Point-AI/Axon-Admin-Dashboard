"use client";

import { useState } from "react";
import { cn } from "@/utils";
import {
  createBank,
  createBiller,
  createDonation,
  getBanks,
  getBillers,
  getDonations,
  removeBank,
  removeBiller,
  removeDonation,
  updateBank,
  updateBiller,
  updateDonation,
} from "@/lib/api/masterData";
import MasterDataSection, { type MasterDataField } from "./MasterDataSection";

const bankFields: MasterDataField[] = [
  { key: "bank_name", label: "Bank Name", type: "text", required: true },
  { key: "abbreviation", label: "Abbreviation", type: "text" },
  { key: "is_active", label: "Active", type: "checkbox" },
];

const billerFields: MasterDataField[] = [
  { key: "company", label: "Company", type: "text", required: true },
  { key: "abbreviation", label: "Abbreviation", type: "text" },
  { key: "biller_type", label: "Biller Type", type: "text" },
  { key: "category", label: "Category", type: "text", required: true },
  { key: "is_active", label: "Active", type: "checkbox" },
];

const donationFields: MasterDataField[] = [
  { key: "org_name", label: "Organization Name", type: "text", required: true },
  { key: "is_zakat_eligible", label: "Zakat Eligible", type: "checkbox" },
  { key: "is_donation_eligible", label: "Donation Eligible", type: "checkbox" },
  { key: "synonyms", label: "Synonyms", type: "text" },
  { key: "is_active", label: "Active", type: "checkbox" },
];

const tabs = [
  { key: "banks", label: "Banks" },
  { key: "billers", label: "Billers" },
  { key: "donations", label: "Donations" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function MasterDataManager() {
  const [activeTab, setActiveTab] = useState<TabKey>("banks");

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
          fetchItems={getDonations}
          createItem={(body, token) => createDonation(body as never, token)}
          updateItem={(id, body, token) => updateDonation(id, body as never, token)}
          removeItem={removeDonation}
        />
      )}
    </div>
  );
}
