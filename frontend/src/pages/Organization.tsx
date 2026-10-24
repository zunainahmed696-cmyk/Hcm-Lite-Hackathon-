import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SettingsPanel } from '../components/SettingsPanel';
import { CatalogPanel, CatalogField, CatalogColumn } from '../components/CatalogPanel';

const nameField: CatalogField = { key: 'name', label: 'Name', type: 'text' };
const nameCol: CatalogColumn = { header: 'Name', render: (i) => <span className="font-semibold text-white">{i.name}</span> };

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const TABS = [
  { id: 'settings', label: 'Company settings' },
  { id: 'departments', label: 'Departments' },
  { id: 'designations', label: 'Designations' },
  { id: 'leave-types', label: 'Leave types' },
  { id: 'holidays', label: 'Holidays' },
] as const;

export const Organization: React.FC = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin';
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('settings');

  return (
    <div className="max-w-5xl">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Organization</h1>
      <p className="mt-1 mb-6 text-sm text-slate-400">
        {canEdit ? 'Set up the company rules that drive attendance, leave and payroll.' : 'Company rules set by your Admin (read-only).'}
      </p>

      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-slate-800 mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t.id ? 'border-indigo-400 text-white' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && <SettingsPanel canEdit={canEdit} />}
      {tab === 'departments' && (
        <CatalogPanel entity="departments" singular="Department" canEdit={canEdit} fields={[nameField]} columns={[nameCol]} emptyHint="No departments yet. Add your first one." />
      )}
      {tab === 'designations' && (
        <CatalogPanel entity="designations" singular="Designation" canEdit={canEdit} fields={[nameField]} columns={[nameCol]} emptyHint="No designations yet. Add your first one." />
      )}
      {tab === 'leave-types' && (
        <CatalogPanel
          entity="leave-types"
          singular="Leave type"
          canEdit={canEdit}
          fields={[
            { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Annual' },
            { key: 'annualQuota', label: 'Days per year', type: 'number', disabledWhen: 'unlimited', defaultValue: 0 },
            { key: 'isPaid', label: 'Paid leave', type: 'checkbox', defaultValue: true },
            { key: 'unlimited', label: 'Unlimited (no quota)', type: 'checkbox' },
          ]}
          columns={[
            nameCol,
            { header: 'Quota / year', render: (i) => (i.unlimited ? 'Unlimited' : `${i.annualQuota} days`) },
            { header: 'Type', render: (i) => (i.isPaid ? 'Paid' : 'Unpaid') },
          ]}
          emptyHint="No leave types yet. Typical: Annual 14, Sick 8, Casual 10, Unpaid (unlimited)."
        />
      )}
      {tab === 'holidays' && (
        <CatalogPanel
          entity="holidays"
          singular="Holiday"
          canEdit={canEdit}
          fields={[
            { key: 'name', label: 'Name', type: 'text', placeholder: 'e.g. Independence Day' },
            { key: 'date', label: 'Date', type: 'date' },
          ]}
          columns={[{ header: 'Date', render: (i) => formatDate(i.date) }, nameCol]}
          emptyHint="No public holidays yet."
        />
      )}
    </div>
  );
};
