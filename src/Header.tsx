import { useEffect, useRef, useState } from "react";
import { useApp } from "./script";
import { REQUEST_TYPE_LABEL } from "./script/constants";
import type { RequestType } from "./script/types";
import AddStaffModal from "./AddStaffModal";

const REQUEST_TYPES: RequestType[] = ["sample", "pattern", "smv"];

function Header() {
  const {
    dateLabelText,
    requestCountLabel,
    activeView,
    requestType,
    nudge,
    goToday,
    setView,
    setRequestType,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onPick = (t: RequestType) => {
    setRequestType(t);
    setView("f");
    setOpen(false);
  };

  return (
    <header className="hdr">
      <div className="hdr-top">
        <div className="brand">
          <div className="lbox">
            <span>YIC</span>
          </div>
          <div>
            <div className="brand-name">{REQUEST_TYPE_LABEL[requestType]}</div>
            <div className="brand-sub">YIC ONE · YIC HANAM</div>
          </div>
        </div>

        <div className="dnav">
          <button type="button" className="dbt" onClick={() => nudge(-1)}>
            ‹
          </button>

          <span className="dlbl">{dateLabelText}</span>

          <button type="button" className="dbt" onClick={() => nudge(1)}>
            ›
          </button>

          <button type="button" className="dtdy" onClick={goToday}>
            Today
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="chip">{requestCountLabel}</span>
          <button
            type="button"
            className="dtdy"
            onClick={() => setAddStaffOpen(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add staff
          </button>
        </div>
      </div>

      <div className="hdr-bot">
        <div
          ref={wrapRef}
          style={{ position: "relative", display: "inline-block" }}
        >
          <button
            type="button"
            className={`tab${activeView === "f" ? " on" : ""}`}
            onClick={() => {
              if (activeView !== "f") setView("f");
              setOpen((v) => !v);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            {REQUEST_TYPE_LABEL[requestType]}
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              style={{
                transition: "transform .15s",
                transform: open ? "rotate(180deg)" : "none",
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {open && (
            <div
              role="menu"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 4,
                minWidth: 180,
                background: "var(--sf)",
                border: "1px solid var(--bdm)",
                borderRadius: 6,
                boxShadow: "0 4px 16px rgba(0,0,0,.12)",
                padding: 4,
                zIndex: 50,
              }}
            >
              {REQUEST_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="menuitem"
                  onClick={() => onPick(t)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    fontSize: 12,
                    fontWeight: requestType === t ? 700 : 500,
                    color:
                      requestType === t ? "var(--acc)" : "var(--fg, inherit)",
                    background:
                      requestType === t ? "var(--sf2)" : "transparent",
                    border: 0,
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  {REQUEST_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`tab${activeView === "s" ? " on" : ""}`}
          onClick={() => setView("s")}
        >
          Schedule
        </button>

        <button
          type="button"
          className={`tab${activeView === "r" ? " on" : ""}`}
          onClick={() => setView("r")}
        >
          Report
        </button>
      </div>

      {addStaffOpen && (
        <AddStaffModal onClose={() => setAddStaffOpen(false)} />
      )}
    </header>
  );
}

export default Header;
