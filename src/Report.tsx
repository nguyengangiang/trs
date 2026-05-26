import React from "react";

const Report: React.FC = () => {
  return (
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px",
          background: "var(--bg)",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="ctop" style={{ marginBottom: 24 }}>
            <p className="ctitle">Report</p>
            <span className="cbadge" id="rpt-period">
              All time
            </span>
          </div>

          {/* KPI row */}
          <div
            id="rpt-kpi"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div className="rpt-kpi-card">
              <div className="rpt-kpi-val" style={{ color: "var(--tx)" }}>
                0
              </div>
              <div className="rpt-kpi-label">Total Requests</div>
              <div className="rpt-kpi-sub">all time</div>
            </div>

            <div className="rpt-kpi-card">
              <div className="rpt-kpi-val" style={{ color: "var(--gn)" }}>
                0
              </div>
              <div className="rpt-kpi-label">Finished</div>
              <div className="rpt-kpi-sub">samples complete</div>
            </div>

            <div className="rpt-kpi-card">
              <div className="rpt-kpi-val" style={{ color: "var(--am-t)" }}>
                0
              </div>
              <div className="rpt-kpi-label">In Production</div>
              <div className="rpt-kpi-sub">being made</div>
            </div>

            <div className="rpt-kpi-card">
              <div className="rpt-kpi-val" style={{ color: "var(--hi)" }}>
                0
              </div>
              <div className="rpt-kpi-label">Pending</div>
              <div className="rpt-kpi-sub">not yet started</div>
            </div>

            <div className="rpt-kpi-card">
              <div className="rpt-kpi-val" style={{ color: "var(--bl-t)" }}>
                —
              </div>
              <div className="rpt-kpi-label">Avg Sample SMV</div>
              <div className="rpt-kpi-sub">sample SMV</div>
            </div>

            <div className="rpt-kpi-card">
              <div className="rpt-kpi-val" style={{ color: "var(--co-t)" }}>
                0
              </div>
              <div className="rpt-kpi-label">Cancelled</div>
              <div className="rpt-kpi-sub">requests</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div className="rpt-card" id="rpt-by-brand">
              <div className="rpt-card-title">By Brand</div>
              <div style={{ color: "var(--hi)", fontSize: 11 }}>No data</div>
            </div>

            <div className="rpt-card" id="rpt-by-type">
              <div className="rpt-card-title">By Product Type</div>
              <div style={{ color: "var(--hi)", fontSize: 11 }}>No data</div>
            </div>
          </div>

          {/* Table */}
          <div className="rpt-card" id="rpt-table">
            <div className="rpt-card-title">Request List</div>

            <div className="rpt-table-row hdr">
              <div className="rpt-table-cell">Item</div>
              <div className="rpt-table-cell">Brand · Season</div>
              <div className="rpt-table-cell">Type</div>
              <div className="rpt-table-cell">Request</div>
              <div className="rpt-table-cell">Due</div>
              <div className="rpt-table-cell">Status</div>
            </div>

            <div
              style={{
                padding: "24px 0",
                textAlign: "center",
                color: "var(--hi)",
                fontSize: 12,
              }}
            >
              No requests yet
            </div>
          </div>
        </div>
      </div>
  );
};

export default Report;