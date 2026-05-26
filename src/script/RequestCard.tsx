import type { DragEvent, MouseEvent } from "react";
import { SAMPLER_PHOTOS } from "./constants";
import type { Assignment, RequestItem, RequestStatus, Sampler } from "./types";
import {
  assignmentRingColor,
  bannerBackground,
  cardClass,
  escapeHtml,
  formatDate,
  getApprover,
  getAssignedSamplers,
  getFinishedCount,
  getStatus,
  initials,
  solidTag,
  statusColor,
} from "./utils";

export type RequestCardProps = {
  item: RequestItem;
  index: number;
  showActions?: boolean;
  assignments: Record<string, Assignment[]>;
  samplers: Sampler[];
  draggedNo?: number | null;
  onOpen: (no: number) => void;
  onEdit: (no: number) => void;
  onCancel: (no: number) => void;
  onDragStart?: (no: number) => void;
  onDragEnd?: () => void;
};

function DragHandleIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.3 }}>
      <circle cx="2" cy="2" r="1.2" fill="currentColor" />
      <circle cx="8" cy="2" r="1.2" fill="currentColor" />
      <circle cx="2" cy="5" r="1.2" fill="currentColor" />
      <circle cx="8" cy="5" r="1.2" fill="currentColor" />
      <circle cx="2" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function StatusIcon({ status }: { status: RequestStatus }) {
  if (status === "finished") {
    return (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1E8A38"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === "accepted") {
    return (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#D4820A"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return null;
}

function SamplerAvatar({
  sampler,
  assignment,
}: {
  sampler: Sampler;
  assignment?: Assignment;
}) {
  const photo = SAMPLER_PHOTOS[sampler.id];
  const ring = assignmentRingColor(assignment?.status);
  const sharedStyle = {
    width: 22,
    height: 22,
    borderRadius: "50%",
    outline: ring,
    outlineOffset: 1,
    marginLeft: -5,
    flexShrink: 0,
  } as const;

  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{ ...sharedStyle, objectFit: "cover" }}
      />
    );
  }

  return (
    <div
      style={{
        ...sharedStyle,
        background: "var(--sf3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 8,
        fontWeight: 700,
      }}
    >
      {initials(sampler.name)}
    </div>
  );
}

export function RequestCard({
  item: d,
  index: i,
  showActions = false,
  assignments,
  samplers,
  onOpen,
  onEdit,
  onCancel,
  onDragStart,
  onDragEnd,
}: RequestCardProps) {
  const cls = cardClass(d.stype);
  const tagClass = solidTag(d.stype);
  const approver = getApprover(d.no, samplers, assignments);
  const status = getStatus(d.no, samplers, assignments);
  const completedCls =
    status === "finished"
      ? " is-completed"
      : status === "accepted"
        ? " is-in-production"
        : "";
  const assignedSamplers = getAssignedSamplers(d.no, samplers, assignments);
  const finCount = getFinishedCount(d.no, samplers, assignments);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    onDragStart?.(d.no);
    e.currentTarget.classList.add("dragging-card");
    document.body.classList.add("is-dragging");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(d.no));
    }
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("dragging-card");
    document.body.classList.remove("is-dragging");
    onDragEnd?.();
  };

  const stopProp = (e: MouseEvent) => e.stopPropagation();

  return (
    <div
      className={`rcard ${cls}${completedCls}`}
      data-no={d.no}
      draggable
      style={{ animationDelay: `${i * 0.03}s` }}
      onClick={() => onOpen(d.no)}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="cstripe" />
      <div className="cbody">
        <div className="ctop2">
          <span className="cbrand">{escapeHtml(d.brand)}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="cno">#{String(d.no).padStart(3, "0")}</span>
            <DragHandleIcon />
          </div>
        </div>

        <p className="citem">{escapeHtml(d.item)}</p>
        <p className="cseason">{escapeHtml(d.style || d.season)}</p>

        <div className="ctags">
          <span className={`tag ${tagClass}`}>{escapeHtml(d.stype)}</span>
          {d.prodType && (
            <span className="toutline">{escapeHtml(d.prodType)}</span>
          )}
          <span className="toutline">{escapeHtml(d.color)}</span>
          {d.size && <span className="toutline">{escapeHtml(d.size)}</span>}
          {d.qty && <span className="toutline">×{escapeHtml(d.qty)}</span>}
          {d.specialProcess === "yes" && (
            <span className="tag tco">Special</span>
          )}
        </div>
      </div>

      <div className="cfooter">
        <div className="cmrow">
          <span className="cmk">Factory</span>
          <span className="cmv">{escapeHtml(d.factory)}</span>
        </div>
        <div className="cmrow">
          <span className="cmk">Start</span>
          <span className="cmv mn">
            {formatDate(d.reqdate)}
            {d.reqtime ? ` ${d.reqtime}` : ""}
          </span>
        </div>
        <div className="cmrow">
          <span className="cmk">Hours</span>
          <span className="cmv mn">{d.estHours || "—"}</span>
        </div>
        {d.incharge && (
          <div className="cmrow">
            <span className="cmk">In charge</span>
            <span className="cmv">{escapeHtml(d.incharge)}</span>
          </div>
        )}
      </div>

      {assignedSamplers.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 14px",
            borderTop: "1px solid var(--bd)",
            background: bannerBackground(status),
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: 5,
            }}
          >
            {assignedSamplers.map((sm) => {
              const sa = (assignments[sm.id] ?? []).find(
                (a) => a.reqNo === d.no,
              );
              return (
                <SamplerAvatar key={sm.id} sampler={sm} assignment={sa} />
              );
            })}
          </div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: statusColor(status),
              marginLeft: 8,
            }}
          >
            {finCount}/{assignedSamplers.length}
          </span>
          <div style={{ marginLeft: "auto" }}>
            <StatusIcon status={status} />
          </div>
        </div>
      )}

      {showActions && (
        <div className="card-actions" onClick={stopProp}>
          <button
            type="button"
            className="card-edit-btn"
            data-no={d.no}
            onClick={() => onEdit(d.no)}
          >
            Edit
          </button>
          <button
            type="button"
            className="card-cancel-btn"
            data-no={d.no}
            onClick={() => onCancel(d.no)}
          >
            {approver ? "Delete" : "Cancel"}
          </button>
        </div>
      )}
    </div>
  );
}
