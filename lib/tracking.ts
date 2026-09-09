export type TrackingEvent = "landing_view" | "demo_started" | "prediction_viewed" | "cart_viewed" | "purchase_approved" | "automation_screen_viewed" | "recommendation_selected" | "cart_preparation_selected" | "auto_purchase_selected" | "email_submitted";

type Properties = Record<string, string | number | boolean | undefined>;

/** Centralized MVP tracking; replace this function later to connect an analytics provider. */
export function track(event: TrackingEvent, properties: Properties = {}) {
  console.log("[AutoStore tracking]", { event, timestamp: new Date().toISOString(), ...properties });
}
