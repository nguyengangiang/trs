function Request() {
    function rst() {
        document.querySelectorAll(".fpane input,.fpane select,.fpane textarea").forEach(el => {
            if (el.type === "checkbox" || el.type === "radio") el.checked = false;
            else el.value = "";
            el.classList.remove("er");
        });
        const lbl = document.getElementById("ws-att-lbl");
        if (lbl) lbl.textContent = "Attach";
    }

    function handleClick() {
        document.getElementById('ws-att').click()
    }

    async function sub() {
        let ok = true;
        const REQD = ["ff", "fb", "fse", "fi", "fty", "fcl", "frq", "fdu", "fic"];
        REQD.forEach(id => {
            const el = document.getElementById(id);
            if (el.value.trim()) el.classList.remove("er");
            else { el.classList.add("er"); ok = false; }
        });
        if (!ok) { showToast("Please fill in all required fields.", false); return; }

        const wsVal = (document.querySelector('input[name="rws"]:checked') || {}).value || "";
        const ptVal = (document.querySelector('input[name="rpt"]:checked') || {}).value || "";
        const spVal = v("fsp");
        const wsFile = (document.getElementById("ws-att").files[0] || {}).name || "";

        const d = {
            no: n++, factory: v("ff"), brand: v("fb"), season: v("fse"), style: v("fst"),
            item: v("fi"), prodType: v("fprod"), smvTP: v("fsmv-tp"), smvSPL: v("fsmv-spl"), smvBLK: v("fsmv-blk"), stype: v("fty"), color: v("fcl"), size: v("fsz"), qty: v("fq"),
            worksheet: wsVal, worksheetFile: wsFile, pattern: ptVal, patternDate: v("pt-date"),
            fabricDate: v("fb-date"), trimsDate: v("tr-date"), orgSample: ck("cos"), specialProcess: spVal,
            reqdate: v("frq"), duedate: v("fdu"), incharge: v("fic"), remark: v("frm"),
            ts: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
        };
        items.push(d);
        renderCards(); renderFilters(); renderSummary(); rst();
        refreshReportIfVisible();
        document.getElementById("hstat").textContent = `${items.length} request${items.length !== 1 ? "s" : ""}`;

        const btn = document.querySelector(".btns");
        const orig = btn.textContent;
        btn.textContent = "Saving…"; btn.disabled = true; btn.style.opacity = ".5";
        try {
            await fetch(GAS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
            showToast(`[${d.brand} · ${d.stype}] saved.`, true);
        } catch (e) { showToast("Saved locally — sync failed.", false); }
        finally { btn.textContent = orig; btn.disabled = false; btn.style.opacity = ""; }
    }

    return <div className="view on" id="vf">
        <aside className="fpane">
            <div className="phead">New request</div>
            <div className="phead-sub">Submit a sample request to the production team.</div>

            <div id="toast" className="toast" style={{ display: "none" }}>Request #001 cancelled.</div>

            <div className="sec">
                <p className="slbl">Item</p>
                <div className="g2" style={{ margin: " 0 0 6px 0" }}>
                    <div className="fld"><label className="lbl">Factory <span className="req">*</span></label>
                        <select id="ff">
                            <option value="">Select</option>
                            <option>YIC HANAM</option>
                            <option>YIC ONE</option>
                        </select>
                    </div>
                    <div className="fld"><label className="lbl">Brand <span className="req">*</span></label>
                        <select id="fb">
                            <option value="">Select</option>
                            <option>KOLON CHINA</option>
                            <option>KOLON SPORT</option>
                            <option>VUORI</option>
                            <option>BLACK DIAMOND</option>
                            <option>FIGS</option>
                            <option>RIDESTORE</option>
                            <option>AETHER</option>
                            <option>COTOPAXI</option>
                            <option>DESCENTE CHINA</option>
                            <option>YIC ODM</option>
                        </select>
                    </div>
                </div>
                <div className="g2" style={{ margin: " 0 0 6px 0" }}>
                    <div className="fld"><label className="lbl">Season <span className="req">*</span></label>
                        <select id="fse">
                            <option value="">Select</option>
                            <option>26SS</option>
                            <option>26FW</option>
                            <option>27SS</option>
                            <option>27FW</option>
                            <option>SP27</option>
                            <option>FW26</option>
                        </select>
                    </div>
                    <div className="fld">
                        <label className="lbl">Style No.</label>
                        <input id="fst" placeholder="LKLP6AN054">
                    </div>
                </div>
                <div className="fld" style={{ margin: " 0 0 6px 0" }}>
                    <label className="lbl">Item <span className="req">*</span></label>
                    <input id="fi" placeholder="e.g. WM&#39;S LONG PANTS">
                </div>
                <div className="fld" style={{ margin: " 0 0 6px 0" }}>
                    <label className="lbl">Type of Product</label>
                    <select id="fprod">
                        <option value="">Select type</option>
                        <optgroup label="Bottoms">
                            <option>Shorts</option>
                            <option>Pants</option>
                            <option>Skirt</option>
                            <option>Leggings</option>
                        </optgroup>
                        <optgroup label="Outerwear">
                            <option>OW - Down</option>
                            <option>OW - Seam Sealing</option>
                            <option>OW - Padding</option>
                            <option>OW - Windbreaker</option>
                        </optgroup>
                        <optgroup label="Tops">
                            <option>Woven Top</option>
                            <option>Knit Top</option>
                            <option>T-Shirt</option>
                            <option>Polo</option>
                            <option>Hoodie</option>
                            <option>Sweatshirt</option>
                        </optgroup>
                        <optgroup label="Others">
                            <option>Dress</option>
                            <option>Jumpsuit</option>
                            <option>Vest</option>
                            <option>Accessory</option>
                            <option>Other</option>
                        </optgroup>
                    </select>
                </div>
                <div className="g3" style="margin-bottom:6px">
                    <div className="fld"><label className="lbl">TP SMV</label><input id="fsmv-tp" placeholder="e.g. 18h"></div>
                    <div className="fld"><label className="lbl">Sample SMV</label><input id="fsmv-spl" placeholder="e.g. 18h"></div>
                    <div className="fld"><label className="lbl">Bulk SMV</label><input id="fsmv-blk" placeholder="e.g. 18h"></div>
                </div>
                <div className="g3" style="margin-bottom:6px">
                    <div className="fld"><label className="lbl">Sample type <span className="req">*</span></label><input id="fty"
                        placeholder="PP SAMPLE"></div>
                    <div className="fld"><label className="lbl">Color <span className="req">*</span></label><input id="fcl"
                        placeholder="BLACK" className=""></div>
                    <div className="fld"><label className="lbl">Size</label><input id="fsz" placeholder="M"></div>
                </div>
                <div className="fld" style="max-width:72px"><label className="lbl">Qty</label><input id="fq" type="number" min="1"
                    placeholder="2"></div>
            </div>

            <div className="dvd"></div>
            <div className="sec">
                <p className="slbl">Materials &amp; docs</p>
                <div className="fld" style="margin-bottom:8px">
                    <label className="lbl">Worksheet</label>
                    <div className="radio-group">
                        <label className="rpill"><input type="radio" name="rws" value="ready"><span>Ready</span></label>
                        <label className="rpill"><input type="radio" name="rws" value="not_available"><span>Not available</span></label>
                        <label className="rpill rpill-att" onClick={handleClick}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path
                                    d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48">
                                </path>
                            </svg>
                            <span id="ws-att-lbl">Attach</span>
                        </label>
                        <input type="file" id="ws-att" style="display:none"
                            onchange="attChange(&#39;ws-att&#39;,&#39;ws-att-lbl&#39;)">
                    </div>
                </div>
                <div className="fld" style="margin-bottom:8px">
                    <label className="lbl">Pattern</label>
                    <div className="radio-group">
                        <label className="rpill"><input type="radio" name="rpt" value="buyer_original"><span>Buyer
                            Original</span></label>
                        <label className="rpill"><input type="radio" name="rpt" value="reference"><span>Reference Pattern</span></label>
                        <label className="rpill"><input type="radio" name="rpt" value="grading"
                            data-deselect="false"><span>Grading</span></label>
                        <label  ="rpill"><input type="radio" name="rpt" value="padding_modify"
                            data-deselect="false"><span>Padding Modify</span></label>
                        <label className="rpill"><input type="radio" name="rpt" value="not_available"><span>Not available</span></label>
                    </div>
                </div>
                <div className="g2" style="margin-bottom:8px">
                    <div className="fld"><label className="lbl">Fabric — est. date</label><input type="date" id="fb-date"></div>
                    <div className="fld"><label className="lbl">Trims — est. date</label><input type="date" id="tr-date"></div>
                </div>
                <div className="g2">
                    <div className="fld"><label className="lbl">Org Sample</label>
                        <label className="ckpill" style="width:fit-content"><input type="checkbox"
                            id="cos"><span>Available</span></label>
                    </div>
                    <div className="fld"><label className="lbl">Special process</label>
                        <select id="fsp" name="fsp">
                            <option value="">None</option>
                            <option>Welding</option>
                            <option>Print</option>
                            <option>EMB</option>
                            <option>Bonding</option>
                            <option>Laser cut</option>
                            <option>Heat transfer</option>
                            <option>Coating</option>
                            <option>Dyeing</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="dvd"></div>
            <div className="sec">
                <p className="slbl">Schedule</p>
                <div className="g2">
                    <div className="fld"><label className="lbl">Request date <span className="req">*</span></label><input type="date"
                        id="frq"></div>
                    <div className="fld"><label className="lbl">Due date <span className="req">*</span></label><input type="date" id="fdu">
                    </div>
                </div>
            </div>

            <div className="dvd"></div>
            <div className="sec">
                <p className="slbl">Assigned to</p>
                <div className="g2" style="margin-bottom:6px">
                    <div className="fld"><label className="lbl">In charge <span className="req">*</span></label><input id="fic"
                        placeholder="Name"></div>

                </div>
                <div className="fld"><label className="lbl">Remark</label><textarea id="frm"
                    placeholder="Notes, special process details, etc."></textarea></div>
            </div>

            <div className="fac">
                <button className="btnr" onClick={rst}>Clear</button>
                <button className="btns" onClick={sub}>Submit request</button>
            </div>
        </aside>

        <main className="cpane" style={{ padding: "0", overflow: "hidden" }}>
            <div className="req-zone">
                <div className="submitted-col">
                    <div id="summary-bar" style={{ margin: " 0 0 6px 0" }}></div>
                    <div className="sub-divider">
                        <span className="sub-divider-label">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Finished
                        </span>
                        <span className="cbadge" id="fin-cnt" style={{ margin: " 0 0 0 auto" }}>0 items</span>
                    </div>
                    <div className="sub-section">
                        <div id="fin-emp" className="empty" style={{ padding: " 32px 20px", display: "block" }}>
                            <p className="empty-t" style={{ fontSize: "12px" }}>No finished samples yet</p>
                            <p className="empty-s">Approved samples appear here.</p>
                        </div>
                        <div className="cgrid" id="cg-fin"></div>
                    </div>
                    <div className="sub-divider" style={{ marginTop: "4px" }}>
                        <span className="sub-divider-label" style={{ color: "var(--mu)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Active
                        </span>
                        <span className="cbadge" id="cnt" style={{ margin: " 0 0 0 auto" }}>0 / 0 items</span>
                    </div>
                    <div className="sub-section">
                        <div className="drag-hint" id="drag-hint" style={{ display: "none" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"></path>
                            </svg>
                            Drag cards onto a sampler to assign
                        </div>
                        <div id="emp" className="empty" style={{ display: "block" }}>
                            <div className="eicon"><svg viewBox="0 0 24 24">
                                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                                <line x1="8" y1="9" x2="16" y2="9"></line>
                                <line x1="8" y1="13" x2="14" y2="13"></line>
                            </svg></div>
                            <p className="empty-t">No active requests</p>
                            <p className="empty-s">Drag a card onto a sampler to assign.</p>
                        </div>
                        <div className="cgrid" id="cg"></div>
                    </div>
                </div>

                <div className="samplers-col" id="samplers-col">
                    <div className="samplers-head">
                        <span>YIC ONE — Samplers</span>
                        <span id="sampler-total" style={{ fontFamily: "var(--mono)" }}>12</span>
                    </div>
                    <div id="sampler-lanes">
                        <div className="sampler-lane" id="lane-s01">
                            <div className="sampler-hdr">
                                <div className="sampler-avatar" style="background:none;padding:0;overflow:hidden"><img
                                    src="data:image/png;base64,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"
                                    style="width:100%;height:100%;object-fit:cover;border-radius:50%"></div>
                                <div className="sampler-info">
                                    <div className="sampler-name">Nguyễn Thị Kim Cúc</div>
                                    <div className="sampler-eid">VPHN08 · Manager</div>
                                </div><span className="sampler-badge ">0</span>
                            </div>
                            <div className="sampler-slots">
                                <div style="color:var(--hi);font-size:10px;padding:10px 8px;text-align:center">Drop request here</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
}

export default Request;