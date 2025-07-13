import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'India',
  label: '',
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyAddress);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/users/addresses');
      setAddresses(res.data.addresses);
      setDefaultAddress(res.data.defaultAddress);
    } catch (err) {
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/users/addresses', form);
      toast.success('Address added!');
      setForm(emptyAddress);
      setAdding(false);
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/users/addresses/${id}`);
      toast.success('Address deleted!');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    setLoading(true);
    try {
      await axios.put(`/api/users/addresses/${id}/default`);
      toast.success('Default address set!');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to set default address');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr._id);
    setEditForm({ ...addr });
  };

  const handleEditInput = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/users/addresses/${editingId}`, editForm);
      toast.success('Address updated!');
      setEditingId(null);
      setEditForm(emptyAddress);
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm(emptyAddress);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-8">
      <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Addresses</h1>
        {loading && <div className="text-center mb-4">Loading...</div>}
        <div className="mb-8">
          {addresses.length === 0 && <div className="text-gray-500 text-center mb-4">No addresses saved yet.</div>}
          {addresses.map(addr => (
            <div key={addr._id} className={`border rounded-lg p-4 mb-4 ${defaultAddress === addr._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              {editingId === addr._id ? (
                <form onSubmit={handleEditSave} className="space-y-2 mb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input name="label" value={editForm.label} onChange={handleEditInput} className="input-field" placeholder="Label (e.g. Home, Work)" />
                    <input name="street" value={editForm.street} onChange={handleEditInput} className="input-field" placeholder="Street Address" required />
                    <input name="city" value={editForm.city} onChange={handleEditInput} className="input-field" placeholder="City" required />
                    <input name="state" value={editForm.state} onChange={handleEditInput} className="input-field" placeholder="State" required />
                    <input name="zipCode" value={editForm.zipCode} onChange={handleEditInput} className="input-field" placeholder="ZIP Code" required />
                    <input name="country" value={editForm.country} onChange={handleEditInput} className="input-field" placeholder="Country" required />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary" disabled={loading}>Save</button>
                    <button type="button" className="btn-outline" onClick={handleEditCancel} disabled={loading}>Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-lg">{addr.label || 'Address'}</div>
                    {defaultAddress === addr._id && <span className="text-xs text-primary-600 font-bold ml-2">Default</span>}
                  </div>
                  <div className="text-gray-700 text-sm mb-2">
                    {addr.street}, {addr.city}, {addr.state}, {addr.zipCode}, {addr.country}
                  </div>
                  <div className="flex gap-2">
                    {defaultAddress !== addr._id && (
                      <button onClick={() => handleSetDefault(addr._id)} className="text-primary-600 hover:underline text-xs">Set as Default</button>
                    )}
                    <button onClick={() => handleEdit(addr)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDelete(addr._id)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {addresses.length < 5 && (
          <div className="mb-4">
            {!adding ? (
              <button onClick={() => setAdding(true)} className="btn-primary w-full">Add New Address</button>
            ) : (
              <form onSubmit={handleAdd} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="label" value={form.label} onChange={handleInput} className="input-field" placeholder="Label (e.g. Home, Work)" />
                  <input name="street" value={form.street} onChange={handleInput} className="input-field" placeholder="Street Address" required />
                  <input name="city" value={form.city} onChange={handleInput} className="input-field" placeholder="City" required />
                  <input name="state" value={form.state} onChange={handleInput} className="input-field" placeholder="State" required />
                  <input name="zipCode" value={form.zipCode} onChange={handleInput} className="input-field" placeholder="ZIP Code" required />
                  <input name="country" value={form.country} onChange={handleInput} className="input-field" placeholder="Country" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary" disabled={loading}>Save Address</button>
                  <button type="button" className="btn-outline" onClick={() => { setAdding(false); setForm(emptyAddress); }} disabled={loading}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
        {addresses.length >= 5 && (
          <div className="text-center text-sm text-gray-500">You can only save up to 5 addresses.</div>
        )}
      </div>
    </div>
  );
};

export default Addresses; 