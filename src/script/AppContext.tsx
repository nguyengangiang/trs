import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  EMPTY_NEW_FORM,
  GAS_URL,
  PATTERN_MAKERS,
  REQUIRED_FORM_FIELDS,
  SAMPLERS,
  SAMPLER_PHOTOS,
  SMV_STAFF,
  ZOOM_MAX_D,
  ZOOM_MAX_H,
  ZOOM_MIN_D,
  ZOOM_MIN_H,
} from "./constants";
import type {
  Assignment,
  AssignmentStatus,
  EditForm,
  NewRequestForm,
  RequestItem,
  RequestType,
  Sampler,
  SchZoom,
  SummaryStats,
  ToastState,
  ViewId,
} from "./types";
import {
  createEmptyAssignments,
  dateLabel,
  filterByViewMonth,
  getApprovedRows,
  getAssignedSamplers,
  getFinishedCount,
  getStatus,
  isAccepted,
  isFinished,
  monthItemsWithDate,
  statusColor,
  statusLabel,
} from "./utils";

export type AppContextValue = {
  items: RequestItem[];
  handlers: Sampler[];
  handlersByType: Record<RequestType, Sampler[]>;
  allHandlers: Sampler[];
  requestType: RequestType;
  vd: Date;
  flt: string;
  activeView: ViewId;
  toast: ToastState;
  modalNo: number | null;
  editOpen: boolean;
  editingNo: number | null;
  editForm: EditForm;
  newForm: NewRequestForm;
  formErrors: Set<string>;
  assignments: Record<string, Assignment[]>;
  draggedNo: number | null;
  schZoom: SchZoom;
  hw: number;
  dw: number;
  zoomPct: number;
  submitting: boolean;
  dateLabelText: string;
  requestCountLabel: string;
  activeItems: RequestItem[];
  finishedItems: RequestItem[];
  monthFiltered: RequestItem[];
  summary: SummaryStats | null;
  brandFilters: string[];
  modalItem: RequestItem | null;
  reportData: ReturnType<typeof buildReportData>;
  samplerLanes: ReturnType<typeof buildSamplerLanes>;
  approvedRows: ReturnType<typeof getApprovedRows>;
  setDraggedNo: (no: number | null) => void;
  resetForm: () => void;
  setNewFormField: <K extends keyof NewRequestForm>(key: K, value: NewRequestForm[K]) => void;
  setEditFormField: <K extends keyof EditForm>(key: K, value: EditForm[K]) => void;
  setWorksheetFile: (name: string) => void;
  submitRequest: () => Promise<void>;
  nudge: (days: number) => void;
  goToday: () => void;
  setView: (view: ViewId) => void;
  setRequestType: (t: RequestType) => void;
  addHandler: (
    type: RequestType,
    input: { name: string; eid: string; level: string },
  ) => void;
  setFilter: (brand: string) => void;
  setZoom: (z: SchZoom) => void;
  adjustZoom: (delta: number, mouseRatio: number) => void;
  showToast: (msg: string, ok: boolean) => void;
  openModal: (no: number) => void;
  closeModal: () => void;
  openEditModal: (no: number) => void;
  closeEditModal: () => void;
  saveEdit: () => void;
  cancelRequest: (no: number) => void;
  slotAction: (sid: string, no: number, act: "accept" | "finish" | "unaccept" | "rm") => void;
  dropOnLane: (sid: string, no: number) => void;
  triggerWorksheetInput: () => void;
  registerWorksheetInput: (el: HTMLInputElement | null) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

let bridge: AppContextValue | null = null;

function buildReportData(
  items: RequestItem[],
  handlers: Sampler[],
  assignments: Record<string, Assignment[]>,
) {
  const total = items.length;
  const finished = items.filter((d) => isFinished(d.no, handlers, assignments)).length;
  const inProd = items.filter(
    (d) => isAccepted(d.no, handlers, assignments) && !isFinished(d.no, handlers, assignments),
  ).length;
  const pending = items.filter(
    (d) => !isAccepted(d.no, handlers, assignments) && !isFinished(d.no, handlers, assignments),
  ).length;
  const smvNums = items
    .filter((d) => d.smvSPL?.trim())
    .map((d) => parseFloat(d.smvSPL.replace(/[^0-9.]/g, "")))
    .filter((n) => !isNaN(n));
  const avgSMV = smvNums.length
    ? `${Math.round((smvNums.reduce((a, b) => a + b, 0) / smvNums.length) * 10) / 10}h`
    : "—";

  const brandMap: Record<string, number> = {};
  items.forEach((d) => {
    if (d.brand) brandMap[d.brand] = (brandMap[d.brand] || 0) + 1;
  });
  const brands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]);

  const typeMap: Record<string, number> = {};
  items.forEach((d) => {
    const k = d.prodType || d.stype || "Unknown";
    typeMap[k] = (typeMap[k] || 0) + 1;
  });
  const types = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  const rows = items
    .slice()
    .reverse()
    .map((d) => ({
      item: d,
      status: getStatus(d.no, handlers, assignments),
    }));

  return { total, finished, inProd, pending, avgSMV, brands, types, rows };
}

function buildSamplerLanes(
  items: RequestItem[],
  handlers: Sampler[],
  assignments: Record<string, Assignment[]>,
) {
  return handlers.map((s) => {
    const list = assignments[s.id] || [];
    const slots = list
      .map((a) => {
        const req = items.find((x) => x.no === a.reqNo);
        if (!req) return null;
        return { assignment: a, req };
      })
      .filter(Boolean) as { assignment: Assignment; req: RequestItem }[];
    return { sampler: s, slots, count: list.length, photo: SAMPLER_PHOTOS[s.id] };
  });
}

function itemToEditForm(d: RequestItem): EditForm {
  return {
    factory: d.factory || "",
    brand: d.brand || "",
    season: d.season || "",
    style: d.style || "",
    item: d.item || "",
    stype: d.stype || "",
    color: d.color || "",
    size: d.size || "",
    qty: d.qty || "",
    reqdate: d.reqdate || "",
    reqtime: d.reqtime || "",
    estHours: d.estHours || "",
    incharge: d.incharge || "",
    remark: d.remark || "",
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [nextNo, setNextNo] = useState(1);
  const [vd, setVd] = useState(() => new Date());
  const [flt, setFlt] = useState("ALL");
  const navigate = useNavigate();
  const location = useLocation();
  const activeView: ViewId = location.pathname.startsWith("/schedule")
    ? "s"
    : location.pathname.startsWith("/report")
    ? "r"
    : "f";
  const [requestType, setRequestTypeState] = useState<RequestType>("sample");
  const [toast, setToast] = useState<ToastState>({ message: "", ok: true, visible: false });
  const [modalNo, setModalNo] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    factory: "", brand: "", season: "", style: "", item: "", stype: "",
    color: "", size: "", qty: "", reqdate: "", reqtime: "", estHours: "",
    incharge: "", remark: "",
  });
  const [newForm, setNewForm] = useState<NewRequestForm>({ ...EMPTY_NEW_FORM });
  const [formErrors, setFormErrors] = useState<Set<string>>(new Set());
  const [handlersByType, setHandlersByType] = useState<Record<RequestType, Sampler[]>>(() => ({
    sample: [...SAMPLERS],
    pattern: [...PATTERN_MAKERS],
    smv: [...SMV_STAFF],
  }));
  const handlers = useMemo(
    () => handlersByType[requestType],
    [handlersByType, requestType],
  );
  const allHandlers = useMemo(
    () => [...handlersByType.sample, ...handlersByType.pattern, ...handlersByType.smv],
    [handlersByType],
  );
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>(() =>
    createEmptyAssignments(
      [...SAMPLERS, ...PATTERN_MAKERS, ...SMV_STAFF].map((s) => s.id),
    ),
  );
  const [draggedNo, setDraggedNo] = useState<number | null>(null);
  const [schZoom, setSchZoom] = useState<SchZoom>("day");
  const [hw, setHw] = useState(38);
  const [dw, setDw] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const wsInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string, ok: boolean) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message: msg, ok, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 3600);
  }, []);

  const resetForm = useCallback(() => {
    setNewForm({ ...EMPTY_NEW_FORM });
    setFormErrors(new Set());
  }, []);

  const setNewFormField = useCallback(<K extends keyof NewRequestForm>(key: K, value: NewRequestForm[K]) => {
    setNewForm((f) => ({ ...f, [key]: value }));
    setFormErrors((errs) => {
      const next = new Set(errs);
      next.delete(key);
      return next;
    });
  }, []);

  const setEditFormField = useCallback(<K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setEditForm((f) => ({ ...f, [key]: value }));
  }, []);

  const setWorksheetFile = useCallback((name: string) => {
    setNewForm((f) => ({ ...f, worksheetFile: name }));
  }, []);

  const registerWorksheetInput = useCallback((el: HTMLInputElement | null) => {
    wsInputRef.current = el;
  }, []);

  const triggerWorksheetInput = useCallback(() => {
    wsInputRef.current?.click();
  }, []);

  const nudge = useCallback((days: number) => {
    setVd((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + days);
      return next;
    });
  }, []);

  const goToday = useCallback(() => setVd(new Date()), []);

  const setView = useCallback(
    (view: ViewId) => {
      const path =
        view === "s" ? "/schedule" : view === "r" ? "/report" : "/request";
      navigate(path);
    },
    [navigate],
  );

  const setRequestType = useCallback((t: RequestType) => {
    setRequestTypeState(t);
    setFlt("ALL");
  }, []);

  const addHandler = useCallback(
    (
      type: RequestType,
      input: { name: string; eid: string; level: string },
    ) => {
      const name = input.name.trim();
      const eid = input.eid.trim();
      const level = input.level.trim() || "Staff";
      if (!name || !eid) {
        showToast("Name and Employee ID are required.", false);
        return;
      }

      const prefix =
        type === "sample" ? "spl" : type === "pattern" ? "pat" : "smv";
      const allIds = new Set(allHandlers.map((s) => s.id));
      let n = 1;
      while (allIds.has(`${prefix}-${String(n).padStart(3, "0")}`)) n += 1;
      const id = `${prefix}-${String(n).padStart(3, "0")}`;
      const newSampler: Sampler = { id, name, eid, level };

      setHandlersByType((prev) => ({
        ...prev,
        [type]: [...prev[type], newSampler],
      }));
      setAssignments((prev) => ({ ...prev, [id]: [] }));
      showToast(`Added ${name}.`, true);
    },
    [allHandlers, showToast],
  );

  const setFilter = useCallback((brand: string) => setFlt(brand), []);

  const setZoom = useCallback((z: SchZoom) => setSchZoom(z), []);

  const adjustZoom = useCallback(
    (delta: number, _mouseRatio: number) => {
      const factor = delta > 0 ? 1.15 : 0.87;
      if (schZoom === "hour") {
        setHw((prev) => Math.round(Math.min(ZOOM_MAX_H, Math.max(ZOOM_MIN_H, prev * factor))));
      } else {
        setDw((prev) => Math.round(Math.min(ZOOM_MAX_D, Math.max(ZOOM_MIN_D, prev * factor))));
      }
    },
    [schZoom],
  );

  const openModal = useCallback((no: number) => setModalNo(no), []);
  const closeModal = useCallback(() => setModalNo(null), []);

  const openEditModal = useCallback(
    (no: number) => {
      const d = items.find((x) => x.no === no);
      if (!d) return;
      setEditingNo(no);
      setEditForm(itemToEditForm(d));
      setEditOpen(true);
    },
    [items],
  );

  const closeEditModal = useCallback(() => {
    setEditOpen(false);
    setEditingNo(null);
  }, []);

  const submitRequest = useCallback(async () => {
    const errors = new Set<string>();
    REQUIRED_FORM_FIELDS.forEach((key) => {
      const val = String(newForm[key] ?? "").trim();
      if (!val) errors.add(key);
    });
    setFormErrors(errors);
    if (errors.size) {
      showToast("Please fill in all required fields.", false);
      return;
    }

    const d: RequestItem = {
      no: nextNo,
      type: requestType,
      factory: newForm.factory.trim(),
      brand: newForm.brand.trim(),
      season: newForm.season.trim(),
      style: newForm.style.trim(),
      item: newForm.item.trim(),
      prodType: newForm.prodType.trim(),
      smvTP: newForm.smvTP.trim(),
      smvSPL: newForm.smvSPL.trim(),
      smvBLK: newForm.smvBLK.trim(),
      stype: newForm.stype.trim(),
      color: newForm.color.trim(),
      size: newForm.size.trim(),
      qty: newForm.qty.trim(),
      worksheet: newForm.worksheet,
      worksheetFile: newForm.worksheetFile,
      pattern: newForm.pattern,
      patternDate: newForm.patternDate,
      fabricDate: newForm.fabricDate,
      trimsDate: newForm.trimsDate,
      orgSample: newForm.orgSample,
      specialProcess: newForm.specialProcess,
      reqdate: newForm.reqdate.trim(),
      reqtime: newForm.reqtime.trim(),
      estHours: newForm.estHours.trim(),
      incharge: newForm.incharge.trim(),
      remark: newForm.remark.trim(),
      ts: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setItems((prev) => [...prev, d]);
    setNextNo((n) => n + 1);
    resetForm();
    showToast(`[${d.brand} · ${d.stype}] saved.`, true);

    setSubmitting(true);
    try {
      await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(d),
      });
    } catch {
      showToast("Saved locally — sync failed.", false);
    } finally {
      setSubmitting(false);
    }
  }, [newForm, nextNo, requestType, resetForm, showToast]);

  const saveEdit = useCallback(() => {
    if (!editingNo) return;
    setItems((prev) =>
      prev.map((d) =>
        d.no === editingNo
          ? {
              ...d,
              factory: editForm.factory.trim(),
              brand: editForm.brand.trim(),
              season: editForm.season.trim(),
              style: editForm.style.trim(),
              item: editForm.item.trim(),
              stype: editForm.stype.trim(),
              color: editForm.color.trim(),
              size: editForm.size.trim(),
              qty: editForm.qty.trim(),
              reqdate: editForm.reqdate.trim(),
              reqtime: editForm.reqtime.trim(),
              estHours: editForm.estHours.trim(),
              incharge: editForm.incharge.trim(),
              remark: editForm.remark.trim(),
            }
          : d,
      ),
    );
    closeEditModal();
    showToast(`#${String(editingNo).padStart(3, "0")} updated.`, true);
  }, [editForm, editingNo, closeEditModal, showToast]);

  const cancelRequest = useCallback(
    (no: number) => {
      if (!window.confirm(`Cancel request #${String(no).padStart(3, "0")}? This cannot be undone.`)) {
        return;
      }
      setItems((prev) => prev.filter((x) => x.no !== no));
      setAssignments((prev) => {
        const next = { ...prev };
        allHandlers.forEach((s) => {
          next[s.id] = (next[s.id] || []).filter((a) => a.reqNo !== no);
        });
        return next;
      });
      showToast(`Request #${String(no).padStart(3, "0")} cancelled.`, false);
    },
    [allHandlers, showToast],
  );

  const slotAction = useCallback(
    (sid: string, no: number, act: "accept" | "finish" | "unaccept" | "rm") => {
      setAssignments((prev) => {
        const list = [...(prev[sid] || [])];
        const a = list.find((x) => x.reqNo === no);
        if (act === "accept" && a) a.status = "accepted";
        else if (act === "finish" && a) a.status = "finished";
        else if (act === "unaccept" && a) a.status = "pending";
        else if (act === "rm") {
          return { ...prev, [sid]: list.filter((x) => x.reqNo !== no) };
        }
        return { ...prev, [sid]: list };
      });
      if (act === "accept") showToast("Request accepted — production started!", true);
      if (act === "finish") showToast("Sample finished! ✓", true);
    },
    [showToast],
  );

  const dropOnLane = useCallback((sid: string, no: number) => {
    setAssignments((prev) => {
      const list = prev[sid] || [];
      if (list.find((a) => a.reqNo === no)) return prev;
      return { ...prev, [sid]: [...list, { reqNo: no, status: "pending" as AssignmentStatus }] };
    });
    setDraggedNo(null);
  }, []);

  const typedItems = useMemo(
    () => items.filter((d) => (d.type ?? "sample") === requestType),
    [items, requestType],
  );

  const monthFiltered = useMemo(
    () => filterByViewMonth(typedItems, vd),
    [typedItems, vd],
  );
  const activeItems = useMemo(
    () => monthFiltered.filter((d) => !isFinished(d.no, handlers, assignments)).slice().reverse(),
    [monthFiltered, handlers, assignments],
  );
  const finishedItems = useMemo(
    () => monthFiltered.filter((d) => isFinished(d.no, handlers, assignments)).slice().reverse(),
    [monthFiltered, handlers, assignments],
  );

  const summary = useMemo((): SummaryStats | null => {
    const monthItems = monthItemsWithDate(typedItems, vd);
    const total = monthItems.length;
    if (!total) return null;
    const completed = monthItems.filter((d) =>
      isFinished(d.no, handlers, assignments),
    ).length;
    return {
      monthName: vd.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      total,
      approved: completed,
      pending: total - completed,
    };
  }, [typedItems, vd, handlers, assignments]);

  const brandFilters = useMemo(() => {
    const brands = [...new Set(typedItems.map((x) => x.brand).filter(Boolean))];
    return ["ALL", ...brands];
  }, [typedItems]);

  const modalItem = useMemo(
    () => (modalNo != null ? items.find((x) => x.no === modalNo) ?? null : null),
    [items, modalNo],
  );

  const reportData = useMemo(
    () => buildReportData(typedItems, handlers, assignments),
    [typedItems, handlers, assignments],
  );
  const samplerLanes = useMemo(
    () => buildSamplerLanes(typedItems, handlers, assignments),
    [typedItems, handlers, assignments],
  );
  const approvedRows = useMemo(
    () => getApprovedRows(typedItems, handlers, assignments),
    [typedItems, handlers, assignments],
  );

  const zoomPct = useMemo(() => {
    if (schZoom === "hour") {
      return Math.round(((hw - ZOOM_MIN_H) / (ZOOM_MAX_H - ZOOM_MIN_H)) * 100);
    }
    return Math.round(((dw - ZOOM_MIN_D) / (ZOOM_MAX_D - ZOOM_MIN_D)) * 100);
  }, [schZoom, hw, dw]);

  const value = useMemo<AppContextValue>(
    () => ({
      items,
      handlers,
      handlersByType,
      allHandlers,
      requestType,
      vd,
      flt,
      activeView,
      toast,
      modalNo,
      editOpen,
      editingNo,
      editForm,
      newForm,
      formErrors,
      assignments,
      draggedNo,
      schZoom,
      hw,
      dw,
      zoomPct,
      submitting,
      dateLabelText: dateLabel(vd),
      requestCountLabel: `${typedItems.length} request${typedItems.length !== 1 ? "s" : ""}`,
      activeItems,
      finishedItems,
      monthFiltered,
      summary,
      brandFilters,
      modalItem,
      reportData,
      samplerLanes,
      approvedRows,
      setDraggedNo,
      resetForm,
      setNewFormField,
      setEditFormField,
      setWorksheetFile,
      submitRequest,
      nudge,
      goToday,
      setView,
      setRequestType,
      addHandler,
      setFilter,
      setZoom,
      adjustZoom,
      showToast,
      openModal,
      closeModal,
      openEditModal,
      closeEditModal,
      saveEdit,
      cancelRequest,
      slotAction,
      dropOnLane,
      triggerWorksheetInput,
      registerWorksheetInput,
    }),
    [
      items, handlers, handlersByType, allHandlers, requestType, typedItems, vd, flt, activeView, toast, modalNo,
      editOpen, editingNo, editForm, newForm,
      formErrors, assignments, draggedNo, schZoom, hw, dw, zoomPct, submitting,
      activeItems, finishedItems, monthFiltered, summary, brandFilters, modalItem,
      reportData, samplerLanes, approvedRows,
      resetForm, setNewFormField, setEditFormField, setWorksheetFile, submitRequest,
      nudge, goToday, setView, setRequestType, addHandler, setFilter, setZoom, adjustZoom, showToast,
      openModal, closeModal, openEditModal, closeEditModal, saveEdit, cancelRequest,
      slotAction, dropOnLane, triggerWorksheetInput, registerWorksheetInput,
    ],
  );

  useEffect(() => {
    bridge = value;
    return () => {
      bridge = null;
    };
  }, [value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        closeEditModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal, closeEditModal]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

/** Legacy bridge for components not yet on useApp() */
export function getAppBridge(): AppContextValue | null {
  return bridge;
}

export { getAssignedSamplers, getFinishedCount, getStatus, statusColor, statusLabel };
