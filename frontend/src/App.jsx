import { useEffect, useMemo, useState } from "react";

const APP_VARIANTS = [
  {
    key: "products",
    name: "Products",
    fields: ["id", "name", "price", "stock"],
    labels: ["ID", "Name", "Price", "Stock"],
    form: { name: "", price: "", stock: "" },
  },
  {
    key: "customers",
    name: "Customers",
    fields: ["id", "name", "email", "phone", "status"],
    labels: ["ID", "Name", "Email", "Phone", "Status"],
    form: { name: "", email: "", phone: "", status: "active" },
  },
  {
    key: "orders",
    name: "Orders",
    fields: ["id", "order_number", "customer_name", "total_amount", "status"],
    labels: ["ID", "Order No.", "Customer", "Amount", "Status"],
    form: { order_number: "", customer_name: "", total_amount: "", status: "draft" },
  },
  {
    key: "inventory",
    name: "Inventory",
    fields: ["id", "sku", "product_name", "quantity", "reorder_level", "location"],
    labels: ["ID", "SKU", "Product", "Qty", "Reorder", "Location"],
    form: { sku: "", product_name: "", quantity: "", reorder_level: "", location: "" },
  },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function App() {
  const [selectedKey, setSelectedKey] = useState("products");
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(APP_VARIANTS[0].form);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentApp = APP_VARIANTS.find((item) => item.key === selectedKey) ?? APP_VARIANTS[0];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${selectedKey}/`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.results ?? [];
      setRecords(list);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm({ ...currentApp.form });
    setEditingId(null);
    setSearch("");
    fetchRecords();
  }, [selectedKey]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) => {
      return Object.values(record).some((value) => String(value).toLowerCase().includes(term));
    });
  }, [records, search]);

  const totalSummary = useMemo(() => {
    if (selectedKey === "products") {
      return {
        count: records.length,
        extra: records.reduce((sum, item) => sum + Number(item.stock || 0), 0),
        label: "Stock total",
      };
    }

    if (selectedKey === "customers") {
      return {
        count: records.filter((item) => item.status === "active").length,
        extra: records.length,
        label: "Active customers",
      };
    }

    if (selectedKey === "orders") {
      return {
        count: records.filter((item) => item.status === "paid").length,
        extra: records.reduce((sum, item) => sum + Number(item.total_amount || 0), 0),
        label: "Revenue",
      };
    }

    return {
      count: records.filter((item) => Number(item.quantity) <= Number(item.reorder_level || 0)).length,
      extra: records.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      label: "Low stock items",
    };
  }, [records, selectedKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...currentApp.form });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form };

    if (selectedKey === "products") {
      payload.price = Number(payload.price);
      payload.stock = Number(payload.stock);
    }

    if (selectedKey === "orders") {
      payload.total_amount = Number(payload.total_amount);
    }

    if (selectedKey === "inventory") {
      payload.quantity = Number(payload.quantity);
      payload.reorder_level = Number(payload.reorder_level);
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/${selectedKey}/${editingId}/` : `${API_BASE}/${selectedKey}/`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || body.error || `HTTP ${response.status}`);
      }

      await fetchRecords();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({ ...record });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`${API_BASE}/${selectedKey}/${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await fetchRecords();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    if (!filteredRecords.length) return;

    const csvRows = filteredRecords.map((record) => {
      return currentApp.fields
        .map((field) => `"${String(record[field] ?? "").replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [currentApp.labels.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedKey}-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="logo-badge">M</div>
          <div>
            <p className="eyebrow small">System</p>
            <h2>Management</h2>
          </div>
        </div>

        <nav className="nav-group" aria-label="Side menu">
          <p className="nav-label">Side Menu</p>
          {APP_VARIANTS.map((item) => (
            <button
              key={`side-${item.key}`}
              className={`nav-item ${selectedKey === item.key ? "active" : ""}`}
              onClick={() => setSelectedKey(item.key)}
            >
              {item.name}
            </button>
          ))}
          <button className="nav-item">CRUD</button>
          <button className="nav-item">Filter</button>
          <button className="nav-item">Report</button>
          <button className="nav-item">Export</button>
        </nav>
      </aside>

      <main className="content-area">
        <header className="topbar">
          <div className="topbar-left">
            <div className="logo-mini">M</div>
            <div>
              <p className="eyebrow small">App suite</p>
              <h1>{currentApp.name}</h1>
            </div>
          </div>

          <nav className="main-menu" aria-label="Main menu">
            <span className="nav-label">Main Menu</span>
            {APP_VARIANTS.map((item) => (
              <button
                key={`main-${item.key}`}
                className={`main-menu-item ${selectedKey === item.key ? "active" : ""}`}
                onClick={() => setSelectedKey(item.key)}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <button className="secondary-button">Alerts</button>
            <div className="user-chip">Admin</div>
          </div>
        </header>

        <nav className="subnav" aria-label="App submenu">
          <button className="subnav-item active">CRUD</button>
          <button className="subnav-item">Filter</button>
          <button className="subnav-item">Report</button>
          <button className="subnav-item" onClick={handleExport}>Export</button>
        </nav>

        <section className="summary-grid">
          <article className="summary-card">
            <span>{selectedKey === "products" ? "Total records" : selectedKey === "customers" ? "Customers" : selectedKey === "orders" ? "Orders" : "Inventory items"}</span>
            <strong>{records.length}</strong>
          </article>
          <article className="summary-card">
            <span>{totalSummary.label}</span>
            <strong>{selectedKey === "orders" ? Number(totalSummary.extra).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : totalSummary.extra}</strong>
          </article>
          <article className="summary-card">
            <span>Filtered</span>
            <strong>{filteredRecords.length}</strong>
          </article>
        </section>

        <div className="workspace-grid">
          <section className="panel table-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow small">CRUD</p>
                <h3>{currentApp.name} List</h3>
              </div>
              <input
                type="search"
                className="search-box"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search all fields"
                aria-label="Filter records"
              />
            </div>

            {loading && <div className="notice">Loading {currentApp.name.toLowerCase()}...</div>}
            {error && <div className="notice error">Unable to load API: {error}</div>}

            {!loading && !error && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {currentApp.labels.map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id}>
                        {currentApp.fields.map((field) => (
                          <td key={`${record.id}-${field}`}>{record[field]}</td>
                        ))}
                        <td className="action-cell">
                          <button className="mini-button" onClick={() => handleEdit(record)}>Edit</button>
                          <button className="mini-button danger" onClick={() => handleDelete(record.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filteredRecords.length === 0 && (
                      <tr>
                        <td colSpan={currentApp.fields.length + 1} className="empty">No records match the filter.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="panel form-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow small">Form</p>
                <h3>{editingId ? `Update ${currentApp.name}` : `Create ${currentApp.name}`}</h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              {Object.keys(currentApp.form).map((field) => {
                const isSelect = field === "status";

                return (
                  <label key={field}>
                    {field.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                    {isSelect ? (
                      <select name={field} value={form[field]} onChange={handleChange}>
                        {selectedKey === "customers" && (
                          <>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </>
                        )}
                        {selectedKey === "orders" && (
                          <>
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="shipped">Shipped</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        name={field}
                        type={field.toLowerCase().includes("amount") || field.toLowerCase().includes("price") || field.toLowerCase().includes("quantity") || field.toLowerCase().includes("reorder") ? "number" : "text"}
                        min={field.toLowerCase().includes("amount") || field.toLowerCase().includes("price") || field.toLowerCase().includes("quantity") || field.toLowerCase().includes("reorder") ? "0" : undefined}
                        step={field.toLowerCase().includes("amount") || field.toLowerCase().includes("price") ? "0.01" : undefined}
                        value={form[field] ?? ""}
                        onChange={handleChange}
                        required
                      />
                    )}
                  </label>
                );
              })}

              <div className="form-actions">
                <button className="primary-button" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                <button className="secondary-button" type="button" onClick={resetForm}>Reset</button>
              </div>
            </form>

            <div className="mini-report">
              <h4>Report</h4>
              <ul>
                <li>Visible rows: {filteredRecords.length}</li>
                <li>Module: {currentApp.name}</li>
                <li>Export available: Yes</li>
              </ul>
            </div>
          </aside>
        </div>

        <footer className="footer-bar">
          <span>{currentApp.name}</span>
          <span>Copyright © 2026</span>
          <span>CRUD • Filter • Report • Export</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
