const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface RiskSignal {
  code: string;
  points: number;
  reason: string;
}

export interface FairPassAssessment {
  id?: string;
  assessment_id?: string;
  created_at: string;
  event_id: string;
  booking_reference: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | string;
  decision: string;
  signals: RiskSignal[];
}

export interface BookingAssessmentRequest {
  event_id: string;
  booking_reference: string;
  tickets_requested: number;
  event_ticket_limit: number;
  bookings_last_10_minutes: number;
  failed_payment_attempts: number;
  repeated_booking_pattern: boolean;
  verified_account: boolean;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getFairPassAssessments(
  limit = 20,
): Promise<FairPassAssessment[]> {
  return request<FairPassAssessment[]>(
    `/api/fairpass/assessments?limit=${limit}`,
  );
}

export async function assessBooking(
  payload: BookingAssessmentRequest,
): Promise<FairPassAssessment> {
  const response = await fetch(`${API_BASE_URL}/api/fairpass/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Assessment failed (${response.status})`);
  }

  return response.json() as Promise<FairPassAssessment>;
}
