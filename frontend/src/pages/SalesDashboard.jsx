import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  pending:    { bg: "#fff7ed", color: "#c05621", label: "Pending" },
  confirmed:  { bg: "#f0fff4", color: "#276749", label: "Confirmed" },
  shipped:    { bg: "#ebf8ff", color: "#2b6cb0", label: "Shipped" },
  delivered:  { bg: "#e9d8fd", color: "#553c9a", label: "Delivered" },
  cancelled:  { bg: "#fff5f5", color: "#c53030", label: "Cancelled" },
};

function StatCard({ label, revenue, orders, accent }) {
  return (
    <div style={{
      background: "white", borderRadius: 12, padding: "24px 28px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.07)", borderTop: `4px solid ${accent}`,
      flex: 1, minWidth: 180,
    }}>
      <div style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 12 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "var(--dark)", lineHeight: 1, marginBottom: 8 }}>
        ₹{revenue.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
      </div>
      <div style={{ fontSize: "0.88rem", color: "#888" }}>
        {orders} {orders === 1 ? "order" : "orders"}
      </div>
    </div>
  );
}

function RevenueChart({ data, mode, onModeChange }) {
  const [hovered, setHovered] = useState(null);

  if (!data.length) return null;

  const values = data.map((d) => (mode === "revenue" ? d.revenue : d.orders));
  const maxVal = Math.max(...values, 1);

  const W = 800, H = 220, padL = 54, padR = 12, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const slotW = chartW / data.length;
  const barW = Math.max(Math.floor(slotW * 0.7), 4);
  const gridCount = 4;

  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => ({
    frac: i / gridCount,
    y: padT + chartH - (i / gridCount) * chartH,
    val: (i / gridCount) * maxVal,
  }));

  return (
    <div style={{ background: "white", borderRadius: 12, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.1rem", color: "var(--dark)" }}>
          Last 30 Days
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          {["revenue", "orders"].map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                padding: "6px 16px", border: "1.5px solid var(--primary)", borderRadius: 20,
                cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", textTransform: "capitalize",
                background: mode === m ? "var(--primary)" : "transparent",
                color: mode === m ? "white" : "var(--primary)",
                transition: "all 0.15s",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: "100%", minWidth: 420, overflow: "visible", display: "block" }}
        >
          {/* Grid lines + Y labels */}
          {gridLines.map((g, i) => (
            <g key={i}>
              <line x1={padL} y1={g.y} x2={W - padR} y2={g.y} stroke="#f0f0f0" strokeWidth={1} />
              <text x={padL - 6} y={g.y + 4} textAnchor="end" fontSize={9} fill="#aaa" fontFamily="monospace">
                {mode === "revenue"
                  ? g.val >= 1000 ? `₹${(g.val / 1000).toFixed(1)}k` : `₹${Math.round(g.val)}`
                  : Math.round(g.val)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const barH = values[i] > 0 ? Math.max((values[i] / maxVal) * chartH, 3) : 0;
            const x = padL + i * slotW + (slotW - barW) / 2;
            const y = padT + chartH - barH;
            const isHov = hovered === i;

            return (
              <g key={d.date} style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* hover highlight column */}
                {isHov && (
                  <rect x={padL + i * slotW} y={padT} width={slotW} height={chartH}
                    fill="rgba(0,0,0,0.04)" />
                )}
                <rect x={x} y={y} width={barW} height={barH}
                  fill={isHov ? "var(--dark)" : "var(--primary)"} rx={2} />

                {/* X-axis label every 5 days */}
                {(i === 0 || i % 5 === 4 || i === data.length - 1) && (
                  <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize={8.5} fill="#aaa">
                    {d.date.slice(5)}
                  </text>
                )}

                {/* Tooltip */}
                {isHov && (
                  <g>
                    <rect
                      x={Math.min(Math.max(x - 24, padL), W - padR - 80)}
                      y={Math.max(y - 46, 2)}
                      width={84} height={38} fill="#1a1a2e" rx={5}
                    />
                    <text
                      x={Math.min(Math.max(x + barW / 2, padL + 18), W - padR - 18)}
                      y={Math.max(y - 28, 18)}
                      textAnchor="middle" fontSize={9} fill="#ccc"
                    >
                      {d.date}
                    </text>
                    <text
                      x={Math.min(Math.max(x + barW / 2, padL + 18), W - padR - 18)}
                      y={Math.max(y - 14, 32)}
                      textAnchor="middle" fontSize={10} fill="white" fontWeight={700}
                    >
                      {mode === "revenue" ? `₹${values[i].toFixed(0)}` : `${values[i]} orders`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* X-axis baseline */}
          <line x1={padL} y1={padT + chartH} x2={W - padR} y2={padT + chartH} stroke="#e0e0e0" strokeWidth={1} />
        </svg>
      </div>
    </div>
  );
}

function TopProducts({ products }) {
  const maxQty = Math.max(...products.map((p) => p.qtySold), 1);

  return (
    <div style={{ background: "white", borderRadius: 12, padding: "24px 28px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>
      <h3 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.1rem", color: "var(--dark)", marginBottom: 20 }}>
        Top Selling Products
      </h3>

      {products.length === 0 && (
        <p style={{ color: "#aaa", fontSize: "0.9rem" }}>No sales data yet.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {products.map((p, i) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Rank */}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: i === 0 ? "#f6c90e" : i === 1 ? "#a8a9ad" : i === 2 ? "#cd7f32" : "#f0f0f0",
              color: i < 3 ? "white" : "#888",
              fontWeight: 800, fontSize: "0.8rem",
            }}>
              {i + 1}
            </div>

            {/* Image */}
            <img src={p.image} alt={p.name}
              style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />

            {/* Info + bar */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--dark)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--dark)", flexShrink: 0, marginLeft: 12 }}>
                  ₹{p.revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${(p.qtySold / maxQty) * 100}%`,
                  background: i === 0 ? "#f6c90e" : i === 1 ? "#a8a9ad" : i === 2 ? "#cd7f32" : "var(--primary)",
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>
                {p.qtySold} sold &nbsp;·&nbsp; {p.category}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentOrders({ orders, onStatusChange }) {
  return (
    <div style={{ background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden" }}>
      <div style={{ padding: "24px 28px 0" }}>
        <h3 style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.1rem", color: "var(--dark)" }}>
          Recent Orders
        </h3>
      </div>

      <div style={{ overflowX: "auto", marginTop: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fafafa", borderBottom: "2px solid #f0f0f0" }}>
              {["Customer", "Items", "Total", "Status", "Date", "Action"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left", fontSize: "0.78rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "#aaa", fontSize: "0.9rem" }}>
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o, i) => {
              const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
              return (
                <tr key={o._id} style={{ borderBottom: "1px solid #f5f5f5", background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--dark)" }}>{o.customerName}</div>
                    <div style={{ fontSize: "0.78rem", color: "#888" }}>{o.customerPhone}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(o.items || []).slice(0, 3).map((item, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <img src={item.image} alt={item.name}
                            style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4 }} />
                          <span style={{ fontSize: "0.75rem", color: "#555" }}>×{item.qty}</span>
                        </div>
                      ))}
                      {o.items?.length > 3 && (
                        <span style={{ fontSize: "0.75rem", color: "#aaa", alignSelf: "center" }}>
                          +{o.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: "0.95rem", color: "var(--dark)" }}>
                    ₹{parseFloat(o.total).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700,
                      background: sc.bg, color: sc.color,
                    }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.82rem", color: "#888" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <select
                      value={o.status}
                      onChange={(e) => onStatusChange(o._id, e.target.value)}
                      style={{
                        padding: "4px 8px", border: "1px solid #ddd", borderRadius: 6,
                        fontSize: "0.8rem", cursor: "pointer", background: "white",
                      }}
                    >
                      {Object.entries(STATUS_COLORS).map(([val, { label }]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SalesDashboard({ getToken }) {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState("revenue");
  const [error, setError] = useState("");

  const authHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const headers = await authHeaders();
      const [summaryRes, chartRes, topRes, ordersRes] = await Promise.all([
        axios.get("/api/orders/sales/summary", { headers }),
        axios.get("/api/orders/sales/chart", { headers }),
        axios.get("/api/orders/sales/top-products", { headers }),
        axios.get("/api/orders", { headers }),
      ]);
      setSummary(summaryRes.data);
      setChartData(chartRes.data);
      setTopProducts(topRes.data);
      setOrders(ordersRes.data);
    } catch {
      setError("Failed to load sales data. Make sure the orders table exists in Supabase.");
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const headers = await authHeaders();
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus }, { headers });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      // silently fail
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #f0f0f0", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#888" }}>Loading sales data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "20px 24px", color: "#c53030" }}>
        <strong>Error:</strong> {error}
        <br />
        <small style={{ display: "block", marginTop: 8, color: "#888" }}>
          Run the SQL in the project README to create the <code>orders</code> table in Supabase.
        </small>
        <button onClick={loadAll} style={{ marginTop: 12, padding: "6px 16px", background: "var(--dark)", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.85rem" }}>
          Retry
        </button>
      </div>
    );
  }

  const accents = ["#f6c90e", "var(--primary)", "#48bb78", "#667eea"];
  const statCards = [
    { label: "Today",      ...summary.today   },
    { label: "This Week",  ...summary.week    },
    { label: "This Month", ...summary.month   },
    { label: "All Time",   ...summary.allTime },
  ];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <StatCard key={s.label} label={s.label} revenue={s.revenue} orders={s.orders} accent={accents[i]} />
        ))}
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={chartData} mode={chartMode} onModeChange={setChartMode} />

      {/* Top Products + Recent Orders */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, marginBottom: 28 }}>
        <TopProducts products={topProducts} />
        <RecentOrders orders={orders.slice(0, 10)} onStatusChange={handleStatusChange} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
