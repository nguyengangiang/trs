import { VN_HOLIDAYS, VN_LUNAR } from "./constants";
import type {
  Assignment,
  AssignmentStatus,
  RequestItem,
  RequestStatus,
  Sampler,
} from "./types";

export type SampleTypeKey = "pp" | "pr" | "te" | "ap" | "ot";

const SAMPLE_TYPE_TAG: Record<SampleTypeKey, string> = {
  pp: "tbl",
  pr: "tam",
  te: "tco",
  ap: "tgn",
  ot: "tgy",
};

const SAMPLE_TYPE_BAR: Record<SampleTypeKey, string> = {
  pp: "gb-pp",
  pr: "gb-pr",
  te: "gb-te",
  ap: "gb-ap",
  ot: "gb-ot",
};

const SAMPLE_TYPE_STRIPE: Record<SampleTypeKey, string> = {
  pp: "#1666D4",
  pr: "#D4820A",
  te: "#D42828",
  ap: "#1E8A38",
  ot: "#B0ADA8",
};

const SAMPLE_TYPE_CARD: Record<SampleTypeKey, string> = {
  pp: "cpp",
  pr: "cpr",
  te: "cte",
  ap: "cap",
  ot: "cot",
};

export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatDate(d?: string): string {
  if (!d) return "—";
  const p = d.split("-");
  return `${p[1]}/${p[2]}`;
}

export function initials(name: string): string {
  const parts = name.split(" ");
  return (
    ((parts[parts.length - 2] || "")[0] || "") +
    ((parts[parts.length - 1] || "")[0] || "")
  );
}

export function typeClass(t?: string): SampleTypeKey {
  if (!t) return "ot";
  const s = t.toLowerCase();
  if (s.includes("pp")) return "pp";
  if (s.includes("proto")) return "pr";
  if (
    s.includes("test") ||
    s.includes("wash") ||
    s.includes("wear") ||
    s.includes("garment")
  ) {
    return "te";
  }
  if (s.includes("approval") || s.includes("check")) return "ap";
  return "ot";
}

export function solidTag(t?: string): string {
  return SAMPLE_TYPE_TAG[typeClass(t)];
}

export function barCls(t?: string): string {
  return SAMPLE_TYPE_BAR[typeClass(t)];
}

export function stripeClr(t?: string): string {
  return SAMPLE_TYPE_STRIPE[typeClass(t)];
}

export function cardClass(t?: string): string {
  return SAMPLE_TYPE_CARD[typeClass(t)];
}

export function isVNHoliday(ds: string): boolean {
  return VN_HOLIDAYS.has(ds) || VN_LUNAR.has(ds);
}

export function filterByViewMonth(items: RequestItem[], vd: Date): RequestItem[] {
  const year = vd.getFullYear();
  const month = vd.getMonth();
  return items.filter((item) => {
    if (!item.reqdate) return true;
    const [y, m] = item.reqdate.split("-").map((n) => parseInt(n, 10));
    return y === year && m - 1 === month;
  });
}

export function monthItemsWithDate(items: RequestItem[], vd: Date): RequestItem[] {
  const year = vd.getFullYear();
  const month = vd.getMonth();
  return items.filter((item) => {
    if (!item.reqdate) return false;
    const [y, m] = item.reqdate.split("-").map((n) => parseInt(n, 10));
    return y === year && m - 1 === month;
  });
}

export function dateLabel(vd: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const current = new Date(vd);
  current.setHours(0, 0, 0, 0);
  const isToday = current.getTime() === today.getTime();
  const label = vd.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (isToday ? "Today  ·  " : "") + label;
}

export function buildDayRange(): Date[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 12, 0);
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function assignmentsFor(
  samplerId: string,
  assignments: Record<string, Assignment[]>,
): Assignment[] {
  return assignments[samplerId] ?? [];
}

export function getAssignedSamplers(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): Sampler[] {
  return samplers.filter((s) =>
    assignmentsFor(s.id, assignments).some((a) => a.reqNo === no),
  );
}

export function getFinishedCount(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): number {
  return samplers.filter((s) =>
    assignmentsFor(s.id, assignments).some(
      (a) => a.reqNo === no && a.status === "finished",
    ),
  ).length;
}

export function getApprover(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): Sampler | null {
  for (const s of samplers) {
    if (
      assignmentsFor(s.id, assignments).some(
        (a) =>
          a.reqNo === no &&
          (a.status === "accepted" || a.status === "finished"),
      )
    ) {
      return s;
    }
  }
  return null;
}

export function getStatus(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): RequestStatus {
  const assigned = getAssignedSamplers(no, samplers, assignments);
  if (!assigned.length) return "pending";

  const allForRequest = assigned.flatMap((s) =>
    assignmentsFor(s.id, assignments).filter((a) => a.reqNo === no),
  );

  if (allForRequest.every((a) => a.status === "finished")) return "finished";
  if (
    allForRequest.some(
      (a) => a.status === "accepted" || a.status === "finished",
    )
  ) {
    return "accepted";
  }
  return "pending";
}

export function isAccepted(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): boolean {
  return samplers.some((s) =>
    assignmentsFor(s.id, assignments).some(
      (a) =>
        a.reqNo === no &&
        (a.status === "accepted" || a.status === "finished"),
    ),
  );
}

export function isFinished(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): boolean {
  const assigned = getAssignedSamplers(no, samplers, assignments);
  if (!assigned.length) return false;
  return assigned.every((s) =>
    assignmentsFor(s.id, assignments).some(
      (a) => a.reqNo === no && a.status === "finished",
    ),
  );
}

export function isApproved(
  no: number,
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): boolean {
  return (
    isAccepted(no, samplers, assignments) ||
    isFinished(no, samplers, assignments)
  );
}

export function statusLabel(st: RequestStatus): string {
  if (st === "finished") return "✓ Finished";
  if (st === "accepted") return "In Prod.";
  return "Pending";
}

export function statusColor(st: RequestStatus): string {
  if (st === "finished") return "var(--gn)";
  if (st === "accepted") return "var(--am-t)";
  return "var(--hi)";
}

export function assignmentRingColor(status?: AssignmentStatus): string {
  if (status === "finished") return "2px solid #1E8A38";
  if (status === "accepted") return "2px solid #D4820A";
  return "2px solid #ccc";
}

export function bannerBackground(status: RequestStatus): string {
  if (status === "finished") return "rgba(28,138,56,.07)";
  if (status === "accepted") return "rgba(212,130,10,.06)";
  return "var(--sf2)";
}

export type ApprovedRow = {
  s: Sampler;
  req: RequestItem;
  rowStatus: AssignmentStatus;
};

export function getApprovedRows(
  items: RequestItem[],
  samplers: Sampler[],
  assignments: Record<string, Assignment[]>,
): ApprovedRow[] {
  const rows: ApprovedRow[] = [];
  samplers.forEach((s) => {
    assignmentsFor(s.id, assignments).forEach((a) => {
      const st = a.status ?? "pending";
      if (st !== "accepted" && st !== "finished") return;
      const req = items.find((x) => x.no === a.reqNo);
      if (!req) return;
      rows.push({ s, req, rowStatus: st });
    });
  });
  return rows;
}

export function createEmptyAssignments(
  samplerIds: string[],
): Record<string, Assignment[]> {
  const out: Record<string, Assignment[]> = {};
  samplerIds.forEach((id) => {
    out[id] = [];
  });
  return out;
}
