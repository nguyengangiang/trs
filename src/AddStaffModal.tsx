import type { MouseEvent } from "react";
import { useState } from "react";
import { useApp } from "./script";
import { FACTORIES, REQUEST_TYPE_LABEL } from "./script/constants";
import type { RequestType } from "./script/types";

const DEPARTMENTS: RequestType[] = ["sample", "pattern", "smv"];
const LEVELS = ["Manager", "Staff"] as const;

type Props = {
  onClose: () => void;
};

function AddStaffModal({ onClose }: Props) {
  const { addHandler, requestType } = useApp();

  const [name, setName] = useState("");
  const [eid, setEid] = useState("");
  const [factory, setFactory] = useState("");
  const [department, setDepartment] = useState<RequestType>(requestType);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Staff");
  const [errors, setErrors] = useState<Set<string>>(new Set());

  const onOverlay = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const onSubmit = () => {
    const next = new Set<string>();
    if (!name.trim()) next.add("name");
    if (!eid.trim()) next.add("eid");
    setErrors(next);
    if (next.size) return;
    addHandler(department, { name, eid, level });
    onClose();
  };

  const errCls = (key: string) => (errors.has(key) ? "er" : "");

  return (
    <div className="overlay show" onClick={onOverlay}>
      <div
        className="modal"
        style={{ width: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mhdr"
          style={{ borderLeft: "3px solid var(--acc)" }}
        >
          <div style={{ flex: 1 }}>
            <div className="mtitle">Add staff</div>
            <div className="msub">
              Adds to the {REQUEST_TYPE_LABEL[department]} board
            </div>
          </div>
          <button className="mclose" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="mbody">
          <div className="msec">
            <div className="g2" style={{ marginBottom: 8 }}>
              <div className="fld">
                <label className="lbl">
                  Name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className={errCls("name")}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.has("name")) {
                      setErrors((s) => {
                        const n = new Set(s);
                        n.delete("name");
                        return n;
                      });
                    }
                  }}
                  placeholder="Full name"
                />
              </div>
              <div className="fld">
                <label className="lbl">
                  Employee ID <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className={errCls("eid")}
                  value={eid}
                  onChange={(e) => {
                    setEid(e.target.value);
                    if (errors.has("eid")) {
                      setErrors((s) => {
                        const n = new Set(s);
                        n.delete("eid");
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. VPHN42"
                />
              </div>
            </div>
            <div className="fld">
                <label className="lbl">
                  Factory <span className="req">*</span>
                </label>
                <select
                  value={factory}
                  onChange={(e) => setFactory(e.target.value)}
                >
                  {FACTORIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>


            <div className="g2">
              <div className="fld">
                <label className="lbl">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as RequestType)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {REQUEST_TYPE_LABEL[d].replace(" Request", "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label className="lbl">Level</label>
                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value as (typeof LEVELS)[number])
                  }
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 16px",
            borderTop: "1px solid var(--bdm)",
          }}
        >
          <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{ background: "var(--sf2)" }}
          >
            Cancel
          </button>
          <button type="button" className="btn ok" onClick={onSubmit}>
            Add staff
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddStaffModal;
