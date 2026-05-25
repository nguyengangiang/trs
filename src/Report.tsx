function Report() {
    <div class="view" id="vr" style="flex-direction:column">
        <div style="flex:1;overflow-y:auto;padding:28px 32px;background:var(--bg)">
            <div style="max-width:900px;margin:0 auto">
                <div class="ctop" style="margin-bottom:24px">
                    <p class="ctitle">Report</p>
                    <span class="cbadge" id="rpt-period">All time</span>
                </div>
                <!-- KPI row -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px" id="rpt-kpi">
                    <div class="rpt-kpi-card">
                        <div class="rpt-kpi-val" style="color:var(--tx)">0</div>
                        <div class="rpt-kpi-label">Total Requests</div>
                        <div class="rpt-kpi-sub">all time</div>
                    </div>
                    <div class="rpt-kpi-card">
                        <div class="rpt-kpi-val" style="color:var(--gn)">0</div>
                        <div class="rpt-kpi-label">Finished</div>
                        <div class="rpt-kpi-sub">samples complete</div>
                    </div>
                    <div class="rpt-kpi-card">
                        <div class="rpt-kpi-val" style="color:var(--am-t)">0</div>
                        <div class="rpt-kpi-label">In Production</div>
                        <div class="rpt-kpi-sub">being made</div>
                    </div>
                    <div class="rpt-kpi-card">
                        <div class="rpt-kpi-val" style="color:var(--hi)">0</div>
                        <div class="rpt-kpi-label">Pending</div>
                        <div class="rpt-kpi-sub">not yet started</div>
                    </div>
                    <div class="rpt-kpi-card">
                        <div class="rpt-kpi-val" style="color:var(--bl-t)">—</div>
                        <div class="rpt-kpi-label">Avg Sample SMV</div>
                        <div class="rpt-kpi-sub">sample SMV</div>
                    </div>
                    <div class="rpt-kpi-card">
                        <div class="rpt-kpi-val" style="color:var(--co-t)">0</div>
                        <div class="rpt-kpi-label">Cancelled</div>
                        <div class="rpt-kpi-sub">requests</div>
                    </div>
                </div>
                <!-- Chart area -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px">
                    <div class="rpt-card" id="rpt-by-brand">
                        <div class="rpt-card-title">By Brand</div>
                        <div style="color:var(--hi);font-size:11px">No data</div>
                    </div>
                    <div class="rpt-card" id="rpt-by-type">
                        <div class="rpt-card-title">By Product Type</div>
                        <div style="color:var(--hi);font-size:11px">No data</div>
                    </div>
                </div>
                <!-- Table -->
                <div class="rpt-card" id="rpt-table">
                    <div class="rpt-card-title">Request List</div>
                    <div class="rpt-table-row hdr">
                        <div class="rpt-table-cell">Item</div>
                        <div class="rpt-table-cell">Brand · Season</div>
                        <div class="rpt-table-cell">Type</div>
                        <div class="rpt-table-cell">Request</div>
                        <div class="rpt-table-cell">Due</div>
                        <div class="rpt-table-cell">Status</div>
                    </div>
                    <div style="padding:24px 0;text-align:center;color:var(--hi);font-size:12px">No requests yet</div>
                </div>
            </div>
        </div>
    </div>
}

export default Report;