import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArchiveRestore, Loader2, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { FormField, Input, Textarea } from '../ui/FormField';
import { masterDataService } from '../../services/masterDataService';
import { getApiErrorMessage, getApiFieldErrors, validateEmail, validateFields, validateNumber, validateRequired } from '../../lib/validation';

const emptyContact = { name: '', email: '', phone: '', address: '', city: '', state: '', taxNumber: '', creditLimit: '', paymentTerms: '' };

function ContactModal({ kind, isOpen, onClose, onCreated }) {
  const [form, setForm] = useState(emptyContact);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const label = kind === 'customer' ? 'Customer' : 'Vendor';

  useEffect(() => {
    if (isOpen) { setForm(emptyContact); setError(''); setFieldErrors({}); }
  }, [isOpen]);

  const update = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    const errors = validateFields(form, {
      name: value => validateRequired(value, `${label} name`),
      email: value => validateEmail(value),
      creditLimit: value => value === '' ? '' : validateNumber(value, 'Credit limit', { min: 0 })
    });
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setSaving(true); setError('');
    try {
      const response = await masterDataService.createContact({
        contactType: kind, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
        address: form.address.trim(), city: form.city.trim(), state: form.state.trim(), taxNumber: form.taxNumber.trim(),
        creditLimit: form.creditLimit === '' ? 0 : Number(form.creditLimit), paymentTerms: form.paymentTerms.trim(), isActive: true
      });
      onCreated(response.data);
      onClose();
    } catch (err) { setFieldErrors(getApiFieldErrors(err)); setError(getApiErrorMessage(err, `Unable to create ${label.toLowerCase()}.`)); } finally { setSaving(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} title={`Add ${label}`} size="lg"><form onSubmit={submit} className="space-y-5">
    {error && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField label={`${label} name`} required error={fieldErrors.name}><Input name="name" value={form.name} onChange={update} required aria-invalid={Boolean(fieldErrors.name)} /></FormField>
      <FormField label="Email" error={fieldErrors.email}><Input name="email" type="email" value={form.email} onChange={update} placeholder="name@example.com" aria-invalid={Boolean(fieldErrors.email)} /></FormField>
      <FormField label="Phone"><Input name="phone" value={form.phone} onChange={update} /></FormField>
      <FormField label="GSTIN / Tax number"><Input name="taxNumber" value={form.taxNumber} onChange={update} /></FormField>
      <FormField label="Credit limit" error={fieldErrors.creditLimit}><Input name="creditLimit" type="number" min="0" value={form.creditLimit} onChange={update} placeholder="0" aria-invalid={Boolean(fieldErrors.creditLimit)} /></FormField>
      <FormField label="Payment terms"><Input name="paymentTerms" value={form.paymentTerms} onChange={update} placeholder="e.g. Net 30" /></FormField>
      <FormField label="City"><Input name="city" value={form.city} onChange={update} /></FormField>
      <FormField label="State"><Input name="state" value={form.state} onChange={update} /></FormField>
    </div>
    <FormField label="Address"><Textarea name="address" value={form.address} onChange={update} rows={3} /></FormField>
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-3"><Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save {label}</Button></div>
  </form></Modal>;
}

export function ContactDirectory({ kind }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const title = kind === 'customer' ? 'Customers' : 'Vendors';
  const singular = kind === 'customer' ? 'Customer' : 'Vendor';
  const loadContacts = async () => {
    setLoading(true); setError('');
    try {
      const response = await masterDataService.getContacts({ limit: 100, ...(showArchived ? { includeArchived: 'true' } : {}) });
      const records = response.data?.docs || [];
      setContacts(records.filter(contact => contact.contactType === kind || contact.contactType === 'customer_and_vendor'));
    } catch (err) { setError(err.message || `Unable to load ${title.toLowerCase()}.`); } finally { setLoading(false); }
  };
  useEffect(() => { loadContacts(); }, [kind, showArchived]);
  const visibleContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? contacts.filter(contact => [contact.name, contact.email, contact.phone, contact.taxNumber].some(value => value?.toLowerCase().includes(query))) : contacts;
  }, [contacts, search]);

  return <div className="space-y-6">
    <ContactModal kind={kind} isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={(contact) => setContacts(current => [contact, ...current])} />
    <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center"><div><h2 className="mb-1 text-2xl font-bold text-navy">{title}</h2><p className="text-sm text-slate-500">Manage your {showArchived ? 'active and archived' : 'active'} {title.toLowerCase()} and their contact details.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => setShowArchived(value => !value)}><ArchiveRestore className="mr-2 h-4 w-4" />{showArchived ? 'Hide archived' : 'Show archived'}</Button><Button onClick={() => setModalOpen(true)}><Plus className="mr-2 h-4 w-4" />Add {singular}</Button></div></div>
    <Card><CardHeader className="border-b border-slate-100 pb-3"><div className="relative max-w-sm"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal" /></div></CardHeader>
      <CardContent className="overflow-x-auto p-0">{loading ? <div className="flex h-40 items-center justify-center text-slate-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Loading {title.toLowerCase()}...</div> : error ? <div className="p-8 text-center text-red-600"><p>{error}</p><Button className="mt-3" variant="outline" onClick={loadContacts}>Retry</Button></div> : <table className="w-full min-w-205 text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-4 font-medium">{singular}</th><th className="px-6 py-4 font-medium">Contact</th><th className="px-6 py-4 font-medium">City</th><th className="px-6 py-4 font-medium">Terms</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{visibleContacts.length === 0 ? <tr><td colSpan="6" className="p-10 text-center text-slate-500">No {title.toLowerCase()} found.</td></tr> : visibleContacts.map(contact => <tr key={contact._id} className="hover:bg-slate-50/60"><td className="px-6 py-4 font-medium text-royal hover:underline"><Link to={`/dashboard/${kind}s/${contact._id}`}>{contact.name}</Link></td><td className="px-6 py-4 text-slate-600">{contact.email || contact.phone || '—'}</td><td className="px-6 py-4 text-slate-600">{contact.city || '—'}</td><td className="px-6 py-4 text-slate-600">{contact.paymentTerms || '—'}</td><td className="px-6 py-4"><Badge variant={contact.isActive ? 'success' : 'outline'}>{contact.isActive ? 'ACTIVE' : 'ARCHIVED'}</Badge></td><td className="px-6 py-4">{!contact.isActive && <Button variant="outline" size="sm" onClick={async () => { try { await masterDataService.restoreContact(contact._id); await loadContacts(); } catch (err) { setError(getApiErrorMessage(err, 'Unable to restore contact.')); } }}><ArchiveRestore className="mr-1 h-3.5 w-3.5" />Restore</Button>}</td></tr>)}</tbody></table>}</CardContent>
    </Card>
  </div>;
}
