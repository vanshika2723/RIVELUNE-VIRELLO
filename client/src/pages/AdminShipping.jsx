
import { useEffect, useState } from "react";
import {
  Truck,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  LoaderCircle,
  X,
  Save,
  Package,
  CheckCircle2,
  Globe,
  Clock,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/admin/shipping";
const AdminShipping = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    zone_name: "",
    city: "",
    shipping_fee: "",
    free_shipping_minimum: "",
    delivery_min_days: 2,
    delivery_max_days: 5,
    status: "active",
  });

 const token = sessionStorage.getItem("rivelune_admin_token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchZones = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, { headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load shipping zones");
      }

      setZones(Array.isArray(data) ? data : data.zones || data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const resetForm = () => {
    setForm({
      zone_name: "",
      city: "",
      shipping_fee: "",
      free_shipping_minimum: "",
      delivery_min_days: 2,
      delivery_max_days: 5,
      status: "active",
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (zone) => {
    setForm({
      zone_name: zone.zone_name || "",
      city: zone.city || "",
      shipping_fee: zone.shipping_fee ?? "",
      free_shipping_minimum: zone.free_shipping_minimum ?? "",
      delivery_min_days: zone.delivery_min_days ?? 2,
      delivery_max_days: zone.delivery_max_days ?? 5,
      status: zone.status || "active",
    });

    setEditingId(zone.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.delivery_min_days) > Number(form.delivery_max_days)) {
      setError("Minimum delivery days cannot exceed maximum delivery days.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          ...form,
          shipping_fee: Number(form.shipping_fee),
          free_shipping_minimum: Number(form.free_shipping_minimum || 0),
          delivery_min_days: Number(form.delivery_min_days),
          delivery_max_days: Number(form.delivery_max_days),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save shipping zone");
      }

      setSuccess(data.message || "Shipping zone saved successfully");
      resetForm();
      await fetchZones();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipping zone?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete shipping zone");
      }

      setSuccess(data.message || "Shipping zone deleted successfully");
      await fetchZones();
    } catch (err) {
      setError(err.message);
    }
  };

  const activeZones = zones.filter((zone) => zone.status === "active");

  const formatCurrency = (amount) =>
    `PKR ${Number(amount || 0).toLocaleString("en-PK")}`;

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
              <Globe size={14} />
              Store Configuration
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Shipping Settings
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage delivery zones, shipping fees and delivery estimates.
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
              setError("");
              setSuccess("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-500"
          >
            <Plus size={18} />
            Add Shipping Zone
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span>{success}</span>
            <button onClick={() => setSuccess("")}>
              <X size={17} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Shipping Zones</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {zones.length}
                </h2>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                <Truck size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Configured delivery regions
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Zones</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {activeZones.length}
                </h2>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-500">
                <CheckCircle2 size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Currently available delivery zones
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Free Shipping Zones</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {zones.filter((zone) => Number(zone.free_shipping_minimum) > 0).length}
                </h2>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-500">
                <Package size={23} />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Zones with free shipping threshold
            </p>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edit Shipping Zone" : "Create Shipping Zone"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure delivery charges and estimated delivery times.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    name="zone_name"
                    value={form.zone_name}
                    onChange={handleChange}
                    placeholder="e.g. Karachi Zone"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="e.g. Karachi"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Shipping Fee (PKR) *
                  </label>
                  <input
                    type="number"
                    name="shipping_fee"
                    min="0"
                    value={form.shipping_fee}
                    onChange={handleChange}
                    placeholder="250"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Free Shipping Minimum (PKR)
                  </label>
                  <input
                    type="number"
                    name="free_shipping_minimum"
                    min="0"
                    value={form.free_shipping_minimum}
                    onChange={handleChange}
                    placeholder="5000"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Minimum Delivery Days *
                  </label>
                  <input
                    type="number"
                    name="delivery_min_days"
                    min="1"
                    value={form.delivery_min_days}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Maximum Delivery Days *
                  </label>
                  <input
                    type="number"
                    name="delivery_max_days"
    min="1"
                    value={form.delivery_max_days}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Zone"
                    : "Save Zone"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Zones Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Delivery Zones</h2>
              <p className="mt-1 text-sm text-gray-500">
                All configured shipping locations
              </p>
            </div>

            <span className="w-fit rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              {zones.length} Zones
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <LoaderCircle size={28} className="animate-spin text-orange-500" />
              <p className="text-sm">Loading shipping zones...</p>
            </div>
          ) : zones.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 rounded-2xl bg-orange-50 p-4 text-orange-500">
                <Truck size={30} />
              </div>
              <h3 className="text-base font-semibold text-gray-800">
                No shipping zones yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Create your first delivery zone to configure shipping charges.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                <Plus size={16} />
                Add First Zone
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-gray-50">
                  <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-semibold">Zone</th>
                    <th className="px-6 py-4 font-semibold">Shipping Fee</th>
                    <th className="px-6 py-4 font-semibold">Free Shipping</th>
                    <th className="px-6 py-4 font-semibold">Delivery Time</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {zones.map((zone) => (
                    <tr
                      key={zone.id}
                      className="transition hover:bg-gray-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                            <MapPin size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {zone.zone_name}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {zone.city}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {formatCurrency(zone.shipping_fee)}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Number(zone.free_shipping_minimum) > 0
                          ? `Above ${formatCurrency(zone.free_shipping_minimum)}`
                          : "Not configured"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={15} className="text-gray-400" />
                          {zone.delivery_min_days}–{zone.delivery_max_days} days
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            zone.status === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {zone.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(zone)}
                            title="Edit zone"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(zone.id)}
                            title="Delete zone"
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-4">
          <Truck size={18} className="mt-0.5 shrink-0 text-orange-500" />
          <p className="text-xs leading-5 text-gray-600">
            Shipping charges and delivery estimates are configured per zone.
            Inactive zones will not be available for active delivery operations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminShipping;
