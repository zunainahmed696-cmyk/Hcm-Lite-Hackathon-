import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import api, { errorMessage } from '../api/axios';
import { Alert, Field, Spinner, SubmitButton } from './ui';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Form {
  companyName: string;
  officeStart: string;
  graceMinutes: string;
  halfDayHours: string;
  weekend: number[];
  lat: string;
  lng: string;
  radiusMeters: string;
}

const toForm = (s: any): Form => ({
  companyName: s.companyName ?? '',
  officeStart: s.officeStart ?? '09:00',
  graceMinutes: String(s.graceMinutes ?? 15),
  halfDayHours: String(s.halfDayHours ?? 5),
  weekend: s.weekend ?? [0, 6],
  lat: s.office?.lat == null ? '' : String(s.office.lat),
  lng: s.office?.lng == null ? '' : String(s.office.lng),
  radiusMeters: String(s.office?.radiusMeters ?? 150),
});

/** Company profile, office hours and geofence. Admin edits; HR sees it read-only. */
export const SettingsPanel: React.FC<{ canEdit: boolean }> = ({ canEdit }) => {
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    api.get('/org/settings').then((r) => setForm(toForm(r.data.settings))).catch((e) => setError(errorMessage(e)));
  }, []);

  if (!form) return error ? <Alert>{error}</Alert> : <div className="py-10 text-center text-slate-400"><Spinner className="inline w-5 h-5 mr-2" />Loading…</div>;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => { setSaved(false); setForm({ ...form, [k]: e.target.value }); };
  const toggleDay = (d: number) => {
    setSaved(false);
    setForm({ ...form, weekend: form.weekend.includes(d) ? form.weekend.filter((x) => x !== d) : [...form.weekend, d] });
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return setError('Geolocation is not supported by this browser.');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => f && { ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        setLocating(false);
        setSaved(false);
      },
      () => { setError('Could not read your location. Allow location access or type the coordinates.'); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    const hasCoords = form.lat !== '' && form.lng !== '';
    if ((form.lat !== '') !== (form.lng !== '')) return setError('Enter both latitude and longitude, or leave both empty.');
    setSaving(true);
    try {
      const res = await api.put('/org/settings', {
        companyName: form.companyName,
        officeStart: form.officeStart,
        graceMinutes: Number(form.graceMinutes),
        halfDayHours: Number(form.halfDayHours),
        weekend: form.weekend,
        office: { lat: hasCoords ? Number(form.lat) : null, lng: hasCoords ? Number(form.lng) : null, radiusMeters: Number(form.radiusMeters) },
      });
      setForm(toForm(res.data.settings));
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-8 max-w-3xl" noValidate>
      {error && <Alert>{error}</Alert>}
      {saved && <Alert kind="success">Settings saved. New rules apply to new records only.</Alert>}
      <fieldset disabled={!canEdit || saving} className="space-y-8 disabled:opacity-80">
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">Company</h3>
          <Field id="companyName" label="Company name" value={form.companyName} onChange={set('companyName')} />
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">Working hours</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field id="officeStart" type="time" label="Office start" value={form.officeStart} onChange={set('officeStart')} />
            <Field id="graceMinutes" type="number" min={0} label="Grace (minutes)" value={form.graceMinutes} onChange={set('graceMinutes')} />
            <Field id="halfDayHours" type="number" min={1} step="0.5" label="Half day under (hours)" value={form.halfDayHours} onChange={set('halfDayHours')} />
          </div>
          <div>
            <p className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Weekend</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => {
                const on = form.weekend.includes(i);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    aria-pressed={on}
                    className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold border transition ${on ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200' : 'border-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">Office location (for camera attendance)</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field id="lat" type="number" step="any" label="Latitude" placeholder="24.8607" value={form.lat} onChange={set('lat')} />
            <Field id="lng" type="number" step="any" label="Longitude" placeholder="67.0011" value={form.lng} onChange={set('lng')} />
            <Field id="radiusMeters" type="number" min={10} label="Radius (meters)" value={form.radiusMeters} onChange={set('radiusMeters')} />
          </div>
          {canEdit && (
            <button type="button" onClick={useMyLocation} disabled={locating} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200">
              {locating ? <Spinner className="w-4 h-4" /> : <MapPin className="w-4 h-4" />} Use my current location
            </button>
          )}
        </section>
      </fieldset>

      {canEdit ? <div className="max-w-xs"><SubmitButton id="settings-save" loading={saving}>Save settings</SubmitButton></div> : <p className="text-xs text-slate-500">Only the Admin can change company settings.</p>}
    </form>
  );
};
