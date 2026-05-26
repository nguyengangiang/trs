import type { MouseEvent } from "react";
import { useApp } from "./script";
import { WORK_HOURS } from "./script/constants";

type Props = {
  closeEditModal: () => void;
  closeEditModalDirect: () => void;
  saveEdit: () => void;
};

function EditModal({ closeEditModal, closeEditModalDirect, saveEdit }: Props) {
  const { editingNo, editForm, setEditFormField, items } = useApp();
  const d = editingNo != null ? items.find((x) => x.no === editingNo) : null;

  return (
    <div
      className="overlay show"
      id="edit-overlay"
      onClick={(e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) closeEditModalDirect();
      }}
    >
      <div className="modal" style={{ width: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="mhdr" style={{ borderLeft: "3px solid var(--am)" }}>
          <div style={{ flex: 1 }}>
            <div className="mtitle" id="em-title">
              {editingNo != null
                ? `Edit #${String(editingNo).padStart(3, "0")}`
                : "Edit request"}
            </div>
            <div className="msub" id="em-sub">
              {d ? `${d.brand} · ${d.item}` : ""}
            </div>
          </div>
          <button type="button" className="mclose" onClick={closeEditModalDirect}>
            ×
          </button>
        </div>

        <div className="mbody edit-form">
          <div style={{ marginBottom: 8 }}>
            <div className="fld">
              <label className="lbl">Factory</label>
              <select
                id="ef-ff"
                value={editForm.factory}
                onChange={(e) => setEditFormField("factory", e.target.value)}
              >
                <option value="">Select</option>
                <option>YIC HANAM</option>
                <option>YIC ONE</option>
              </select>
            </div>
            <div className="fld">
              <label className="lbl">Brand</label>
              <select
                id="ef-fb"
                value={editForm.brand}
                onChange={(e) => setEditFormField("brand", e.target.value)}
              >
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

          <div className="g2" style={{ marginBottom: 8 }}>
            <div className="fld">
              <label className="lbl">Season</label>
              <select
                id="ef-fse"
                value={editForm.season}
                onChange={(e) => setEditFormField("season", e.target.value)}
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
                id="ef-fst"
                value={editForm.style}
                onChange={(e) => setEditFormField("style", e.target.value)}
                placeholder="LKLP6AN054"
              />
            </div>
          </div>

          <div className="fld" style={{ marginBottom: 8 }}>
            <label className="lbl">Item name</label>
            <input
              id="ef-fi"
              value={editForm.item}
              onChange={(e) => setEditFormField("item", e.target.value)}
              placeholder="e.g. WM'S LONG PANTS"
            />
          </div>

          <div className="g3" style={{ marginBottom: 8 }}>
            <div className="fld">
              <label className="lbl">Sample type</label>
              <input
                id="ef-fty"
                value={editForm.stype}
                onChange={(e) => setEditFormField("stype", e.target.value)}
                placeholder="e.g. PP SAMPLE"
              />
            </div>
            <div className="fld">
              <label className="lbl">Color</label>
              <input
                id="ef-fcl"
                value={editForm.color}
                onChange={(e) => setEditFormField("color", e.target.value)}
                placeholder="BLACK"
              />
            </div>
            <div className="fld">
              <label className="lbl">Size</label>
              <input
                id="ef-fsz"
                value={editForm.size}
                onChange={(e) => setEditFormField("size", e.target.value)}
                placeholder="e.g. M"
              />
            </div>
          </div>

          <div className="g2" style={{ marginBottom: 8 }}>
            <div className="fld">
              <label className="lbl">Request date</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="date"
                  id="ef-frq"
                  style={{ flex: 1 }}
                  value={editForm.reqdate}
                  onChange={(e) => setEditFormField("reqdate", e.target.value)}
                />
                <select
                  id="ef-frt"
                  style={{ width: 96 }}
                  value={editForm.reqtime}
                  onChange={(e) => setEditFormField("reqtime", e.target.value)}
                >
                  <option value="">Start</option>
                  {WORK_HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fld">
              <label className="lbl"> working hours</label>
              <input
                type="number"
                id="ef-feh"
                min={0.5}
                step={0.5}
                value={editForm.estHours}
                onChange={(e) => setEditFormField("estHours", e.target.value)}
                placeholder="e.g. 4"
              />
            </div>
          </div>

          <div className="g2" style={{ marginBottom: 8 }}>
            <div className="fld">
              <label className="lbl">Qty</label>
              <input
                id="ef-fq"
                type="number"
                min={1}
                value={editForm.qty}
                onChange={(e) => setEditFormField("qty", e.target.value)}
                placeholder="2"
              />
            </div>
            <div className="fld">
              <label className="lbl">In charge</label>
              <input
                id="ef-fic"
                value={editForm.incharge}
                onChange={(e) => setEditFormField("incharge", e.target.value)}
                placeholder="Name"
              />
            </div>
          </div>

          <div className="fld">
            <label className="lbl">Remark</label>
            <textarea
              id="ef-frm"
              value={editForm.remark}
              onChange={(e) => setEditFormField("remark", e.target.value)}
              placeholder="Notes, special process details, etc."
              style={{ minHeight: 60 }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 16,
              paddingTop: 14,
              borderTop: "1px solid var(--bd)",
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: 9,
                fontFamily: "var(--f)",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--mu)",
                background: "transparent",
                border: "1px solid var(--bdm)",
                borderRadius: "var(--r)",
                cursor: "pointer",
              }}
              onClick={closeEditModal}
            >
              Discard
            </button>
            <button
              type="button"
              style={{
                flex: 2,
                padding: 9,
                fontFamily: "var(--f)",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--bg)",
                background: "var(--tx)",
                border: "none",
                borderRadius: "var(--r)",
                cursor: "pointer",
              }}
              onClick={saveEdit}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
