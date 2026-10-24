import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { Alert, Field, Spinner, SubmitButton } from './ui';

export interface CatalogField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'checkbox';
  placeholder?: string;
  /** Disable this input when another field value is truthy (e.g. quota when unlimited). */
  disabledWhen?: string;
  defaultValue?: string | number | boolean;
}

export interface CatalogColumn {
  header: string;
  render: (item: any) => React.ReactNode;
}

interface Props {
  entity: string; // API segment: departments | designations | leave-types | holidays
  singular: string;
  fields: CatalogField[];
  columns: CatalogColumn[];
  canEdit: boolean;
  emptyHint: string;
}

const blankValues = (fields: CatalogField[]) =>
  Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? (f.type === 'checkbox' ? false : '')]));

/** Generic list + add/edit/delete panel used by every Admin-managed catalog. */
export const CatalogPanel: React.FC<Props> = ({ entity, singular, fields, columns, canEdit, emptyHint }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [values, setValues] = useState<Record<string, any>>(blankValues(fields));
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await api.get(`/org/catalog/${entity}`);
      setItems(res.data.items);
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setValues(blankValues(fields));
    setFormError('');
    setEditing('new');
  };

  const openEdit = (item: any) => {
    setValues({ ...blankValues(fields), ...Object.fromEntries(fields.map((f) => [f.key, item[f.key]])) });
    setFormError('');
    setEditing(item._id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const payload = Object.fromEntries(
      fields.map((f) => [f.key, f.type === 'number' ? (values[f.key] === '' ? '' : Number(values[f.key])) : values[f.key]])
    );
    try {
      if (editing === 'new') await api.post(`/org/catalog/${entity}`, payload);
      else await api.put(`/org/catalog/${entity}/${editing}`, payload);
      setEditing(null);
      await load();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: any) => {
    if (!window.confirm(`Delete this ${singular.toLowerCase()}?`)) return;
    try {
      await api.delete(`/org/catalog/${entity}/${item._id}`);
      await load();
    } catch (err) {
      setLoadError(errorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">{items.length} {items.length === 1 ? 'entry' : 'entries'}</p>
        {canEdit && (
          <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
            <Plus className="w-4 h-4" /> Add {singular.toLowerCase()}
          </button>
        )}
      </div>

      {loadError && <div className="mb-4"><Alert>{loadError}</Alert></div>}

      {editing && (
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-indigo-400/30 bg-slate-900/70 p-5 space-y-4" noValidate>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{editing === 'new' ? `New ${singular.toLowerCase()}` : `Edit ${singular.toLowerCase()}`}</h3>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close form" className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          {formError && <Alert>{formError}</Alert>}
          <div className="grid sm:grid-cols-2 gap-4">
            {fields.map((f) =>
              f.type === 'checkbox' ? (
                <label key={f.key} className="flex items-center gap-2.5 text-sm text-slate-200 sm:pt-6">
                  <input
                    type="checkbox"
                    checked={!!values[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  {f.label}
                </label>
              ) : (
                <Field
                  key={f.key}
                  id={`${entity}-${f.key}`}
                  label={f.label}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ''}
                  disabled={!!f.disabledWhen && !!values[f.disabledWhen]}
                  min={f.type === 'number' ? 0 : undefined}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                />
              )
            )}
          </div>
          <div className="max-w-xs"><SubmitButton loading={saving}>Save</SubmitButton></div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              {columns.map((c) => <th key={c.header} className="px-4 py-3 font-semibold">{c.header}</th>)}
              {canEdit && <th className="px-4 py-3 w-24" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400"><Spinner className="inline w-5 h-5 mr-2" />Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">{emptyHint}</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                  {columns.map((c) => <td key={c.header} className="px-4 py-3 text-slate-200">{c.render(item)}</td>)}
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(item)} aria-label="Edit" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(item)} aria-label="Delete" className="p-2 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
