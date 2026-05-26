import type { RequestType, Sampler } from "./types";

export const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwZKh1HjcSUd--mDBjQek5UDx1BsV2UR9H7yfCkvxSvOIPtvZdB64hsN18dwe05yrXMLw/exec";

export const SAMPLERS: Sampler[] = [
  { id: "vphn08", name: "Nguyễn Thị Kim Cúc", eid: "VPHN08", level: "Manager" },
  { id: "vphn07", name: "Ngô Thị Hồng Thắm", eid: "VPHN07", level: "Staff" },
  { id: "vphn16", name: "Đỗ Thị Hồng Hạnh", eid: "VPHN16", level: "Staff" },
  { id: "vphn18", name: "Lê Thị Ngọc Ánh", eid: "VPHN18", level: "Staff" },
  { id: "vphn38", name: "Đỗ Thị Thu", eid: "VPHN38", level: "Staff" },
  { id: "vphn40", name: "Nguyễn Thị Hiền", eid: "VPHN40", level: "Staff" },
  { id: "vphn45", name: "Hoàng Thị Hiền", eid: "VPHN45", level: "Staff" },
  { id: "vphn46", name: "Nguyễn Thị Như Hoa", eid: "VPHN46", level: "Staff" },
  { id: "vphn54", name: "Phạm Thị Thu Hà", eid: "VPHN54", level: "Staff" },
  { id: "vphn143", name: "Phạm Thị Vân", eid: "VPHN143", level: "Staff" },
  { id: "vphn157", name: "Nguyễn Thị Bích", eid: "VPHN157", level: "Staff" },
  { id: "vphn250", name: "Do Thi Khue", eid: "VPHN250", level: "Staff" },
];

export const PATTERN_MAKERS: Sampler[] = [
  { id: "pat-001", name: "Nguyễn Văn A", eid: "PAT001", level: "Manager" },
  { id: "pat-002", name: "Trần Thị B", eid: "PAT002", level: "Staff" },
  { id: "pat-003", name: "Lê Văn C", eid: "PAT003", level: "Staff" },
];

export const SMV_STAFF: Sampler[] = [
  { id: "smv-001", name: "Phạm Văn D", eid: "SMV001", level: "Manager" },
  { id: "smv-002", name: "Hoàng Thị E", eid: "SMV002", level: "Staff" },
];

export const HANDLERS_BY_TYPE: Record<RequestType, Sampler[]> = {
  sample: SAMPLERS,
  pattern: PATTERN_MAKERS,
  smv: SMV_STAFF,
};

export const ALL_HANDLERS: Sampler[] = [
  ...SAMPLERS,
  ...PATTERN_MAKERS,
  ...SMV_STAFF,
];

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  sample: "Sample Request",
  pattern: "Pattern Request",
  smv: "SMV Request",
};

export const REQUEST_TYPE_ROLE: Record<RequestType, string> = {
  sample: "Samplers",
  pattern: "Pattern Makers",
  smv: "SMV Staff",
};

export const REQD = ["ff","fb","fse","fi","fty","fcl","frq","fdu","fic"];

/** Photo URLs keyed by sampler id — add entries as assets become available */
export const SAMPLER_PHOTOS: Record<string, string> = {};

export const WORK_HOURS = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
] as const;

export const LW = 148;
export const ZOOM_MIN_H = 8;
export const ZOOM_MAX_H = 120;
export const ZOOM_MIN_D = 20;
export const ZOOM_MAX_D = 200;

export const VN_HOLIDAYS = new Set([
  "2025-01-01", "2025-04-30", "2025-05-01", "2025-09-02", "2025-12-25",
  "2026-01-01", "2026-04-30", "2026-05-01", "2026-09-02", "2026-12-25",
  "2027-01-01", "2027-04-30", "2027-05-01", "2027-09-02", "2027-12-25",
]);

export const VN_LUNAR = new Set([
  "2025-01-28", "2025-01-29", "2025-01-30", "2025-01-31", "2025-02-01",
  "2025-04-07",
  "2026-01-28", "2026-01-29", "2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02",
  "2026-04-06",
  "2027-02-16", "2027-02-17", "2027-02-18", "2027-02-19", "2027-02-20", "2027-02-21",
  "2027-03-27",
]);

export const REQUIRED_FORM_FIELDS = [
  "factory", "brand", "season", "item", "stype", "color",
  "reqdate", "reqtime", "estHours", "incharge",
] as const;

export const EMPTY_NEW_FORM = {
  factory: "",
  brand: "",
  season: "",
  style: "",
  item: "",
  prodType: "",
  smvTP: "",
  smvSPL: "",
  smvBLK: "",
  stype: "",
  color: "",
  size: "",
  qty: "",
  worksheet: "",
  worksheetFile: "",
  pattern: "",
  patternDate: "",
  fabricDate: "",
  trimsDate: "",
  orgSample: false,
  specialProcess: "",
  reqdate: "",
  reqtime: "",
  estHours: "",
  incharge: "",
  remark: "",
} as const;
