import { showToast } from "./slices/uiSlice";

/**
 * UI notifications for API / DB results.
 * type: "success" | "error" | "info"
 */
export function notify(dispatch, message, type = "success") {
  const text = String(message || "").trim() || "Something went wrong.";
  dispatch(showToast({ message: text, type }));
}

export function notifySuccess(dispatch, message) {
  notify(dispatch, message, "success");
}

export function notifyError(dispatch, message) {
  notify(dispatch, message, "error");
}

export function notifyInfo(dispatch, message) {
  notify(dispatch, message, "info");
}
