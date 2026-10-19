from pydantic import BaseModel, Field
import json
import sqlite3
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter
from pathlib import Path

router = APIRouter(prefix="/fairpass", tags=["FairPass AI"])

DB_PATH = Path(__file__).resolve().parents[4] / "fairpass.db"

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                event_id TEXT NOT NULL,
                booking_reference TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                risk_level TEXT NOT NULL,
                signals TEXT NOT NULL,
                decision TEXT NOT NULL
            )
        """)

init_db()


class BookingAssessment(BaseModel):
    event_id: str = Field(min_length=1, max_length=100)
    booking_reference: str = Field(min_length=1, max_length=100)
    tickets_requested: int = Field(ge=1, le=20)
    event_ticket_limit: int = Field(default=6, ge=1, le=20)
    bookings_last_10_minutes: int = Field(default=0, ge=0, le=100)
    failed_payment_attempts: int = Field(default=0, ge=0, le=100)
    repeated_booking_pattern: bool = False
    verified_account: bool = True


@router.post("/assess")
def assess_booking(booking: BookingAssessment):
    score = 0
    signals = []

    if booking.tickets_requested > booking.event_ticket_limit:
        score += 45
        signals.append({
            "code": "TICKET_LIMIT_EXCEEDED",
            "points": 45,
            "reason": "Requested quantity exceeds the configured event limit."
        })

    if booking.bookings_last_10_minutes >= 5:
        score += 25
        signals.append({
            "code": "HIGH_BOOKING_VELOCITY",
            "points": 25,
            "reason": "Multiple bookings occurred within a short time window."
        })
    elif booking.bookings_last_10_minutes >= 3:
        score += 12
        signals.append({
            "code": "ELEVATED_BOOKING_VELOCITY",
            "points": 12,
            "reason": "Booking frequency is elevated and needs contextual review."
        })

    if booking.failed_payment_attempts >= 5:
        score += 15
        signals.append({
            "code": "REPEATED_PAYMENT_FAILURES",
            "points": 15,
            "reason": "Repeated failed payments may warrant further checks."
        })

    if booking.repeated_booking_pattern:
        score += 25
        signals.append({
            "code": "REPEATED_PATTERN",
            "points": 25,
            "reason": "A configured repeated-booking pattern was detected."
        })

    if not booking.verified_account:
        score += 10
        signals.append({
            "code": "ACCOUNT_UNVERIFIED",
            "points": 10,
            "reason": "Account verification is incomplete."
        })

    score = min(score, 100)

    if score >= 60:
        risk_level = "high"
        decision = "manual_review"
    elif score >= 30:
        risk_level = "medium"
        decision = "additional_verification"
    else:
        risk_level = "low"
        decision = "allow"

    assessment_id = str(uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    result = {
        "assessment_id": assessment_id,
        "created_at": created_at,
        "event_id": booking.event_id,
        "booking_reference": booking.booking_reference,
        "risk_score": score,
        "risk_level": risk_level,
        "decision": decision,
        "signals": signals,
        "automatic_block": False,
        "disclaimer": (
            "Prototype rules only. Scores are not validated predictions. "
            "High-risk results require human review; genuine users must have "
            "a verification and appeal path."
        ),
    }

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """INSERT INTO assessments
            (id, created_at, event_id, booking_reference,
             risk_score, risk_level, signals, decision)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                assessment_id, created_at, booking.event_id,
                booking.booking_reference, score, risk_level,
                json.dumps(signals), decision,
            ),
        )

    return result


@router.get("/assessments")
def list_assessments(limit: int = 20):
    limit = max(1, min(limit, 100))
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            """SELECT id, created_at, event_id, booking_reference,
                      risk_score, risk_level, signals, decision
               FROM assessments ORDER BY created_at DESC LIMIT ?""",
            (limit,),
        ).fetchall()

    return [
        {**dict(row), "signals": json.loads(row["signals"])}
        for row in rows
    ]
