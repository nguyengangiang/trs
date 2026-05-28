import type { MouseEvent } from "react";
import { useApp } from "./script";
import {
  getStatus,
  initials,
  solidTag,
  statusColor,
  statusLabel,
  stripeClr,
} from "./script/utils";
import type { Assignment, Sampler } from "./script/types";

function Modal() {
  const {
    modalItem,
    items,
    assignments,
    handlersByType,
    closeModal,
    openModal,
  } = useApp();
  if (!modalItem) return null;
  const d = modalItem;

  const itemHandlers = handlersByType[d.type ?? "sample"];
  const assignedRows: { s: Sampler; a: Assignment }[] = [];
  itemHandlers.forEach((s) => {
    const a = (assignments[s.id] || []).find((x) => x.reqNo === d.no);
    if (a) assignedRows.push({ s, a });
  });

  const sameStyle = d.style
    ? items.filter(
        (x) =>
          x.no !== d.no &&
          x.style &&
          x.style.trim().toLowerCase() === d.style.trim().toLowerCase(),
      )
    : [];

  const onOverlay = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <div className="overlay show" id="overlay" onClick={onOverlay}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="mhdr"
          id="mhdr"
          style={{ borderLeftColor: stripeClr(d.stype) }}
        >
          <div style={{ flex: 1 }}>
            <div className="mtitle" id="mt">
              {d.item}
            </div>
            <div className="msub" id="ms">
              #{String(d.no).padStart(3, "0")} · {d.brand} · {d.season} · {d.ts}
            </div>
          </div>
          <button className="mclose" onClick={() => closeModal()}>
            ×
          </button>
        </div>

        <div className="mbody" id="mb">
          <div className="msec">
            <p className="mstitle">Sample info</p>
            <div className="mtags">
              <span className={`tag ${solidTag(d.stype)}`}>{d.stype}</span>
              <span className="toutline">{d.color}</span>
              {d.size ? <span className="toutline">{d.size}</span> : null}
              {d.qty ? <span className="toutline">Qty: {d.qty}</span> : null}
              <span className="toutline">{d.factory}</span>
            </div>
            <div className="drow">
              <span className="dk">Style No.</span>
              <span className="dv mn">{d.style || "—"}</span>
            </div>
            <div className="drow">
              <span className="dk">Season</span>
              <span className="dv">{d.season}</span>
            </div>
          </div>

          <div className="msec">
            <p className="mstitle">SMV</p>
            <div className="drow">
              <span className="dk">TP SMV</span>
              <span className="dv">{d.smvTP || "—"}</span>
            </div>
            <div className="drow">
              <span className="dk">Sample SMV</span>
              <span className="dv">{d.smvSPL || "—"}</span>
            </div>
            <div className="drow">
              <span className="dk">Bulk SMV</span>
              <span className="dv">{d.smvBLK || "—"}</span>
            </div>
          </div>

          <div className="msec">
            <p className="mstitle">Schedule</p>
            <div className="drow">
              <span className="dk">Start</span>
              <span className="dv mn">
                {d.reqdate || "—"}
                {d.reqtime ? ` · ${d.reqtime}` : ""}
              </span>
            </div>
            <div className="drow">
              <span className="dk">Est. working hrs</span>
              <span className="dv mn">{d.estHours || "—"}</span>
            </div>
          </div>

          <div className="msec">
            <p className="mstitle">Materials</p>
            <div className="drow">
              <span className="dk">Worksheet</span>
              <span className="dv">
                {d.worksheet || "—"}
                {d.worksheetFiles?.length
                  ? ` · ${d.worksheetFiles.join(", ")}`
                  : ""}
              </span>
            </div>
            <div className="drow">
              <span className="dk">Pattern</span>
              <span className="dv">
                {d.pattern || "—"}
                {d.patternDate ? ` est. ${d.patternDate}` : ""}
              </span>
            </div>
            <div className="drow">
              <span className="dk">Fabric est.</span>
              <span className="dv mn">{d.fabricDate || "—"}</span>
            </div>
            <div className="drow">
              <span className="dk">Trims est.</span>
              <span className="dv mn">{d.trimsDate || "—"}</span>
            </div>
          </div>

          <div className="msec">
            <p className="mstitle">Person In Charge</p>
            <div className="drow">
              <span className="dk">In charge</span>
              <span className="dv">{d.incharge || "—"}</span>
            </div>
            {assignedRows.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 6,
                }}
              >
                {assignedRows.map(({ s, a }) => {
                  const sn = s.name.split(" ").slice(-2).join(" ");
                  return (
                    <div
                      key={s.id}
                      className="drow"
                      style={{ alignItems: "center", gap: 8 }}
                    >
                      <span
                        className="dk"
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "var(--acc)",
                            color: "var(--bg)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 9,
                            fontWeight: 700,
                          }}
                        >
                          {initials(s.name)}
                        </span>
                        {sn} · {s.eid}
                      </span>
                      <span
                        className="dv"
                        style={{
                          fontWeight: 700,
                          color: statusColor(a.status),
                        }}
                      >
                        {statusLabel(a.status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="msec">
            <p className="mstitle">Remark</p>
            {d.remark ? (
              <div className="mrmk">{d.remark}</div>
            ) : (
              <span style={{ fontSize: 12, color: "var(--hi)" }}>—</span>
            )}
          </div>

          {sameStyle.length > 0 && (
            <div
              className="msec"
              style={{ borderTop: "2px solid var(--bdm)", marginTop: 4 }}
            >
              <p
                className="mstitle"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 8 12 12 14 14" />
                </svg>
                Same Style History
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 500,
                    color: "var(--hi)",
                    marginLeft: 4,
                  }}
                >
                  {sameStyle.length} record{sameStyle.length !== 1 ? "s" : ""}
                </span>
              </p>
              {sameStyle
                .slice()
                .reverse()
                .map((x) => {
                  const st = getStatus(x.no, handlersByType[x.type ?? "sample"], assignments);
                  return (
                    <div
                      key={x.no}
                      className="drow"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        closeModal();
                        setTimeout(() => openModal(x.no), 50);
                      }}
                    >
                      <span className="dk">
                        #{String(x.no).padStart(3, "0")} · {x.season}
                      </span>
                      <span
                        className="dv"
                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                      >
                        <span
                          className={`tag ${solidTag(x.stype)}`}
                          style={{ fontSize: 9 }}
                        >
                          {x.stype}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: statusColor(st),
                          }}
                        >
                          {statusLabel(st)}
                        </span>
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
