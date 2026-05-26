/**
 * React-compatible app logic (replaces DOM / innerHTML scripting).
 * Wrap your app in <AppProvider> and use useApp() in components.
 */
export {
  AppProvider,
  useApp,
  getAppBridge,
  SAMPLERS,
  SAMPLER_PHOTOS,
  GAS_URL,
  WORK_HOURS,
  LW,
} from "./src/script";

export type {
  ViewId,
  SchZoom,
  RequestItem,
  NewRequestForm,
  EditForm,
  ToastState,
  Sampler,
  Assignment,
  AssignmentStatus,
  RequestStatus,
} from "./src/script/types";

export {
  escapeHtml,
  formatDate,
  initials,
  typeClass,
  solidTag,
  barCls,
  stripeClr,
  cardClass,
  isVNHoliday,
  buildDayRange,
  getStatus,
  isAccepted,
  isFinished,
  isApproved,
  getAssignedSamplers,
  getFinishedCount,
  statusLabel,
  statusColor,
} from "./src/script/utils";

import { getAppBridge } from "./src/script";
import type { ViewId } from "./src/script/types";

/** @deprecated Prefer useApp().nudge — kept for Header.tsx during migration */
export function nudge(days: number): void {
  getAppBridge()?.nudge(days);
}

/** @deprecated Prefer useApp().goToday */
export function goToday(): void {
  getAppBridge()?.goToday();
}

/** @deprecated Prefer useApp().setView */
export function sw(name: ViewId, _btn?: HTMLElement | EventTarget | null): void {
  getAppBridge()?.setView(name);
}

/** Request tab — switches to the request view */
export function handleClick(): void {
  getAppBridge()?.setView("f");
      }