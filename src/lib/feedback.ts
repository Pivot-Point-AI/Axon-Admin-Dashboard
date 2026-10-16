export type FeedbackDetail = {
  kind: "success" | "error";
  message?: string;
  operation?: "POST" | "PUT" | "DELETE";
};

export function notify(detail: FeedbackDetail) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("axon:feedback", { detail }));
  }
}
