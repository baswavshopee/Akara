import { useState, useEffect } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { useToast } from "../context/ToastContext";

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};
const modalStyle = {
  background: "var(--card-bg)", borderRadius: 16, padding: 32, maxWidth: 480,
  width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  color: "var(--text)"
};
const fieldLabel = {
  fontSize: "0.8rem", fontWeight: 600, color: "var(--dark)", marginBottom: 6,
  display: "block", textTransform: "uppercase", letterSpacing: 0.5,
};
const fieldInput = {
  padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: 8,
  fontSize: "0.95rem", width: "100%", fontFamily: "Inter, sans-serif",
  background: "var(--bg)", color: "var(--text)"
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyModal, setApplyModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    axios.get("/api/events").then((r) => {
      setEvents(r.data);
      setLoading(false);
    });
  }, []);

  const openApply = (ev) => {
    if (ev.applicationLink) {
      window.open(ev.applicationLink, "_blank", "noopener,noreferrer");
      return;
    }
    setApplyModal(ev);
    setForm({ name: "", email: "", message: "" });
  };

  const submitApplication = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/api/events/${applyModal._id}/apply`, form);
      showToast("Application submitted successfully!");
      setApplyModal(null);
    } catch {
      showToast("Failed to submit. Please try again.");
    }
    setSubmitting(false);
  };

  if (loading) return <Spinner />;

  return (
    <div className="page" style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 32px" }}>
        <div className="section-header">
          <h1 className="section-title">
            Upcoming <span>Events</span>
          </h1>
        </div>

        {events.length === 0 ? (
          <div className="no-results">
            <div className="icon">🎉</div>
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {events.map((ev) => (
              <div
                key={ev._id}
                style={{
                  background: "var(--card-bg)", borderRadius: 16, padding: "32px 36px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", gap: 32,
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                    <span style={{
                      background: "var(--primary)", color: "white",
                      padding: "4px 14px", borderRadius: 20,
                      fontSize: "0.78rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: 1,
                    }}>
                      {new Date(ev.date).toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
                      {" "}{new Date(ev.date).getDate()}
                    </span>
                    <span style={{ color: "var(--gray)", fontSize: "0.88rem" }}>
                      {new Date(ev.date).toLocaleDateString("en-GB", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}
                      {" — "}
                      {new Date(ev.date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h2 style={{
                    fontFamily: "Outfit", fontWeight: 800, fontSize: "1.6rem",
                    color: "var(--dark)", marginBottom: 8,
                  }}>
                    {ev.name}
                  </h2>
                  <p style={{ color: "var(--gray)", marginBottom: 12, fontSize: "0.9rem" }}>
                    📍 {ev.location}
                  </p>
                  <p style={{ color: "var(--text)", opacity: 0.8, lineHeight: 1.7, maxWidth: 600 }}>{ev.description}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button className="btn btn-primary" onClick={() => openApply(ev)}>
                    Apply Now →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Management CTA */}
        <div style={{
          marginTop: 64,
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
          borderRadius: 24,
          padding: "48px 40px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 20px 40px rgba(var(--primary-rgb), 0.2)"
        }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: "2rem", fontWeight: 800, marginBottom: 16 }}>
            Want Akara to manage your entire event?
          </h2>
          <p style={{ fontSize: "1.1rem", opacity: 0.9, marginBottom: 32, maxWidth: 600, marginInline: "auto" }}>
            From curation to execution, we bring premium identity and artistry to your corporate or private gatherings.
          </p>
          <button 
            className="btn btn-white-pill" 
            onClick={() => window.location.href = "mailto:hello@akarakeepsakes.com"}
            style={{ padding: "16px 40px", background: "white", color: "var(--primary)", border: "none", borderRadius: 50, fontWeight: 700, cursor: "pointer", fontSize: "1rem" }}
          >
            Contact Us Now →
          </button>
        </div>
      </div>

      {applyModal && (
        <div style={overlayStyle} onClick={() => setApplyModal(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontFamily: "Outfit", fontWeight: 800, color: "var(--dark)", fontSize: "1.4rem" }}>
                Apply: {applyModal.name}
              </h2>
              <button
                onClick={() => setApplyModal(null)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}
              >✕</button>
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={fieldLabel}>Name *</label>
                <input
                  style={fieldInput}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label style={fieldLabel}>Email *</label>
                <input
                  style={fieldInput}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label style={fieldLabel}>Message (optional)</label>
                <textarea
                  style={{ ...fieldInput, height: 80, resize: "vertical" }}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us why you'd like to attend..."
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setApplyModal(null)}
                style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "var(--gray-light)", cursor: "pointer", fontWeight: 600, color: "var(--text)" }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitApplication} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
