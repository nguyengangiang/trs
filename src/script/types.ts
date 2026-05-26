export type ViewId = "f" | "s" | "r";
export type SchZoom = "hour" | "day";
export type AssignmentStatus = "pending" | "accepted" | "finished";
export type RequestStatus = "pending" | "accepted" | "finished";
export type RequestType = "sample" | "pattern" | "smv";

export interface Sampler {
  id: string;
  name: string;
  eid: string;
  level: string;
}

export interface Assignment {
  reqNo: number;
  status: AssignmentStatus;
  approved?: boolean;
}

export interface RequestItem {
  no: number;
  type: RequestType;
  factory: string;
  brand: string;
  season: string;
  style: string;
  item: string;
  prodType: string;
  smvTP: string;
  smvSPL: string;
  smvBLK: string;
  stype: string;
  color: string;
  size: string;
  qty: string;
  worksheet: string;
  worksheetFile: string;
  pattern: string;
  patternDate: string;
  fabricDate: string;
  trimsDate: string;
  orgSample: boolean;
  specialProcess: string;
  reqdate: string;
  reqtime: string;
  estHours: string;
  incharge: string;
  remark: string;
  ts: string;
}

export interface NewRequestForm {
  factory: string;
  brand: string;
  season: string;
  style: string;
  item: string;
  prodType: string;
  smvTP: string;
  smvSPL: string;
  smvBLK: string;
  stype: string;
  color: string;
  size: string;
  qty: string;
  worksheet: string;
  worksheetFile: string;
  pattern: string;
  patternDate: string;
  fabricDate: string;
  trimsDate: string;
  orgSample: boolean;
  specialProcess: string;
  reqdate: string;
  reqtime: string;
  estHours: string;
  incharge: string;
  remark: string;
}

export interface EditForm {
  factory: string;
  brand: string;
  season: string;
  style: string;
  item: string;
  stype: string;
  color: string;
  size: string;
  qty: string;
  reqdate: string;
  reqtime: string;
  estHours: string;
  incharge: string;
  remark: string;
}

export interface ToastState {
  message: string;
  ok: boolean;
  visible: boolean;
}

export interface SummaryStats {
  monthName: string;
  total: number;
  approved: number;
  pending: number;
}
