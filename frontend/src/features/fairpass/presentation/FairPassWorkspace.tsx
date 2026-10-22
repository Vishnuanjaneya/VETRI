import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  CircleCheck,
  Plus,
  X,
  Eye,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  assessBooking,
  getFairPassAssessments,
  type FairPassAssessment,
  type BookingAssessmentRequest,
} from "../../../services/fairpass";

const GOLD = "#E8B85B";
const GREEN = "#55D6A0";
const RED = "#F87171";
const BLUE = "#8BA8FF";

const panelStyle: React.CSSProperties = {
  background: "var(--panel, #11141b)",
  border: "1px solid var(--border, #272b35)",
  borderRadius: 16,
  padding: 20,
  minWidth: 0,
};

const mutedStyle: React.CSSProperties = {
  color: "var(--muted, #9298a7)",
  fontSize: 12,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  background: "var(--surface, #0c0f15)",
  border: "1px solid var(--border, #303541)",
  color: "var(--text, #f3f4f6)",
  borderRadius: 9,
  padding: "11px 12px",
  fontSize: 13,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 9,
  border: "1px solid var(--border, #303541)",
  padding: "10px 14px",
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
};

const initialForm: BookingAssessmentRequest = {
  event_id: "",
  booking_reference: "",
  tickets_requested: 2,
  event_ticket_limit: 6,
  bookings_last_10_minutes: 0,
  failed_payment_attempts: 0,
  repeated_booking_pattern: false,
  verified_account: true,
};

const entrance = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

function getRiskColor(level: string) {
  switch (level.toLowerCase()) {
    case "high":
      return RED;
    case "medium":
      return GOLD;
    case "low":
      return GREEN;
    default:
      return "#9CA3AF";
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function MetricValue({ value }: { value: number | string }) {
  const reducedMotion = useReducedMotion();

  if (typeof value !== "number" || reducedMotion) {
    return <>{value}</>;
  }

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {value}
    </motion.span>
  );
}

function RiskDonut({
  distribution,
  total,
  lang,
}: {
  distribution: { label: string; count: number; color: string }[];
  total: number;
  lang: "en" | "ta";
}) {
  const reducedMotion = useReducedMotion();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "4px 0 14px",
      }}
    >
      <div style={{ position: "relative", width: 164, height: 164 }}>
        <svg
          viewBox="0 0 140 140"
          width="100%"
          height="100%"
          role="img"
          aria-label={`Risk distribution across ${total} assessments`}
          style={{ overflow: "visible", transform: "rotate(-90deg)" }}
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--border, #292e38)"
            strokeWidth="13"
          />
          {distribution.map((item) => {
            const length = total ? (item.count / total) * circumference : 0;
            const currentOffset = offset;
            offset += length;

            if (!item.count) return null;

            return (
              <motion.circle
                key={item.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="13"
                strokeLinecap="butt"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-currentOffset}
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            );
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            pointerEvents: "none",
          }}
        >
          <strong style={{ fontSize: 31, letterSpacing: -1 }}>
            {total}
          </strong>
          <span style={{ ...mutedStyle, fontSize: 10 }}>{lang === "ta" ? "மதிப்பீடுகள்" : "ASSESSMENTS"}</span>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({
  record,
  onClose,
}: {
  record: FairPassAssessment;
  onClose: () => void;
}) {
  const color = getRiskColor(record.risk_level);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "#0009",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="fp-detail-title"
        initial={{ x: 420, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 420, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        style={{
          width: "min(460px, 100%)",
          height: "100%",
          overflowY: "auto",
          background: "var(--panel, #11141b)",
          borderLeft: "1px solid var(--border, #303541)",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <span className="section-kicker">ASSESSMENT DETAILS</span>
            <h2 id="fp-detail-title" style={{ margin: "8px 0" }}>
              Risk intelligence
            </h2>
          </div>
          <button
            aria-label="Close details"
            onClick={onClose}
            style={{ ...buttonStyle, padding: 9, height: 36 }}
          >
            <X size={17} />
          </button>
        </div>

        <div
          style={{
            ...panelStyle,
            marginTop: 24,
            background: `linear-gradient(145deg, ${color}12, var(--surface, #0c0f15))`,
            borderColor: `${color}55`,
          }}
        >
          <span style={mutedStyle}>RISK SCORE</span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <strong style={{ fontSize: 54, letterSpacing: -2 }}>{record.risk_score}</strong>
            <span style={mutedStyle}>/100</span>
          </div>
          <span
            style={{
              display: "inline-block",
              border: `1px solid ${color}60`,
              background: `${color}18`,
              color,
              borderRadius: 99,
              padding: "6px 11px",
              fontSize: 11,
              fontWeight: 750,
            }}
          >
            {record.risk_level.toUpperCase()} RISK
          </span>
        </div>

        <div style={{ display: "grid", gap: 15, marginTop: 22 }}>
          {[
            ["Booking reference", record.booking_reference],
            ["Event ID", record.event_id],
            ["Decision", record.decision.replaceAll("_", " ")],
            ["Created at", formatDate(record.created_at)],
            ["Assessment ID", record.assessment_id ?? record.id ?? "Not provided"],
          ].map(([label, value]) => (
            <div key={label} style={{ borderBottom: "1px solid var(--border, #292e38)", paddingBottom: 12 }}>
              <div style={{ ...mutedStyle, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 13, overflowWrap: "anywhere" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 26 }}>
          <h3 style={{ fontSize: 15 }}>Risk signals</h3>
          {record.signals.length === 0 ? (
            <div style={{ ...panelStyle, marginTop: 12 }}>
              <CircleCheck color={GREEN} size={18} />
              <p style={{ ...mutedStyle, lineHeight: 1.7 }}>
                No risk signals were triggered by the current rules.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
              {record.signals.map((signal, index) => (
                <motion.div
                  key={`${signal.code}-${index}`}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  style={{
                    ...panelStyle,
                    padding: 14,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle color={GOLD} size={18} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 12 }}>{signal.code.replaceAll("_", " ")}</strong>
                    <p style={{ ...mutedStyle, lineHeight: 1.7, marginBottom: 0 }}>
                      {signal.reason}
                    </p>
                  </div>
                  <strong style={{ color: GOLD, whiteSpace: "nowrap" }}>
                    +{signal.points}
                  </strong>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <p style={{ ...mutedStyle, lineHeight: 1.8, marginTop: 24 }}>
          Prototype rules only; scores are not validated predictions. High-risk
          results require human review. No automatic blocking is performed.
        </p>
      </motion.aside>
    </motion.div>
  );
}

const fairPassCopy = {
  en: {
    kicker: "TICKET INTEGRITY · ANALYTICS",
    title: "FairPass AI · Risk Intelligence",
    subtitle: "Booking integrity, risk analytics and review operations.",
    newAssessment: "New assessment",
    riskAnalytics: "RISK ANALYTICS",
    bookingRiskScores: "Booking risk scores",
    riskScoreDescription: "Risk score by assessment · out of 100",
    riskBreakdown: "RISK BREAKDOWN",
    assessmentDistribution: "Assessment distribution",
    distributionDescription: "Actual records grouped by risk level",
    modalTitle: "New assessment",
    modalDescription: "{copy.modalDescription}",
    eventId: "Event ID",
    bookingReference: "Booking reference",
    ticketsRequested: "Tickets requested",
    eventTicketLimit: "Event ticket limit",
    bookingsLastTenMinutes: "Bookings in last 10 min",
    failedPaymentAttempts: "Failed payment attempts",
    repeatedBookingPattern: "Repeated booking pattern",
    repeatedBookingDescription: "{copy.repeatedBookingDescription}",
    accountVerified: "Account verified",
    accountVerifiedDescription: "{copy.accountVerifiedDescription}",
    prototypeNotice: "{copy.prototypeNotice}",
    cancel: "Cancel",
    assessBooking: "Assess booking",

    humanReview: "Human review enabled",
    humanReviewDescription: "{copy.humanReviewDescription}",
    liveApiData: "LIVE API DATA",
    historyTitle: "Assessment history",
    historyDescription: "Search and filter booking risk assessments.",
    searchLabel: "Search assessments",
    searchPlaceholder: "Search booking or event ID...",
    filterLabel: "Filter by risk level",
    allRiskLevels: "All risk levels",
    highOption: "High risk",
    mediumOption: "Medium risk",
    lowOption: "Low risk",
    loadingAssessments: "Loading assessments...",
    historyUnavailable: "Assessment history is unavailable.",
    noMatches: "No assessments match your search or filter.",
    event: "Event",
    riskScore: "Risk score",
    riskLevel: "Risk level",
    decision: "Decision",
    signals: "Signals",
    created: "Created",
    showingUpTo: "Showing up to 8 records. Select a booking for details.",
    apiBackedData: "API-backed data",
    bookingRef: "Booking reference",
    bookingsLastTen: "Bookings in last 10 min",
    failedPayments: "Failed payment attempts",
    repeatPattern: "Repeated booking pattern",
    repeatPatternDescription: "A configured repeat pattern was observed.",
    assessmentDisclaimer: "This assessment uses prototype rules, not a validated prediction model. High-risk results require human review.",
    refreshing: "Refreshing...",
    refresh: "Refresh",
    apiAttention: "API connection needs attention",
    operations: "FairPass risk operations",
    records: "returned records",
    prototype: "Rules-based prototype",
    total: "Total assessments",
    totalDetail: "Records returned by API",
    high: "High-risk assessments",
    highDetail: "Require careful review",
    manual: "Manual review queue",
    manualDetail: "Awaiting human assessment",
    average: "Average risk score",
    averageDetail: "Across returned records",
    lowRisk: "Low risk",
    mediumRisk: "Medium risk",
    highRisk: "High risk",
    loadError: "Unable to load assessments. Check that the backend is running.",
    success: "Assessment completed successfully.",
    failed: "Assessment failed. Check the backend and try again.",
    eventIdPlaceholder: "e.g. CHENNAI-CONCERT-01",
    bookingReferencePlaceholder: "e.g. BOOK-2026-1003",
    assessing: "Assessing...",
    riskOperations: "RISK OPERATIONS",
    fairPassTitle: "FairPass AI · Risk Intelligence",
  },
  ta: {
    kicker: "டிக்கெட் நேர்மை · பகுப்பாய்வு",
    title: "டிக்கெட் நேர்மை · அபாய நுண்ணறிவு",
    subtitle: "முன்பதிவு நேர்மை, அபாயப் பகுப்பாய்வு மற்றும் மதிப்பாய்வு செயல்பாடுகள்.",
    newAssessment: "புதிய மதிப்பீடு",
    riskAnalytics: "அபாயப் பகுப்பாய்வு",
    bookingRiskScores: "முன்பதிவு அபாய மதிப்பெண்கள்",
    riskScoreDescription: "ஒவ்வொரு மதிப்பீட்டின் அபாய மதிப்பெண் · 100-க்கு",
    riskBreakdown: "அபாய வகைப்பாடு",
    assessmentDistribution: "மதிப்பீடுகளின் பகிர்வு",
    distributionDescription: "அபாய நிலையின் அடிப்படையில் வகைப்படுத்தப்பட்ட பதிவுகள்",
    modalTitle: "புதிய மதிப்பீடு",
    modalDescription: "கட்டமைக்கப்பட்ட முன்மாதிரி விதிகளின் அடிப்படையில் அபாயத்தை மதிப்பிட முன்பதிவு விவரங்களை உள்ளிடவும்.",
    eventId: "நிகழ்வு ID",
    bookingReference: "முன்பதிவு குறிப்பு",
    ticketsRequested: "கோரப்பட்ட டிக்கெட்டுகள்",
    eventTicketLimit: "நிகழ்வின் டிக்கெட் வரம்பு",
    bookingsLastTenMinutes: "கடந்த 10 நிமிட முன்பதிவுகள்",
    failedPaymentAttempts: "தோல்வியடைந்த கட்டண முயற்சிகள்",
    repeatedBookingPattern: "மீண்டும் மீண்டும் முன்பதிவு செய்யும் முறை",
    repeatedBookingDescription: "மீண்டும் நிகழும் முன்பதிவு முறை கண்டறியப்பட்டது.",
    accountVerified: "கணக்கு சரிபார்க்கப்பட்டது",
    accountVerifiedDescription: "கணக்கு சரிபார்ப்பு முழுமையடையவில்லை என்றால் தேர்வை நீக்கவும்.",
    prototypeNotice: "இந்த மதிப்பீடு முன்மாதிரி விதிகளைப் பயன்படுத்துகிறது; சரிபார்க்கப்பட்ட கணிப்புக் கருவி அல்ல. அதிக அபாய முடிவுகளுக்கு மனித மதிப்பாய்வு தேவை.",
    cancel: "ரத்துசெய்",
    assessBooking: "முன்பதிவை மதிப்பிடு",

    humanReview: "மனித மதிப்பாய்வு செயல்பாட்டில் உள்ளது",
    humanReviewDescription: "அதிக அபாய மதிப்பீடுகள் மதிப்பாய்வுக்குக் குறிக்கப்படும். பயனர்கள் தானாகத் தடுக்கப்பட மாட்டார்கள்.",
    liveApiData: "நேரடி API தரவு",
    historyTitle: "மதிப்பீட்டு வரலாறு",
    historyDescription: "முன்பதிவு அபாய மதிப்பீடுகளைத் தேடவும் வடிகட்டவும்.",
    searchLabel: "மதிப்பீடுகளைத் தேடவும்",
    searchPlaceholder: "முன்பதிவு அல்லது நிகழ்வு ID-ஐத் தேடவும்...",
    filterLabel: "அபாய நிலைப்படி வடிகட்டவும்",
    allRiskLevels: "அனைத்து அபாய நிலைகளும்",
    highOption: "அதிக அபாயம்",
    mediumOption: "நடுத்தர அபாயம்",
    lowOption: "குறைந்த அபாயம்",
    loadingAssessments: "மதிப்பீடுகள் ஏற்றப்படுகின்றன...",
    historyUnavailable: "மதிப்பீட்டு வரலாற்றைப் பெற முடியவில்லை.",
    noMatches: "உங்கள் தேடல் அல்லது வடிகட்டலுக்கு பொருத்தமான மதிப்பீடுகள் இல்லை.",
    event: "நிகழ்வு",
    riskScore: "அபாய மதிப்பெண்",
    riskLevel: "அபாய நிலை",
    decision: "முடிவு",
    signals: "குறிகாட்டிகள்",
    created: "உருவாக்கப்பட்டது",
    showingUpTo: "அதிகபட்சம் 8 பதிவுகள். விவரங்களைக் காண முன்பதிவைத் தேர்ந்தெடுக்கவும்.",
    apiBackedData: "API தரவு",
    bookingRef: "முன்பதிவு குறிப்பு",
    bookingsLastTen: "கடந்த 10 நிமிட முன்பதிவுகள்",
    failedPayments: "தோல்வியடைந்த கட்டண முயற்சிகள்",
    repeatPattern: "மீண்டும் நிகழும் முன்பதிவு முறை",
    repeatPatternDescription: "அமைக்கப்பட்ட மீண்டும் நிகழும் முறை கண்டறியப்பட்டது.",
    assessmentDisclaimer: "இந்த மதிப்பீடு முன்மாதிரி விதிகளைப் பயன்படுத்துகிறது; இது சரிபார்க்கப்பட்ட கணிப்பு மாதிரி அல்ல. அதிக அபாய முடிவுகளுக்கு மனித மதிப்பாய்வு தேவை.",
    refreshing: "புதுப்பிக்கிறது...",
    refresh: "புதுப்பிக்கவும்",
    apiAttention: "API இணைப்பைச் சரிபார்க்கவும்",
    operations: "FairPass அபாயச் செயல்பாடுகள்",
    records: "பதிவுகள் பெறப்பட்டன",
    prototype: "விதிமுறை அடிப்படையிலான முன்மாதிரி",
    total: "மொத்த மதிப்பீடுகள்",
    totalDetail: "API மூலம் பெறப்பட்ட பதிவுகள்",
    high: "அதிக அபாய மதிப்பீடுகள்",
    highDetail: "கவனமாக மதிப்பாய்வு செய்ய வேண்டும்",
    manual: "கைமுறை மதிப்பாய்வுப் பட்டியல்",
    manualDetail: "மனித மதிப்பாய்வுக்காகக் காத்திருக்கிறது",
    average: "சராசரி அபாய மதிப்பெண்",
    averageDetail: "பெறப்பட்ட பதிவுகளின் அடிப்படையில்",
    lowRisk: "குறைந்த அபாயம்",
    mediumRisk: "நடுத்தர அபாயம்",
    highRisk: "அதிக அபாயம்",
    loadError: "மதிப்பீடுகளை ஏற்ற முடியவில்லை. Backend இயங்குகிறதா எனச் சரிபார்க்கவும்.",
    success: "மதிப்பீடு வெற்றிகரமாக முடிந்தது.",
    failed: "மதிப்பீடு தோல்வியடைந்தது. Backend-ஐச் சரிபார்த்து மீண்டும் முயற்சிக்கவும்.",
    eventIdPlaceholder: "எ.கா. CHENNAI-CONCERT-01",
    bookingReferencePlaceholder: "எ.கா. BOOK-2026-1003",
    assessing: "மதிப்பிடுகிறது...",
    riskOperations: "அபாயச் செயல்பாடுகள்",
    fairPassTitle: "டிக்கெட் நேர்மை · அபாய நுண்ணறிவு",
  },
} as const;

type FairPassLanguage = keyof typeof fairPassCopy;

export function FairPassWorkspace({ lang = "en" }: { lang?: FairPassLanguage }) {
  const copy = fairPassCopy[lang];

  const reducedMotion = useReducedMotion();

  const [records, setRecords] = useState<FairPassAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<FairPassAssessment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState<BookingAssessmentRequest>(initialForm);

  const loadRecords = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError("");

    try {
      const result = await getFairPassAssessments(100);
      setRecords(result);
    } catch {
      setError(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const highRisk = records.filter(
    (r) => r.risk_level.toLowerCase() === "high",
  ).length;

  const reviewQueue = records.filter(
    (r) => r.decision === "manual_review",
  ).length;

  const averageRisk = records.length
    ? Math.round(records.reduce((sum, r) => sum + r.risk_score, 0) / records.length)
    : 0;

  const distribution = useMemo(
    () => [
      {
        label: copy.lowRisk,
        count: records.filter((r) => r.risk_level.toLowerCase() === "low").length,
        color: GREEN,
      },
      {
        label: copy.mediumRisk,
        count: records.filter((r) => r.risk_level.toLowerCase() === "medium").length,
        color: GOLD,
      },
      {
        label: copy.highRisk,
        count: records.filter((r) => r.risk_level.toLowerCase() === "high").length,
        color: RED,
      },
    ],
    [records],
  );

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((r) => {
      const matchesSearch = [
        r.booking_reference,
        r.event_id,
        r.risk_level,
        r.decision,
      ].some((value) => String(value).toLowerCase().includes(query));

      return matchesSearch &&
        (riskFilter === "all" || r.risk_level.toLowerCase() === riskFilter);
    });
  }, [records, search, riskFilter]);

  const metrics = [
    {
      label: copy.total,
      value: records.length,
      detail: copy.totalDetail,
      icon: Activity,
      color: BLUE,
    },
    {
      label: copy.high,
      value: highRisk,
      detail: copy.highDetail,
      icon: AlertTriangle,
      color: RED,
    },
    {
      label: copy.manual,
      value: reviewQueue,
      detail: copy.manualDetail,
      icon: ShieldCheck,
      color: GOLD,
    },
    {
      label: copy.average,
      value: `${averageRisk}/100`,
      detail: copy.averageDetail,
      icon: TrendingUp,
      color: GREEN,
    },
  ];

  const updateForm = <K extends keyof BookingAssessmentRequest>(
    key: K,
    value: BookingAssessmentRequest[K],
  ) => setForm((previous) => ({ ...previous, [key]: value }));

  const submitAssessment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setToast("");
    setSubmitting(true);

    try {
      const result = await assessBooking(form);

      const normalized: FairPassAssessment = {
        ...result,
        id: result.id ?? result.assessment_id,
        signals: result.signals ?? [],
      };

      setRecords((previous) => [
        normalized,
        ...previous.filter((r) =>
          (r.id ?? r.assessment_id) !== (normalized.id ?? normalized.assessment_id),
        ),
      ]);
      setForm(initialForm);
      setFormOpen(false);
      setSelected(normalized);
      setToast(copy.success);
      void loadRecords(true);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : copy.failed,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    ...fieldStyle,
    minWidth: 0,
  };

  return (
    <motion.section
      aria-labelledby="fairpass-title"
      initial={reducedMotion ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.065,
          },
        },
      }}
      style={{ display: "grid", gap: 20, minWidth: 0 }}
    >
      {/* Header */}
      <motion.header
        variants={entrance}
        transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="section-kicker">{copy.kicker}</span>
          <h2 id="fairpass-title" style={{ margin: "7px 0", letterSpacing: "-0.7px" }}>
            {copy.title}
          </h2>
          <p style={{ ...mutedStyle, margin: 0, lineHeight: 1.8 }}>
            {copy.subtitle}
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <motion.button
            whileHover={reducedMotion ? undefined : { y: -2, scale: 1.015 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            onClick={() => {
              setFormError("");
              setFormOpen(true);
            }}
            style={{
              ...buttonStyle,
              color: "#17130b",
              background: `linear-gradient(135deg, #F4D78D, ${GOLD})`,
              borderColor: GOLD,
            }}
          >
            <Plus size={16} /> {copy.newAssessment}
          </motion.button>

          <motion.button
            whileHover={reducedMotion ? undefined : { y: -2 }}
            whileTap={reducedMotion ? undefined : { scale: 0.97 }}
            className="text-button"
            onClick={() => void loadRecords()}
            disabled={loading}
            style={{ ...buttonStyle, background: "var(--panel, #11141b)" }}
          >
            <RefreshCw
              size={15}
              style={{
                animation: loading && !reducedMotion ? "fp-spin 1s linear infinite" : "none",
              }}
            />
            {loading ? copy.refreshing : copy.refresh}
          </motion.button>
        </div>
      </motion.header>

      {/* Live status */}
      <motion.div
        variants={entrance}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          flexWrap: "wrap",
          ...mutedStyle,
        }}
      >
        <motion.span
          animate={reducedMotion ? undefined : { opacity: [1, 0.5, 1] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          style={{
            width: 7,
            height: 7,
            borderRadius: 99,
            background: error ? RED : GREEN,
            display: "inline-block",
          }}
        />
        {error ? copy.apiAttention : copy.operations}
        <span style={{ opacity: 0.5 }}>•</span>
        {records.length} returned records
        <span style={{ opacity: 0.5 }}>•</span>
        <span>Rules-based prototype</span>
      </motion.div>

      {/* KPI cards */}
      <motion.div
        variants={entrance}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 205px), 1fr))",
          gap: 14,
        }}
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;

          return (
            <motion.article
              key={metric.label}
              whileHover={reducedMotion ? undefined : { y: -5, scale: 1.012 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              style={{
                ...panelStyle,
                padding: 19,
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(145deg, var(--panel, #11141b), var(--surface, #0d1016))",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 95,
                  height: 95,
                  borderRadius: 99,
                  right: -42,
                  top: -45,
                  background: metric.color,
                  opacity: 0.08,
                  filter: "blur(3px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  ...mutedStyle,
                }}
              >
                <span>{metric.label}</span>
                <motion.span
                  initial={reducedMotion ? false : { scale: 0.65, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.08 + 0.15, type: "spring" }}
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                    background: `${metric.color}15`,
                  }}
                >
                  <Icon size={18} color={metric.color} />
                </motion.span>
              </div>

              <div
                style={{
                  fontSize: 32,
                  fontWeight: 750,
                  letterSpacing: "-1px",
                  margin: "16px 0 8px",
                  color: "var(--text, #f3f4f6)",
                }}
              >
                {loading ? (
                  <motion.div
                    aria-label="Loading metric"
                    style={{
                      width: 66,
                      height: 30,
                      borderRadius: 7,
                      background: "var(--border, #292e38)",
                    }}
                    animate={reducedMotion ? undefined : { opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.3, repeat: Infinity }}
                  />
                ) : (
                  <MetricValue value={metric.value} />
                )}
              </div>
              <div style={{ ...mutedStyle, fontSize: 11 }}>{metric.detail}</div>
            </motion.article>
          );
        })}
      </motion.div>

      {error && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          style={{ ...panelStyle, borderColor: "#7F3434", color: "#FCA5A5" }}
        >
          <p>{error}</p>
          <button className="secondary-button" onClick={() => void loadRecords()}>
            Try again
          </button>
        </motion.div>
      )}

      {/* Analytics */}
      <motion.div
        variants={entrance}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 16,
        }}
      >
        <motion.section
          whileHover={reducedMotion ? undefined : { borderColor: "#414754" }}
          style={panelStyle}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 22,
            }}
          >
            <div>
              <span className="section-kicker">{copy.riskAnalytics}</span>
              <h3 style={{ margin: "7px 0" }}>{copy.bookingRiskScores}</h3>
              <p style={{ ...mutedStyle, margin: 0 }}>{copy.riskScoreDescription}</p>
            </div>
            <Activity size={20} color={GOLD} />
          </div>

          {loading ? (
            <p style={mutedStyle}>Loading chart data...</p>
          ) : records.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <Activity size={26} color={GOLD} />
              <p style={mutedStyle}>Run your first assessment to populate the chart.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 19 }}>
              {records.slice(0, 8).map((record, index) => {
                const color = getRiskColor(record.risk_level);

                return (
                  <motion.button
                    type="button"
                    key={record.id ?? record.assessment_id ?? record.booking_reference}
                    onClick={() => setSelected(record)}
                    initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.045 }}
                    whileHover={reducedMotion ? undefined : { x: 3 }}
                    style={{
                      display: "grid",
                      gap: 8,
                      border: 0,
                      padding: 0,
                      background: "transparent",
                      color: "inherit",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        fontSize: 12,
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {record.booking_reference}
                      </span>
                      <strong style={{ color, flexShrink: 0 }}>{record.risk_score}/100</strong>
                    </div>

                    <div
                      role="img"
                      aria-label={`${record.booking_reference}: risk score ${record.risk_score} out of 100`}
                      style={{
                        height: 9,
                        borderRadius: 99,
                        background: "var(--border, #292e38)",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={reducedMotion ? false : { width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, record.risk_score))}%` }}
                        transition={{ duration: 0.85, delay: index * 0.05, ease: "easeOut" }}
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          background: `linear-gradient(90deg, ${color}aa, ${color})`,
                          boxShadow: `0 0 12px ${color}30`,
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          <p style={{ ...mutedStyle, margin: "22px 0 0", fontSize: 11 }}>
            Showing up to 8 records. Select a booking for details.
          </p>
        </motion.section>

        <motion.section
          whileHover={reducedMotion ? undefined : { borderColor: "#414754" }}
          style={panelStyle}
        >
          <div style={{ marginBottom: 10 }}>
            <span className="section-kicker">{copy.riskBreakdown}</span>
            <h3 style={{ margin: "7px 0" }}>{copy.assessmentDistribution}</h3>
            <p style={{ ...mutedStyle, margin: 0 }}>{copy.distributionDescription}</p>
          </div>

          {loading ? (
            <p style={mutedStyle}>Loading distribution...</p>
          ) : records.length === 0 ? (
            <p style={{ ...mutedStyle, padding: "20px 0" }}>No assessment data available.</p>
          ) : (
            <>
              <RiskDonut distribution={distribution} total={records.length} lang={lang} />
              <div style={{ display: "grid", gap: 16 }}>
                {distribution.map((item, index) => (
                  <motion.div
                    key={item.label === "Low risk" ? copy.lowRisk : item.label === "Medium risk" ? copy.mediumRisk : item.label === "High risk" ? copy.highRisk : item.label}
                    initial={reducedMotion ? false : { opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                      {item.label === "Low risk" ? copy.lowRisk : item.label === "Medium risk" ? copy.mediumRisk : item.label === "High risk" ? copy.highRisk : item.label}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <strong>{item.count}</strong>
                      <span style={{ ...mutedStyle, width: 42, textAlign: "right" }}>
                        {Math.round((item.count / records.length) * 100)}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          <div
            style={{
              marginTop: 24,
              padding: 13,
              borderRadius: 10,
              background: "var(--surface, #0c0f15)",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <ShieldCheck size={18} color={GOLD} />
            <div>
              <strong style={{ fontSize: 12 }}>{copy.humanReview}</strong>
              <p style={{ ...mutedStyle, margin: "5px 0 0", lineHeight: 1.7 }}>
                {copy.humanReviewDescription}
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>

      {/* Assessment history */}
      <motion.section variants={entrance} style={{ ...panelStyle, padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: 20,
            borderBottom: "1px solid var(--border, #292e38)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <span className="section-kicker">{copy.liveApiData}</span>
            <h3 style={{ margin: "7px 0" }}>{copy.historyTitle}</h3>
            <p style={{ ...mutedStyle, margin: 0 }}>{copy.historyDescription}</p>
          </div>
          <Clock3 size={20} color={GOLD} />
        </div>

        <div style={{ padding: "14px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 12, top: 12, color: "var(--muted, #9298a7)" }}
            />
            <input
              aria-label={copy.searchLabel}
              placeholder={copy.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...fieldStyle, paddingLeft: 35 }}
            />
          </div>

          <select
            aria-label={copy.filterLabel}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ ...fieldStyle, width: "auto", minWidth: 150 }}
          >
            <option value="all">{copy.allRiskLevels}</option>
            <option value="high">{copy.highOption}</option>
            <option value="medium">{copy.mediumOption}</option>
            <option value="low">{copy.lowOption}</option>
          </select>
        </div>

        {loading ? (
          <div role="status" style={{ padding: 20, display: "grid", gap: 12 }}>
            {[0, 1, 2].map((item) => (
              <motion.div
                key={item}
                style={{ height: 34, borderRadius: 7, background: "var(--border, #292e38)" }}
                animate={reducedMotion ? undefined : { opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: item * 0.12 }}
              />
            ))}
            <span style={mutedStyle}>{copy.loadingAssessments}</span>
          </div>
        ) : error ? (
          <p style={{ padding: 20, ...mutedStyle }}>{copy.historyUnavailable}</p>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center" }}>
            <Search size={24} color={GOLD} />
            <p style={mutedStyle}>{copy.noMatches}</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
              <thead>
                <tr style={{ color: "var(--muted, #9298a7)" }}>
                  {[copy.bookingReference, copy.event, copy.riskScore, copy.riskLevel, copy.decision, copy.signals, copy.created, ""].map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      style={{
                        padding: "13px 16px",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                        borderBottom: "1px solid var(--border, #292e38)",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const color = getRiskColor(record.risk_level);

                  return (
                    <motion.tr
                      key={record.id ?? record.assessment_id ?? record.booking_reference}
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={reducedMotion ? undefined : { backgroundColor: "var(--surface, #0c0f15)" }}
                      onClick={() => setSelected(record)}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") setSelected(record);
                      }}
                      aria-label={`View assessment ${record.booking_reference}`}
                      style={{
                        borderBottom: "1px solid var(--border, #20242d)",
                        cursor: "pointer",
                        outlineOffset: -2,
                      }}
                    >
                      <td style={{ padding: 16, fontWeight: 650, whiteSpace: "nowrap" }}>
                        {record.booking_reference}
                      </td>
                      <td style={{ padding: 16, whiteSpace: "nowrap", color: "var(--muted, #9298a7)" }}>
                        {record.event_id}
                      </td>
                      <td style={{ padding: 16, whiteSpace: "nowrap" }}>
                        <strong>{record.risk_score}</strong>
                        <span style={mutedStyle}> /100</span>
                      </td>
                      <td style={{ padding: 16, whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            color,
                            background: `${color}18`,
                            border: `1px solid ${color}45`,
                            borderRadius: 99,
                            padding: "5px 9px",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          {record.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: 16, whiteSpace: "nowrap" }}>
                        {record.decision.replaceAll("_", " ")}
                      </td>
                      <td style={{ padding: 16, textAlign: "center" }}>{record.signals.length}</td>
                      <td style={{ padding: 16, whiteSpace: "nowrap", color: "var(--muted, #9298a7)" }}>
                        {formatDate(record.created_at)}
                      </td>
                      <td style={{ padding: 16 }}>
                        <Eye size={15} color={GOLD} />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div
          style={{
            padding: "13px 20px",
            borderTop: "1px solid var(--border, #292e38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            ...mutedStyle,
          }}
        >
          <span>Showing {filteredRecords.length} of {records.length} returned records</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <CircleCheck size={14} color={GREEN} />
            {copy.apiBackedData}
          </span>
        </div>
      </motion.section>

      {/* New assessment modal */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            key="fp-assessment-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !submitting) setFormOpen(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 999,
              background: "#000a",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              overflowY: "auto",
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="fp-form-title"
              initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              style={{
                width: "min(660px, 100%)",
                maxHeight: "92vh",
                overflowY: "auto",
                background: "var(--panel, #11141b)",
                border: "1px solid var(--border, #303541)",
                borderRadius: 18,
                padding: 24,
                boxSizing: "border-box",
                boxShadow: "0 25px 100px #0008",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <span className="section-kicker">{copy.riskOperations}</span>
                  <h2 id="fp-form-title" style={{ margin: "7px 0" }}>{copy.modalTitle}</h2>
                  <p style={{ ...mutedStyle, lineHeight: 1.7 }}>
                    Enter booking details to evaluate risk using the configured prototype rules.
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close assessment form"
                  disabled={submitting}
                  onClick={() => setFormOpen(false)}
                  style={{ ...buttonStyle, padding: 9 }}
                >
                  <X size={17} />
                </button>
              </div>

              <form onSubmit={submitAssessment} style={{ display: "grid", gap: 17, marginTop: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 14 }}>
                  <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
                    {copy.eventId} *
                    <input
                      required
                      maxLength={100}
                      value={form.event_id}
                      onChange={(e) => updateForm("event_id", e.target.value)}
                      placeholder={copy.eventIdPlaceholder}
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
                    {copy.bookingReference} *
                    <input
                      required
                      maxLength={100}
                      value={form.booking_reference}
                      onChange={(e) => updateForm("booking_reference", e.target.value)}
                      placeholder={copy.bookingReferencePlaceholder}
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 145px), 1fr))", gap: 14 }}>
                  <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
                    {copy.ticketsRequested}
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={form.tickets_requested}
                      onChange={(e) => updateForm("tickets_requested", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
                    {copy.eventTicketLimit}
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={form.event_ticket_limit}
                      onChange={(e) => updateForm("event_ticket_limit", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
                    {copy.bookingsLastTenMinutes}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={form.bookings_last_10_minutes}
                      onChange={(e) => updateForm("bookings_last_10_minutes", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
                    {copy.failedPaymentAttempts}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      required
                      value={form.failed_payment_attempts}
                      onChange={(e) => updateForm("failed_payment_attempts", Number(e.target.value))}
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={{ display: "grid", gap: 10, padding: 15, borderRadius: 12, background: "var(--surface, #0c0f15)" }}>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.repeated_booking_pattern}
                      onChange={(e) => updateForm("repeated_booking_pattern", e.target.checked)}
                    />
                    <span>
                      <strong>{copy.repeatedBookingPattern}</strong>
                      <span style={{ display: "block", ...mutedStyle, marginTop: 4 }}>
                        {copy.repeatedBookingDescription}
                      </span>
                    </span>
                  </label>
                  <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.verified_account}
                      onChange={(e) => updateForm("verified_account", e.target.checked)}
                    />
                    <span>
                      <strong>{copy.accountVerified}</strong>
                      <span style={{ display: "block", ...mutedStyle, marginTop: 4 }}>
                        {copy.accountVerifiedDescription}
                      </span>
                    </span>
                  </label>
                </div>

                {formError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    style={{ color: RED, fontSize: 12, lineHeight: 1.7 }}
                  >
                    {formError}
                  </motion.p>
                )}

                <p style={{ ...mutedStyle, lineHeight: 1.7, margin: 0 }}>
                  {copy.prototypeNotice}
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setFormOpen(false)}
                    style={{ ...buttonStyle, background: "transparent", color: "inherit" }}
                  >
                    {copy.cancel}
                  </button>
                  <motion.button
                    whileHover={reducedMotion || submitting ? undefined : { y: -2 }}
                    whileTap={reducedMotion || submitting ? undefined : { scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    style={{
                      ...buttonStyle,
                      color: "#17130b",
                      background: `linear-gradient(135deg, #F4D78D, ${GOLD})`,
                      borderColor: GOLD,
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? (
                      <><RefreshCw size={15} /> {copy.assessing}</>
                    ) : (
                      <><Zap size={15} /> {copy.assessBooking}</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <DetailDrawer
            key={selected.id ?? selected.assessment_id ?? selected.booking_reference}
            record={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={reducedMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: "fixed",
              right: 22,
              bottom: 22,
              zIndex: 1100,
              maxWidth: "calc(100vw - 44px)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--panel, #11141b)",
              border: "1px solid #55D6A055",
              borderRadius: 12,
              padding: "14px 17px",
              boxShadow: "0 12px 40px #0005",
              fontSize: 13,
            }}
          >
            <CircleCheck size={18} color={GREEN} />
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
              style={{ ...buttonStyle, border: 0, padding: 3, marginLeft: 4 }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        #fairpass-title {
          letter-spacing: -0.6px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </motion.section>
  );
}
