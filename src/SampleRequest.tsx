import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";
import { useApp } from "./script";
import { BRANDS, FACTORIES, REQUEST_TYPE_ROLE } from "./script/constants";
import { AttachmentButton } from "./AttachmentButton";
import { RequestCard } from "./script/RequestCard";
import { initials, stripeClr } from "./script/utils";
import type { NewRequestForm } from "./script/types";

function SampleRequest() {
  const {
    newForm,
    setNewFormField,
    submitRequest,
    submitting,
    resetForm,
    formErrors,
    activeItems,
    finishedItems,
    assignments,
    summary,
    openModal,
    openEditModal,
    cancelRequest,
    setDraggedNo,
    dropOnLane,
    samplerLanes,
    slotAction,
    handlers,
    requestType,
  } = useApp();
  const roleLabel = REQUEST_TYPE_ROLE[requestType];
  const totalForType = activeItems.length + finishedItems.length;

  const [customBrands, setCustomBrands] = useState<string[]>([]);
  const [showBrandInput, setShowBrandInput] = useState(false);
  const [brandDraft, setBrandDraft] = useState("");

  const brandOptions = useMemo(() => {
    const names = new Set<string>([...BRANDS, ...customBrands]);
    if (newForm.brand) names.add(newForm.brand);
    return [...names];
  }, [customBrands, newForm.brand]);

  const addCustomBrand = () => {
    const name = brandDraft.trim();
    if (!name) {
      setShowBrandInput(false);
      return;
    }
    setCustomBrands((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setNewFormField("brand", name);
    setBrandDraft("");
    setShowBrandInput(false);
  };

  const set =
    <K extends keyof NewRequestForm>(key: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setNewFormField(key, e.target.value as NewRequestForm[K]);

  const setRadio = (key: keyof NewRequestForm) => (value: string) =>
    setNewFormField(key, value as never);

  const errCls = (key: string) => (formErrors.has(key) ? " er" : "");

  const onLaneDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };
  const onLaneDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      e.currentTarget.classList.remove("drag-over");
    }
  };
  const onLaneDrop = (sid: string) => (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over");
    const no =
      Number(e.dataTransfer.getData("text/plain")) || undefined;
    if (no != null) dropOnLane(sid, no);
  };

  return (
    <>
      <aside className="fpane">
        <div className="phead">New request</div>
        <div className="phead-sub">
          Submit a sample request to the production team.
        </div>

        <div className="sec">
          <p className="slbl">Item</p>

          <div className="g2" style={{ marginBottom: 6 }}>
            <div className="fld">
              <label className="lbl">
                Factory <span className="req">*</span>
              </label>
              <select
                id="ff"
                className={errCls("factory").trim()}
                value={newForm.factory}
                onChange={set("factory")}
              >
                <option value="">Select</option>
                {FACTORIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label className="lbl">
                Brand <span className="req">*</span>
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                <select
                  id="fb"
                  className={errCls("brand").trim()}
                  style={{ flex: 1 }}
                  value={newForm.brand}
                  onChange={set("brand")}
                >
                  <option value="">Select</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="fld-add"
                  title="Add brand"
                  aria-label="Add brand"
                  onClick={() => setShowBrandInput((v) => !v)}
                >
                  +
                </button>
              </div>
              {showBrandInput && (
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <input
                    type="text"
                    placeholder="Brand name"
                    value={brandDraft}
                    onChange={(e) => setBrandDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomBrand();
                      }
                    }}
                    autoFocus
                  />
                  <button type="button" className="fld-add ok" onClick={addCustomBrand}>
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="g2" style={{ marginBottom: 6 }}>
            <div className="fld">
              <label className="lbl">
                Season <span className="req">*</span>
              </label>
              <select
                id="fse"
                className={errCls("season").trim()}
                value={newForm.season}
                onChange={set("season")}
              >
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
              <input
                id="fst"
                placeholder="LKLP6AN054"
                value={newForm.style}
                onChange={set("style")}
              />
            </div>
          </div>

          <div className="fld" style={{ marginBottom: 6 }}>
            <label className="lbl">
              Item <span className="req">*</span>
            </label>
            <input
              id="fi"
              className={errCls("item").trim()}
              placeholder="e.g. WM'S LONG PANTS"
              value={newForm.item}
              onChange={set("item")}
            />
          </div>

          <div className="fld" style={{ marginBottom: 6 }}>
            <label className="lbl">Type of Product</label>
            <select
              id="fprod"
              value={newForm.prodType}
              onChange={set("prodType")}
            >
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

          <div className="g3" style={{ marginBottom: 6 }}>
            <div className="fld">
              <label className="lbl">
                Sample type <span className="req">*</span>
              </label>
              <input
                id="fty"
                className={errCls("stype").trim()}
                placeholder="PP SAMPLE"
                value={newForm.stype}
                onChange={set("stype")}
              />
            </div>
            <div className="fld">
              <label className="lbl">
                Color <span className="req">*</span>
              </label>
              <input
                id="fcl"
                className={errCls("color").trim()}
                placeholder="BLACK"
                value={newForm.color}
                onChange={set("color")}
              />
            </div>
            <div className="fld">
              <label className="lbl">Size</label>
              <input
                id="fsz"
                placeholder="M"
                value={newForm.size}
                onChange={set("size")}
              />
            </div>
          </div>

          <div className="fld" style={{ maxWidth: 72 }}>
            <label className="lbl">Qty</label>
            <input
              id="fq"
              type="number"
              min={1}
              placeholder="2"
              value={newForm.qty}
              onChange={set("qty")}
            />
          </div>
        </div>

        <div className="dvd" />

        <div className="sec">
          <p className="slbl">Materials &amp; docs</p>

          <div className="fld" style={{ marginBottom: 8 }}>
            <label className="lbl">Worksheet</label>
            <div className="radio-group">
              <label className="rpill">
                <input
                  type="radio"
                  name="rws"
                  value="ready"
                  checked={newForm.worksheet === "ready"}
                  onChange={() => setRadio("worksheet")("ready")}
                />
                <span>Ready</span>
              </label>
              <label className="rpill">
                <input
                  type="radio"
                  name="rws"
                  value="not_available"
                  checked={newForm.worksheet === "not_available"}
                  onChange={() => setRadio("worksheet")("not_available")}
                />
                <span>Not available</span>
              </label>
              <AttachmentButton
                id="ws-att"
                files={newForm.worksheetFiles}
                onFilesChange={(files) => setNewFormField("worksheetFiles", files)}
              />
            </div>
          </div>

          <div className="fld" style={{ marginBottom: 8 }}>
            <label className="lbl">Pattern</label>
            <div className="radio-group">
              {[
                { value: "buyer_original", label: "Buyer Original" },
                { value: "reference", label: "Reference Pattern" },
                { value: "grading", label: "Grading" },
                { value: "padding_modify", label: "Padding Modify" },
                { value: "not_available", label: "Not available" },
              ].map((p) => (
                <label key={p.value} className="rpill">
                  <input
                    type="radio"
                    name="rpt"
                    value={p.value}
                    checked={newForm.pattern === p.value}
                    onChange={() => setRadio("pattern")(p.value)}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>

          </div>

          <div className="g2" style={{ marginBottom: 8 }}>
            <div className="fld">
              <label className="lbl">Fabric — est. date</label>
              <input
                type="date"
                id="fb-date"
                value={newForm.fabricDate}
                onChange={set("fabricDate")}
              />
            </div>
            <div className="fld">
              <label className="lbl">Trims — est. date</label>
              <input
                type="date"
                id="tr-date"
                value={newForm.trimsDate}
                onChange={set("trimsDate")}
              />
            </div>
          </div>

          <div className="g2">
            <div className="fld">
              <label className="lbl">Org Sample</label>
              <label className="ckpill" style={{ width: "fit-content" }}>
                <input
                  type="checkbox"
                  id="cos"
                  checked={newForm.orgSample}
                  onChange={(e) => setNewFormField("orgSample", e.target.checked)}
                />
                <span>Available</span>
              </label>
            </div>
            <div className="fld">
              <label className="lbl">Special process</label>
              <select
                id="fsp"
                name="fsp"
                value={newForm.specialProcess}
                onChange={set("specialProcess")}
              >
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

        <div className="dvd" />

        <div className="sec">
          <p className="slbl">Person In Charge</p>
          <div className="g2" style={{ marginBottom: 6 }}>
            <div className="fld">
              <label className="lbl">
                In charge <span className="req">*</span>
              </label>
              <input
                id="fic"
                className={errCls("incharge").trim()}
                placeholder="Name"
                value={newForm.incharge}
                onChange={set("incharge")}
              />
            </div>
          </div>
          <div className="fld">
            <label className="lbl">Remark</label>
            <textarea
              id="frm"
              placeholder="Notes, special process details, etc."
              value={newForm.remark}
              onChange={set("remark")}
            />
          </div>
        </div>

        <div className="fac">
          <button type="button" className="btnr" onClick={resetForm}>
            Clear
          </button>
          <button
            type="button"
            className="btns"
            onClick={submitRequest}
            disabled={submitting}
            style={submitting ? { opacity: 0.5 } : undefined}
          >
            {submitting ? "Saving…" : "Submit request"}
          </button>
        </div>
      </aside>

      <main className="cpane" style={{ padding: 0, overflow: "hidden" }}>
        <div className="req-zone">
          <div className="submitted-col">
            <div id="summary-bar" style={{ marginBottom: 12 }}>
              {summary && (
                <>
                  <div className="sum-month">{summary.monthName}</div>
                  <div className="summary-bar">
                    <div className="sum-card">
                      <div className="sum-label">Total</div>
                      <div className="sum-val">{summary.total}</div>
                      <div className="sum-sub">requests</div>
                    </div>
                    <div className="sum-card">
                      <div className="sum-label">Approved</div>
                      <div className="sum-val" style={{ color: "var(--gn)" }}>
                        {summary.approved}
                      </div>
                      <div className="sum-sub">completed</div>
                    </div>
                    <div className="sum-card">
                      <div className="sum-label">Pending</div>
                      <div className="sum-val" style={{ color: "var(--am)" }}>
                        {summary.pending}
                      </div>
                      <div className="sum-sub">in progress</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="sub-divider">
              <span className="sub-divider-label">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Finished
              </span>
              <span
                className="cbadge"
                id="fin-cnt"
                style={{ marginLeft: "auto" }}
              >
                {finishedItems.length} item
                {finishedItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="sub-section">
              {finishedItems.length === 0 ? (
                <div
                  id="fin-emp"
                  className="empty"
                  style={{ padding: "32px 20px" }}
                >
                  <p className="empty-t" style={{ fontSize: 12 }}>
                    No finished samples yet
                  </p>
                  <p className="empty-s">Approved samples appear here.</p>
                </div>
              ) : (
                <div className="cgrid" id="cg-fin">
                  {finishedItems.map((d, i) => (
                    <RequestCard
                      key={d.no}
                      item={d}
                      index={i}
                      showActions
                      assignments={assignments}
                      samplers={handlers}
                      onOpen={openModal}
                      onEdit={openEditModal}
                      onCancel={cancelRequest}
                      onDragStart={setDraggedNo}
                      onDragEnd={() => setDraggedNo(null)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="sub-divider" style={{ marginTop: 4 }}>
              <span className="sub-divider-label" style={{ color: "var(--mu)" }}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Not yet assigned
              </span>
              <span className="cbadge" id="cnt" style={{ marginLeft: "auto" }}>
                {notAssignedItems.length} item
                {notAssignedItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="sub-section">
              {activeItems.length > 0 && (
                <div className="drag-hint" id="drag-hint">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                  </svg>
                  Drag cards onto a sampler to assign
                </div>
              )}
              {activeItems.length === 0 ? (
                <div id="emp" className="empty">
                  <div className="eicon">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <line x1="8" y1="9" x2="16" y2="9" />
                      <line x1="8" y1="13" x2="14" y2="13" />
                    </svg>
                  </div>
                  <p className="empty-t">No active requests</p>
                  <p className="empty-s">Drag a card onto a sampler to assign.</p>
                </div>
              ) : (
                <div className="cgrid" id="cg">
                  {activeItems.map((d, i) => (
                    <RequestCard
                      key={d.no}
                      item={d}
                      index={i}
                      showActions
                      assignments={assignments}
                      samplers={handlers}
                      onOpen={openModal}
                      onEdit={openEditModal}
                      onCancel={cancelRequest}
                      onDragStart={setDraggedNo}
                      onDragEnd={() => setDraggedNo(null)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="sub-divider" style={{ marginTop: 4 }}>
              <span className="sub-divider-label" style={{ color: "var(--mu)" }}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Request from Sales
              </span>
              <span className="cbadge" id="cnt" style={{ marginLeft: "auto" }}>
                {activeItems.length} / {totalForType} item
                {totalForType !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="sub-section">
              {activeItems.length > 0 && (
                <div className="drag-hint" id="drag-hint">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
                  </svg>
                  Drag cards onto a sampler to assign
                </div>
              )}
              {activeItems.length === 0 ? (
                <div id="emp" className="empty">
                  <div className="eicon">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="4" width="16" height="16" rx="2" />
                      <line x1="8" y1="9" x2="16" y2="9" />
                      <line x1="8" y1="13" x2="14" y2="13" />
                    </svg>
                  </div>
                  <p className="empty-t">No active requests</p>
                  <p className="empty-s">Drag a card onto a sampler to assign.</p>
                </div>
              ) : (
                <div className="cgrid" id="cg">
                  {activeItems.map((d, i) => (
                    <RequestCard
                      key={d.no}
                      item={d}
                      index={i}
                      showActions
                      assignments={assignments}
                      samplers={handlers}
                      onOpen={openModal}
                      onEdit={openEditModal}
                      onCancel={cancelRequest}
                      onDragStart={setDraggedNo}
                      onDragEnd={() => setDraggedNo(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          

          <div className="samplers-col" id="samplers-col">
            <div className="samplers-head">
              <span>YIC ONE — {roleLabel}</span>
              <span
                id="sampler-total"
                style={{ fontFamily: "var(--mono)" }}
              >
                {handlers.length}
              </span>
            </div>

            <div id="sampler-lanes">
              {handlers.map((s) => {
                const lane = samplerLanes.find((l) => l.sampler.id === s.id);
                const slots = lane?.slots ?? [];
                const count = lane?.count ?? 0;
                return (
                  <div
                    key={s.id}
                    id={`lane-${s.id}`}
                    className="sampler-lane"
                    onDragOver={onLaneDragOver}
                    onDragLeave={onLaneDragLeave}
                    onDrop={onLaneDrop(s.id)}
                  >
                    <div className="sampler-hdr">
                      <div className="sampler-avatar">{initials(s.name)}</div>
                      <div className="sampler-info">
                        <div className="sampler-name">{s.name}</div>
                        <div className="sampler-eid">
                          {s.eid} · {s.level}
                        </div>
                      </div>
                      <span
                        className={`sampler-badge${count > 0 ? " has-work" : ""}`}
                      >
                        {count}
                      </span>
                    </div>

                    <div className="sampler-slots">
                      {slots.length === 0 ? (
                        <div
                          style={{
                            color: "var(--hi)",
                            fontSize: 10,
                            padding: "10px 8px",
                            textAlign: "center",
                          }}
                        >
                          Drop request here
                        </div>
                      ) : (
                        slots.map(({ assignment, req }) => {
                          const st = assignment.status ?? "pending";
                          return (
                            <div
                              key={req.no}
                              className="slot-item"
                              onClick={() => openModal(req.no)}
                            >
                              <div className="slot-left">
                                <span
                                  className="slot-dot"
                                  style={{
                                    background: stripeClr(req.stype),
                                    flexShrink: 0,
                                  }}
                                />
                                <div
                                  style={{ minWidth: 0, overflow: "hidden" }}
                                >
                                  <div className="slot-label">{req.item}</div>
                                  <div className="slot-sub">
                                    {req.brand} · {req.stype}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  flexShrink: 0,
                                  display: "flex",
                                  gap: 4,
                                  marginLeft: 6,
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {st === "pending" && (
                                  <>
                                    <button
                                      type="button"
                                      className="slot-approve"
                                      onClick={() =>
                                        slotAction(s.id, req.no, "accept")
                                      }
                                    >
                                      OK
                                    </button>
                                    <button
                                      type="button"
                                      className="slot-cancel"
                                      onClick={() =>
                                        slotAction(s.id, req.no, "rm")
                                      }
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                                {st === "accepted" && (
                                  <>
                                    <button
                                      type="button"
                                      className="slot-approve"
                                      style={{
                                        background: "var(--gn)",
                                        borderColor: "var(--gn)",
                                        color: "#fff",
                                      }}
                                      onClick={() =>
                                        slotAction(s.id, req.no, "finish")
                                      }
                                    >
                                      Finished
                                    </button>
                                    <button
                                      type="button"
                                      className="slot-cancel"
                                      onClick={() =>
                                        slotAction(s.id, req.no, "unaccept")
                                      }
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                                {st === "finished" && (
                                  <>
                                    <span className="slot-approved-lbl">
                                      ✓ Done
                                    </span>
                                    <button
                                      type="button"
                                      className="slot-cancel"
                                      onClick={() =>
                                        slotAction(s.id, req.no, "rm")
                                      }
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default SampleRequest;
