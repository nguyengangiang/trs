import { useEffect, useMemo, useRef } from "react";
import {
  LW,
  SAMPLER_PHOTOS,
  WORK_HOURS,
} from "./script/constants";
import { useApp } from "./script";
import { barCls, buildDayRange, initials, isVNHoliday } from "./script/utils";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const SLOTS_PER_DAY = WORK_HOURS.length;
const WORK_HOURS_LIST: readonly string[] = WORK_HOURS;

type SlotRange = {
  startDayIdx: number;
  startSlotInDay: number;
  startAbs: number;
  endAbs: number;
  endDayIdx: number;
  spanSlots: number;
  spanDays: number;
};

function computeSlotRange(
  reqdate: string,
  reqtime: string,
  estHours: string,
  dayKeys: string[],
): SlotRange | null {
  const startDayIdx = dayKeys.indexOf(reqdate);
  if (startDayIdx < 0) return null;
  let startSlotInDay = WORK_HOURS_LIST.indexOf(reqtime);
  if (startSlotInDay < 0) startSlotInDay = 0;
  const hours = parseFloat(estHours);
  if (!isFinite(hours) || hours <= 0) return null;
  const spanSlots = Math.max(1, Math.ceil(hours * 2));
  const startAbs = startDayIdx * SLOTS_PER_DAY + startSlotInDay;
  const endAbs = Math.min(
    dayKeys.length * SLOTS_PER_DAY - 1,
    startAbs + spanSlots - 1,
  );
  const endDayIdx = Math.floor(endAbs / SLOTS_PER_DAY);
  return {
    startDayIdx,
    startSlotInDay,
    startAbs,
    endAbs,
    endDayIdx,
    spanSlots: endAbs - startAbs + 1,
    spanDays: endDayIdx - startDayIdx + 1,
  };
}

function Schedule() {
  const {
    flt,
    brandFilters,
    setFilter,
    schZoom,
    setZoom,
    zoomPct,
    samplerLanes,
    approvedRows,
    handlers,
    dw,
    hw,
    openModal,
  } = useApp();

  const days = useMemo(() => buildDayRange(), []);
  const dayKeys = useMemo(() => days.map(toISODate), [days]);
  const todayStr = useMemo(() => toISODate(new Date()), []);
  const todayIdx = useMemo(() => dayKeys.indexOf(todayStr), [dayKeys, todayStr]);

  const outerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const outer = outerRef.current;
    if (!outer || todayIdx < 0) return;
    const scrollLeft =
      schZoom === "hour"
        ? todayIdx * SLOTS_PER_DAY * hw
        : todayIdx * dw;
    outer.scrollLeft = Math.max(0, scrollLeft);
  }, [schZoom, dw, hw, todayIdx]);

  const filteredRows = useMemo(() => {
    if (flt === "ALL") return approvedRows;
    return approvedRows.filter((r) => r.req.brand === flt);
  }, [approvedRows, flt]);

  const months = useMemo(() => {
    const out: Array<{ key: string; label: string; cnt: number }> = [];
    days.forEach((d) => {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!out.length || out[out.length - 1].key !== key) {
        out.push({
          key,
          label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          cnt: 0,
        });
      }
      out[out.length - 1].cnt += 1;
    });
    return out;
  }, [days]);

  const dayCols = `${LW}px repeat(${days.length}, ${dw}px)`;
  const hourCols = `${LW}px repeat(${days.length * SLOTS_PER_DAY}, ${hw}px)`;

  const renderSamplerLabel = (
    s: { id: string; name: string },
    item: string,
    rowStatus: "accepted" | "finished" | "pending",
    onClick: () => void,
  ) => {
    const photo = SAMPLER_PHOTOS[s.id];
    const sn = s.name.split(" ").slice(-2).join(" ");
    const dotColor = rowStatus === "finished" ? "#1E8A38" : "#D4820A";
    return (
      <div
        className="srow-lbl"
        style={{
          minWidth: LW,
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          padding: "0 10px",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--acc)",
              color: "var(--bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {initials(s.name)}
          </div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: LW - 60,
            }}
          >
            {sn}
          </div>
          <div
            style={{
              fontSize: 8,
              color: "var(--hi)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: LW - 60,
            }}
          >
            {item}
          </div>
        </div>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
      </div>
    );
  };

  const renderDayView = () => (
    <div
      id="schInner"
      style={{ display: "inline-block", minWidth: "100%", position: "relative" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: dayCols,
          position: "sticky",
          top: 0,
          zIndex: 31,
          background: "var(--sf)",
          borderBottom: "1px solid var(--bd)",
        }}
      >
        <div style={{ minWidth: LW, borderRight: "1px solid var(--bdm)" }} />
        {months.map((m) => (
          <div
            key={m.key}
            style={{
              gridColumn: `span ${m.cnt}`,
              fontSize: 10,
              fontWeight: 700,
              color: "var(--mu)",
              padding: "5px 10px",
              borderRight: "1px solid var(--bdm)",
            }}
          >
            {m.label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: dayCols,
          position: "sticky",
          top: 24,
          zIndex: 30,
          background: "var(--sf)",
          borderBottom: "1px solid var(--bdm)",
        }}
      >
        <div
          style={{
            minWidth: LW,
            borderRight: "1px solid var(--bdm)",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            fontSize: 9,
            fontWeight: 700,
            color: "var(--hi)",
            textTransform: "uppercase",
            letterSpacing: ".12em",
          }}
        >
          Sampler
        </div>
        {days.map((d, i) => {
          const ds = dayKeys[i];
          const isTd = ds === todayStr;
          const isWe = d.getDay() === 0 || d.getDay() === 6;
          const isHol = isVNHoliday(ds);
          const bg = isTd
            ? "var(--acc)"
            : isHol && !isWe
            ? "rgba(255,160,0,.15)"
            : isWe
            ? "rgba(208,48,48,.1)"
            : "var(--sf)";
          const col = isTd
            ? "var(--bg)"
            : isWe
            ? "#CC2020"
            : isHol
            ? "#B06000"
            : "var(--hi)";
          return (
            <div
              key={ds}
              style={{
                background: bg,
                color: col,
                fontSize: 8.5,
                fontWeight: 700,
                textAlign: "center",
                padding: "3px 1px",
                borderRight: "1px solid var(--bd)",
              }}
            >
              {d.getDate()}
              {isHol && !isWe ? (
                <span
                  style={{
                    display: "block",
                    width: 3,
                    height: 3,
                    borderRadius: "50%",
                    background: "#E09000",
                    margin: "1px auto 0",
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {filteredRows.length === 0 ? (
        <div className="sch-empty">
          Approve a request to see it on the schedule.
        </div>
      ) : (
        filteredRows.map((row, rowIdx) => {
          const { s, req, rowStatus } = row;
          const r = computeSlotRange(
            req.reqdate,
            req.reqtime,
            req.estHours,
            dayKeys,
          );
          const si = r ? r.startDayIdx : Math.max(0, dayKeys.indexOf(req.reqdate));
          const ei = r ? r.endDayIdx : si;
          const span = ei - si + 1;
          const bc = barCls(req.stype);

          return (
            <div
              key={`${s.id}-${req.no}-${rowIdx}`}
              style={{
                display: "grid",
                gridTemplateColumns: dayCols,
                borderBottom: "1px solid var(--bd)",
                minHeight: 44,
              }}
            >
              {renderSamplerLabel(s, req.item, rowStatus, () =>
                openModal(req.no),
              )}

              {days.map((d, i) => {
                if (i > si && i <= ei) return null;
                const ds = dayKeys[i];
                const isTd = ds === todayStr;
                const isWe = d.getDay() === 0 || d.getDay() === 6;
                const isHol = isVNHoliday(ds);
                const isM = d.getDate() === 1;
                const bg = isTd
                  ? "rgba(229,32,42,.05)"
                  : isHol
                  ? "rgba(255,165,0,.07)"
                  : isWe
                  ? "rgba(208,48,48,.05)"
                  : "transparent";
                const br = isM
                  ? "1px solid var(--bdm)"
                  : "1px solid var(--bd)";

                if (i === si) {
                  return (
                    <div
                      key={ds}
                      style={{
                        background: bg,
                        borderRight: br,
                        gridColumn: `span ${span}`,
                        display: "flex",
                        alignItems: "center",
                        padding: "7px 3px",
                        cursor: "pointer",
                        zIndex: 6,
                        position: "relative",
                      }}
                      onClick={() => openModal(req.no)}
                      title={`${req.brand} · ${req.style || "—"} · ${req.stype} · ${req.estHours || "?"}h`}
                    >
                      <div
                        className={`gantt-bar ${bc}`}
                        style={{ width: "100%", height: 24 }}
                      >
                        <span className="gb-dot" />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {req.brand} · {req.style || "—"} · {req.stype} ·{" "}
                          {req.estHours || "?"}h
                        </span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={ds}
                    style={{
                      background: bg,
                      borderRight: br,
                      minHeight: 44,
                    }}
                  />
                );
              })}
            </div>
          );
        })
      )}

      {todayIdx >= 0 && (
        <div
          className="today-line"
          style={{ left: LW + todayIdx * dw + dw / 2, top: 48 }}
        />
      )}
    </div>
  );

  const renderHourView = () => {
    const totalSlots = days.length * SLOTS_PER_DAY;
    const todaySlotIdx = todayIdx >= 0 ? todayIdx * SLOTS_PER_DAY : -1;

    return (
      <div
        id="schInner"
        style={{ display: "inline-block", minWidth: "100%", position: "relative" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: hourCols,
            position: "sticky",
            top: 0,
            zIndex: 31,
            background: "var(--sf)",
            borderBottom: "1px solid var(--bd)",
          }}
        >
          <div style={{ minWidth: LW, borderRight: "1px solid var(--bdm)" }} />
          {months.map((m) => (
            <div
              key={m.key}
              style={{
                gridColumn: `span ${m.cnt * SLOTS_PER_DAY}`,
                fontSize: 10,
                fontWeight: 700,
                color: "var(--mu)",
                padding: "5px 10px",
                borderRight: "1px solid var(--bdm)",
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: hourCols,
            position: "sticky",
            top: 24,
            zIndex: 30,
            background: "var(--sf)",
            borderBottom: "1px solid var(--bd)",
          }}
        >
          <div
            style={{
              minWidth: LW,
              borderRight: "1px solid var(--bdm)",
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontSize: 9,
              fontWeight: 700,
              color: "var(--hi)",
              textTransform: "uppercase",
              letterSpacing: ".12em",
            }}
          >
            Sampler
          </div>
          {days.map((d, i) => {
            const ds = dayKeys[i];
            const isTd = ds === todayStr;
            const isWe = d.getDay() === 0 || d.getDay() === 6;
            const isHol = isVNHoliday(ds);
            const bg = isTd
              ? "var(--acc)"
              : isHol && !isWe
              ? "rgba(255,160,0,.15)"
              : isWe
              ? "rgba(208,48,48,.1)"
              : "var(--sf)";
            const col = isTd
              ? "var(--bg)"
              : isWe
              ? "#CC2020"
              : isHol
              ? "#B06000"
              : "var(--hi)";
            const lbl = d.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
            });
            return (
              <div
                key={ds}
                style={{
                  gridColumn: `span ${SLOTS_PER_DAY}`,
                  background: bg,
                  color: col,
                  fontSize: 9,
                  fontWeight: 700,
                  textAlign: "center",
                  padding: "4px 2px",
                  borderRight: "1px solid var(--bdm)",
                }}
              >
                {lbl}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: hourCols,
            position: "sticky",
            top: 48,
            zIndex: 29,
            background: "var(--sf)",
            borderBottom: "1px solid var(--bdm)",
          }}
        >
          <div style={{ minWidth: LW, borderRight: "1px solid var(--bdm)" }} />
          {days.flatMap((d, di) =>
            WORK_HOURS_LIST.map((h, hi) => {
              const ds = dayKeys[di];
              const isWe = d.getDay() === 0 || d.getDay() === 6;
              const isTd = ds === todayStr;
              const isLast = hi === SLOTS_PER_DAY - 1;
              const bg = isTd
                ? "rgba(22,80,160,.05)"
                : isWe
                ? "rgba(208,48,48,.04)"
                : "var(--sf)";
              return (
                <div
                  key={`${ds}-${h}`}
                  style={{
                    fontSize: 7.5,
                    fontFamily: "var(--mono)",
                    color: "var(--hi)",
                    background: bg,
                    textAlign: "center",
                    padding: "2px 0",
                    borderRight: isLast
                      ? "1px solid var(--bdm)"
                      : "1px solid rgba(0,0,0,.06)",
                  }}
                >
                  {h}
                </div>
              );
            }),
          )}
        </div>

        {filteredRows.length === 0 ? (
          <div className="sch-empty">
            Approve a request to see it on the schedule.
          </div>
        ) : (
          filteredRows.map((row, rowIdx) => {
            const { s, req, rowStatus } = row;
            const r = computeSlotRange(
              req.reqdate,
              req.reqtime,
              req.estHours,
              dayKeys,
            );
            const bc = barCls(req.stype);

            return (
              <div
                key={`${s.id}-${req.no}-${rowIdx}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: hourCols,
                  borderBottom: "1px solid var(--bd)",
                  minHeight: 48,
                }}
              >
                {renderSamplerLabel(s, req.item, rowStatus, () =>
                  openModal(req.no),
                )}

                {(() => {
                  const cells: React.ReactNode[] = [];
                  let i = 0;
                  while (i < totalSlots) {
                    const di = Math.floor(i / SLOTS_PER_DAY);
                    const hi = i % SLOTS_PER_DAY;
                    const d = days[di];
                    const ds = dayKeys[di];
                    const isTd = ds === todayStr;
                    const isWe = d.getDay() === 0 || d.getDay() === 6;
                    const isHol = isVNHoliday(ds);
                    const isLast = hi === SLOTS_PER_DAY - 1;
                    const bg = isTd
                      ? "rgba(229,32,42,.05)"
                      : isHol
                      ? "rgba(255,165,0,.07)"
                      : isWe
                      ? "rgba(208,48,48,.05)"
                      : "transparent";
                    const br = isLast
                      ? "1px solid var(--bdm)"
                      : "1px solid rgba(0,0,0,.06)";

                    if (r && i === r.startAbs) {
                      cells.push(
                        <div
                          key={`bar-${i}`}
                          style={{
                            background: bg,
                            borderRight: br,
                            gridColumn: `span ${r.spanSlots}`,
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 3px",
                            cursor: "pointer",
                            zIndex: 6,
                            position: "relative",
                          }}
                          onClick={() => openModal(req.no)}
                          title={`${req.brand} · ${req.style || "—"} · ${req.stype} · starts ${req.reqdate} ${req.reqtime} · ${req.estHours}h`}
                        >
                          <div
                            className={`gantt-bar ${bc}`}
                            style={{ width: "100%", height: 26 }}
                          >
                            <span className="gb-dot" />
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {req.brand} · {req.style || "—"} · {req.stype} ·{" "}
                              {req.estHours}h
                            </span>
                          </div>
                        </div>,
                      );
                      i += r.spanSlots;
                    } else {
                      cells.push(
                        <div
                          key={`c-${i}`}
                          style={{
                            background: bg,
                            borderRight: br,
                            minHeight: 48,
                          }}
                        />,
                      );
                      i += 1;
                    }
                  }
                  return cells;
                })()}
              </div>
            );
          })
        )}

        {todaySlotIdx >= 0 && (
          <div
            className="today-line"
            style={{ left: LW + todaySlotIdx * hw + hw / 2, top: 72 }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="sch-toolbar">
        <span className="sflt-lbl">Filter</span>
        <div id="sflt" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {brandFilters.map((b) => (
            <button
              key={b}
              type="button"
              className={`fltbtn${flt === b ? " on" : ""}`}
              data-flt={b}
              onClick={() => setFilter(b)}
            >
              {b === "ALL" ? "All" : b}
            </button>
          ))}
        </div>
        <div className="sleg">
          <div className="leg">
            <span className="legdot" style={{ background: "#1666D4" }} />
            PP
          </div>
          <div className="leg">
            <span className="legdot" style={{ background: "#D4820A" }} />
            Proto
          </div>
          <div className="leg">
            <span className="legdot" style={{ background: "#D42828" }} />
            Test
          </div>
          <div className="leg">
            <span className="legdot" style={{ background: "#1E8A38" }} />
            Approval
          </div>
          <div className="leg">
            <span
              className="legdot"
              style={{ background: "#E09000", borderRadius: "50%" }}
            />
            VN Holiday
          </div>
          <div className="leg">
            <span
              className="legdot"
              style={{ background: "#CC2020", borderRadius: "50%" }}
            />
            Weekend
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: "auto",
          }}
        >
          <span
            id="zoom-indicator"
            style={{
              fontSize: 9,
              color: "var(--hi)",
              fontFamily: "var(--mono)",
              minWidth: 30,
              textAlign: "right",
            }}
          >
            {zoomPct}%
          </span>
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--hi)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <div style={{ width: 1, height: 16, background: "var(--bdm)" }} />
          <div
            style={{
              display: "flex",
              gap: 2,
              background: "var(--sf2)",
              border: "1px solid var(--bdm)",
              borderRadius: 6,
              padding: 2,
            }}
          >
            <button
              type="button"
              id="zoom-hour"
              className={`zoom-btn${schZoom === "hour" ? " on" : ""}`}
              onClick={() => setZoom("hour")}
            >
              Hour
            </button>
            <button
              type="button"
              id="zoom-day"
              className={`zoom-btn${schZoom === "day" ? " on" : ""}`}
              onClick={() => setZoom("day")}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div className="sch-sampler-strip" id="schSamplerStrip">
          <div className="sch-strip-head">Samplers</div>
          {handlers.map((s) => {
            const lane = samplerLanes.find((l) => l.sampler.id === s.id);
            const cnt = lane?.count ?? 0;
            const photo = lane?.photo;
            const sn = s.name.split(" ").slice(-2).join(" ");
            return (
              <div key={s.id} className="sch-strip-row" title={s.name}>
                <div className="sch-strip-avatar">
                  {photo ? (
                    <img
                      src={photo}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    initials(s.name)
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="sch-strip-name">{sn}</div>
                  <div className="sch-strip-sub">{s.eid}</div>
                </div>
                <span className={`sch-strip-count${cnt > 0 ? " active" : ""}`}>
                  {cnt > 0 ? cnt : ""}
                </span>
              </div>
            );
          })}
        </div>

        <div
          ref={outerRef}
          className="sch-outer"
          id="schOuter"
          style={{ flex: 1, overflow: "auto" }}
        >
          {schZoom === "hour" ? renderHourView() : renderDayView()}
        </div>
      </div>
    </>
  );
}

export default Schedule;
