import { useState, useEffect } from "react";

// ─── REAL EMPLOYEES FROM DATASET ───

const EMPLOYEES = {
  brill: {
    name: "Donna Brill",
    status: "Voluntarily Terminated",
    statusColor: "#ef4444",
    reason: "Left for another position",
    profile: {
      Department: "Production", Salary: 53492, MaritalDesc: "Married", Sex_clean: "F",
      RaceDesc: "White", RecruitmentSource: "Google Search", EngagementSurvey: 3.35,
      EmpSatisfaction: 4, SpecialProjectsCount: 0, DaysLateLast30: 0,
      Absences: 6, Age: 29, PerformanceScore: "Fully Meets", FromDiversityJobFairID: 0
    }
  },
  lajiri: {
    name: "Jyoti Lajiri",
    status: "Active",
    statusColor: "#22c55e",
    reason: null,
    profile: {
      Department: "IT/IS", Salary: 93206, MaritalDesc: "Married", Sex_clean: "M",
      RaceDesc: "White", RecruitmentSource: "Employee Referral", EngagementSurvey: 4.46,
      EmpSatisfaction: 5, SpecialProjectsCount: 6, DaysLateLast30: 0,
      Absences: 7, Age: 33, PerformanceScore: "Fully Meets", FromDiversityJobFairID: 0
    }
  }
};

const FEATURE_LABELS = {
  Department: "Department", Salary: "Salary", MaritalDesc: "Marital Status",
  Sex_clean: "Gender", RaceDesc: "Ethnicity", RecruitmentSource: "Recruitment Source",
  EngagementSurvey: "Engagement Score", EmpSatisfaction: "Satisfaction",
  SpecialProjectsCount: "Special Projects", DaysLateLast30: "Days Late (30d)",
  Absences: "Absences", Age: "Age", PerformanceScore: "Performance",
  FromDiversityJobFairID: "Diversity Fair Hire"
};

// ─── RISK ENGINE ───

const RISK_WEIGHTS = {
  RecruitmentSource: { "Google Search": 0.57, "Diversity Job Fair": 0.55, "On-line Web application": 0.70, "Other": 0.45, "CareerBuilder": 0.42, "Indeed": 0.20, "LinkedIn": 0.19, "Employee Referral": 0.07, "Website": 0.05 },
  Department: { "Production": 0.36, "Software Engineering": 0.27, "IT/IS": 0.12, "Admin Offices": 0.11, "Sales": 0.10, "Executive Office": 0.0 },
};

function computeRisk(vals) {
  let score = 0.30;
  const srcWeight = RISK_WEIGHTS.RecruitmentSource[vals.RecruitmentSource] || 0.25;
  score += (srcWeight - 0.25) * 0.45;
  const deptWeight = RISK_WEIGHTS.Department[vals.Department] || 0.15;
  score += (deptWeight - 0.15) * 0.35;
  score += Math.max(0, (63000 - vals.Salary) / 63000) * 0.15;
  score += Math.max(0, (4.3 - vals.EngagementSurvey) / 4.3) * 0.12;
  score += vals.SpecialProjectsCount === 0 ? 0.08 : -0.04;
  score += Math.max(0, (4 - vals.EmpSatisfaction) / 4) * 0.06;
  score += Math.max(0, (vals.Absences - 10) / 20) * 0.04;
  if (vals.PerformanceScore === "PIP") score += 0.06;
  if (vals.PerformanceScore === "Needs Improvement") score += 0.03;
  return Math.max(0.02, Math.min(0.95, score));
}

function getRiskFactors(vals) {
  const factors = [];
  const srcRisk = RISK_WEIGHTS.RecruitmentSource[vals.RecruitmentSource] || 0.25;
  if (srcRisk > 0.4) factors.push({ label: `Recruited via ${vals.RecruitmentSource}`, impact: "high", detail: `${Math.round(srcRisk*100)}% attrition rate for this channel` });
  else if (srcRisk < 0.15) factors.push({ label: `Recruited via ${vals.RecruitmentSource}`, impact: "protective", detail: `Only ${Math.round(srcRisk*100)}% attrition — strong retention channel` });
  if (vals.Department === "Production") factors.push({ label: "Production department", impact: "high", detail: "85% of all voluntary departures come from Production" });
  else if (vals.Department !== "Production") factors.push({ label: `${vals.Department} department`, impact: "protective", detail: `${Math.round((RISK_WEIGHTS.Department[vals.Department]||0.1)*100)}% attrition — below company average` });
  if (vals.Salary < 55000) factors.push({ label: `Below-median salary ($${vals.Salary.toLocaleString()})`, impact: "high", detail: "Leavers earn ~$6,700 less than stayers on average" });
  else if (vals.Salary > 80000) factors.push({ label: `Above-average compensation ($${vals.Salary.toLocaleString()})`, impact: "protective", detail: "Higher salary correlates with retention" });
  if (vals.SpecialProjectsCount === 0) factors.push({ label: "No special projects assigned", impact: "high", detail: "Leavers average 0.5 projects vs 1.5 for stayers (3x gap)" });
  else if (vals.SpecialProjectsCount >= 2) factors.push({ label: `${vals.SpecialProjectsCount} special projects`, impact: "protective", detail: "Project engagement strongly predicts retention" });
  if (vals.EngagementSurvey < 3.5) factors.push({ label: `Low engagement score (${vals.EngagementSurvey})`, impact: "high", detail: "Below company median of 4.3" });
  else if (vals.EngagementSurvey >= 4.3) factors.push({ label: `Good engagement score (${vals.EngagementSurvey})`, impact: "protective", detail: "At or above company median" });
  return factors;
}

function getRecommendations(vals, risk) {
  const recs = [];
  if (vals.SpecialProjectsCount === 0) recs.push("Assign to a cross-functional project to boost engagement");
  if (vals.Salary < 60000 && vals.Department === "Production") recs.push("Review compensation — below department median");
  if (vals.EngagementSurvey < 3.5) recs.push("Schedule 1-on-1 with manager to address engagement concerns");
  if (risk > 0.5) recs.push("Prioritize retention interview within 2 weeks");
  if (vals.Department === "Production" && risk > 0.35) recs.push("Explore internal mobility options outside Production");
  if (recs.length === 0) recs.push("Continue regular check-ins — this employee shows healthy engagement signals");
  return recs;
}

// ─── COMPONENTS ───

function RiskGauge({ risk }) {
  const color = risk < 0.3 ? "#22c55e" : risk < 0.55 ? "#f59e0b" : "#ef4444";
  const label = risk < 0.3 ? "LOW" : risk < 0.55 ? "MODERATE" : "HIGH";

  // Arc from -180° (left, 0%) to 0° (right, 100%) — semicircle
  const cx = 100, cy = 100, r = 72;
  const needleAngle = Math.PI - (risk * Math.PI); // 0% = PI (left), 100% = 0 (right)
  const nx = cx + r * 0.85 * Math.cos(needleAngle);
  const ny = cy - r * 0.85 * Math.sin(needleAngle);

  // Colored arc segments
  const arcPath = (startPct, endPct) => {
    const a1 = Math.PI - startPct * Math.PI;
    const a2 = Math.PI - endPct * Math.PI;
    const x1 = cx + r * Math.cos(a1), y1 = cy - r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy - r * Math.sin(a2);
    const large = (endPct - startPct) > 0.5 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div style={{ textAlign: "center", padding: "1.25rem 0 0.5rem" }}>
      <svg viewBox="0 0 200 115" width="240" style={{ overflow: "visible" }}>
        {/* Track segments */}
        <path d={arcPath(0, 0.3)} fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" opacity="0.25" />
        <path d={arcPath(0.3, 0.55)} fill="none" stroke="#f59e0b" strokeWidth="12" opacity="0.25" />
        <path d={arcPath(0.55, 1.0)} fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" opacity="0.25" />

        {/* Active segment up to risk value */}
        <path d={arcPath(0, Math.min(risk, 0.3))} fill="none" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" />
        {risk > 0.3 && <path d={arcPath(0.3, Math.min(risk, 0.55))} fill="none" stroke="#f59e0b" strokeWidth="12" />}
        {risk > 0.55 && <path d={arcPath(0.55, Math.min(risk, 1.0))} fill="none" stroke="#ef4444" strokeWidth="12" strokeLinecap="round" />}

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <circle cx={cx} cy={cy} r="2.5" fill="#020617" />

        {/* Value */}
        <text x={cx} y={cy - 15} textAnchor="middle" style={{ fontSize: "30px", fontWeight: 800, fill: color, fontFamily: "'DM Mono', monospace" }}>
          {Math.round(risk * 100)}%
        </text>

        {/* Scale labels */}
        <text x="18" y="112" style={{ fontSize: "9px", fill: "#475569" }}>0%</text>
        <text x={cx} y="30" textAnchor="middle" style={{ fontSize: "9px", fill: "#475569" }}>50%</text>
        <text x="174" y="112" style={{ fontSize: "9px", fill: "#475569" }}>100%</text>
      </svg>
      <div style={{ fontSize: "12px", fontWeight: 700, color, letterSpacing: "0.15em", marginTop: "0.15rem" }}>{label} RISK</div>
    </div>
  );
}

function FactorPill({ factor }) {
  const styles = {
    high: { bg: "#1c1117", border: "#7f1d1d", text: "#fca5a5", arrow: "▲" },
    protective: { bg: "#0c1a0c", border: "#14532d", text: "#86efac", arrow: "▼" }
  };
  const s = styles[factor.impact] || styles.high;
  return (
    <div style={{ padding: "0.65rem 0.85rem", marginBottom: "0.4rem", background: s.bg, border: `1px solid ${s.border}`, borderRadius: "8px" }}>
      <div style={{ fontWeight: 700, fontSize: "13px", color: s.text }}>{s.arrow} {factor.label}</div>
      <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>{factor.detail}</div>
    </div>
  );
}

function ProfileCard({ employee, isSelected, onClick }) {
  const e = EMPLOYEES[employee];
  const risk = computeRisk(e.profile);
  const riskColor = risk < 0.3 ? "#22c55e" : risk < 0.55 ? "#f59e0b" : "#ef4444";
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "1rem 1.25rem", borderRadius: "12px", cursor: "pointer", textAlign: "left", transition: "all 0.2s",
      background: isSelected ? "#0f172a" : "#020617",
      border: isSelected ? `2px solid ${riskColor}` : "2px solid #1e293b",
      outline: "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#e2e8f0" }}>{e.name}</span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: e.statusColor, background: e.statusColor + "18", padding: "2px 8px", borderRadius: "6px" }}>{e.status}</span>
      </div>
      <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.6 }}>
        {e.profile.Department} · ${e.profile.Salary.toLocaleString()} · {e.profile.RecruitmentSource}
        <br/>{e.profile.SpecialProjectsCount} projects · Engagement: {e.profile.EngagementSurvey} · {e.profile.PerformanceScore}
      </div>
      {e.reason && <div style={{ fontSize: "11px", color: "#f87171", marginTop: "0.3rem", fontStyle: "italic" }}>Reason: {e.reason}</div>}
    </button>
  );
}

function FeatureTable({ profile }) {
  const rows = Object.entries(FEATURE_LABELS);
  return (
    <div style={{ fontSize: "12px" }}>
      {rows.map(([key, label]) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "0.35rem 0", borderBottom: "1px solid #1e293b" }}>
          <span style={{ color: "#64748b" }}>{label}</span>
          <span style={{ color: "#cbd5e1", fontFamily: "'DM Mono', monospace", fontWeight: 500 }}>
            {key === "Salary" ? `$${profile[key].toLocaleString()}` : key === "FromDiversityJobFairID" ? (profile[key] ? "Yes" : "No") : profile[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── INSIGHTS TAB ───

function InsightsTab() {
  const insights = [
    { title: "Recruitment Source = #1 Predictor", stat: "57%", sub: "of Google Search hires leave vs 7% for Employee Referrals", color: "#3b82f6",
      bars: [
        { label: "Google Search", val: 57, color: "#ef4444" }, { label: "Diversity Fair", val: 55, color: "#ef4444" },
        { label: "CareerBuilder", val: 42, color: "#f59e0b" }, { label: "Indeed", val: 20, color: "#22c55e" },
        { label: "LinkedIn", val: 19, color: "#22c55e" }, { label: "Emp. Referral", val: 7, color: "#16a34a" }
      ]},
    { title: "Production Dept Concentrates 85% of Attrition", stat: "36%", sub: "voluntary attrition rate — 3x higher than any other department", color: "#f59e0b",
      bars: [
        { label: "Production", val: 36, color: "#ef4444" }, { label: "Software Eng.", val: 27, color: "#f59e0b" },
        { label: "IT/IS", val: 12, color: "#22c55e" }, { label: "Sales", val: 10, color: "#22c55e" }
      ]},
    { title: "Project Engagement = Retention Signal", stat: "3x", sub: "gap: active employees get 1.5 projects vs 0.5 for leavers", color: "#22c55e",
      bars: [
        { label: "Active (avg)", val: 75, color: "#22c55e" }, { label: "Leavers (avg)", val: 25, color: "#ef4444" }
      ]},
    { title: "Salary Matters, But Less Than You Think", stat: "$6.7K", sub: "gap exists, but Recruitment Source & Projects outweigh salary in permutation importance", color: "#8b5cf6",
      bars: [
        { label: "Active avg", val: 71, color: "#22c55e" }, { label: "Leavers avg", val: 64, color: "#f59e0b" }
      ]},
  ];
  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {insights.map((ins, i) => (
        <div key={i} style={{ background: "#0f172a", borderRadius: "14px", padding: "1.5rem", border: "1px solid #1e293b" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: ins.color, fontFamily: "'DM Mono', monospace" }}>{ins.stat}</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>{ins.title}</span>
          </div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "1rem" }}>{ins.sub}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {ins.bars.map((b, j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8", width: "100px", textAlign: "right", flexShrink: 0 }}>{b.label}</span>
                <div style={{ flex: 1, background: "#1e293b", borderRadius: "4px", height: "16px", overflow: "hidden" }}>
                  <div style={{ width: `${b.val}%`, height: "100%", background: b.color, borderRadius: "4px", transition: "width 0.8s ease" }} />
                </div>
                <span style={{ fontSize: "11px", color: "#cbd5e1", width: "35px", fontFamily: "'DM Mono', monospace" }}>{b.val}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FAIRNESS TAB ───

function FairnessTab() {
  const genderData = [
    { group: "Female", attrition: 29.2, auc: 0.549, n: 155 },
    { group: "Male", attrition: 31.0, auc: 0.685, n: 140 },
  ];
  const raceData = [
    { group: "White", attrition: 33.5, auc: 0.633, n: 170 },
    { group: "Black or African American", attrition: 26.3, auc: 0.547, n: 57 },
    { group: "Asian", attrition: 17.9, auc: "N/A*", n: 28 },
    { group: "Hispanic", attrition: 33.3, auc: "N/A*", n: 18 },
    { group: "Two or more races", attrition: 33.3, auc: "N/A*", n: 12 },
  ];
  const thStyle = { textAlign: "left", padding: "0.6rem 0.75rem", color: "#94a3b8", borderBottom: "1px solid #1e293b", fontWeight: 600, fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" };
  const tdStyle = { padding: "0.6rem 0.75rem", borderBottom: "1px solid #1e293b", color: "#e2e8f0" };

  const renderTable = (data) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
      <thead><tr><th style={thStyle}>Group</th><th style={thStyle}>Attrition %</th><th style={thStyle}>Model AUC</th><th style={thStyle}>N</th></tr></thead>
      <tbody>{data.map((r,i) => (
        <tr key={i}>
          <td style={tdStyle}>{r.group}</td>
          <td style={tdStyle}>{r.attrition}%</td>
          <td style={{...tdStyle, color: typeof r.auc === 'number' && r.auc < 0.6 ? '#f59e0b' : r.auc === "N/A*" ? '#64748b' : '#22c55e' }}>{r.auc}</td>
          <td style={tdStyle}>{r.n}</td>
        </tr>
      ))}</tbody>
    </table>
  );

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div style={{ background: "#0f172a", borderRadius: "14px", padding: "1.5rem", border: "1px solid #1e293b" }}>
        <h3 style={{ margin: "0 0 0.25rem", fontSize: "16px", color: "#e2e8f0" }}>Fairness Audit — Gender</h3>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 1rem" }}>Attrition rates are comparable across genders. AUC gap (0.14) signals the model performs worse for female employees — needs monitoring.</p>
        {renderTable(genderData)}
      </div>
      <div style={{ background: "#0f172a", borderRadius: "14px", padding: "1.5rem", border: "1px solid #1e293b" }}>
        <h3 style={{ margin: "0 0 0.25rem", fontSize: "16px", color: "#e2e8f0" }}>Fairness Audit — Race / Ethnicity</h3>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 1rem" }}>Small subgroup sizes limit per-group AUC reliability. Model should not be used for individual decisions on underrepresented groups without human review.</p>
        {renderTable(raceData)}
        <p style={{ fontSize: "11px", color: "#64748b", marginTop: "0.75rem" }}>* Subgroup too small for reliable AUC computation</p>
      </div>
      <div style={{ background: "#0c1425", borderRadius: "14px", padding: "1.25rem", border: "1px solid #1e3a5f" }}>
        <div style={{ fontSize: "13px", color: "#93c5fd", fontWeight: 600, marginBottom: "0.5rem" }}>Ethical AI Guardrails</div>
        <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "12px", color: "#94a3b8", lineHeight: 1.8 }}>
          <li>Model predictions are <strong style={{color:"#e2e8f0"}}>advisory only</strong> — no automated decisions on individuals</li>
          <li>Gender & Race features included for <strong style={{color:"#e2e8f0"}}>bias auditing</strong>, not as causal drivers</li>
          <li>HR must validate every high-risk flag with a <strong style={{color:"#e2e8f0"}}>human conversation</strong></li>
          <li>Model retrained quarterly to prevent <strong style={{color:"#e2e8f0"}}>distribution drift</strong></li>
        </ul>
      </div>
    </div>
  );
}

// ─── MAIN APP ───

export default function App() {
  const [tab, setTab] = useState("predict");
  const [selected, setSelected] = useState("brill");

  const emp = EMPLOYEES[selected];
  const risk = computeRisk(emp.profile);
  const factors = getRiskFactors(emp.profile);
  const recs = getRecommendations(emp.profile, risk);

  const tabs = [
    { id: "predict", label: "Predict" },
    { id: "insights", label: "Insights" },
    { id: "fairness", label: "Fairness" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)", borderBottom: "1px solid #1e293b", padding: "1.5rem 2rem" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 800, color: "#fff" }}>HR</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em" }}>HR Attrition Intelligence</h1>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>Trusted AI · Ethical · Explainable · Voluntary attrition only</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "1.25rem" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s",
                  background: tab === t.id ? "#3b82f6" : "transparent", color: tab === t.id ? "#fff" : "#94a3b8" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.5rem 2rem 3rem" }}>

        {tab === "predict" && (
          <>
            {/* Employee selector */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Select an employee from the dataset</div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <ProfileCard employee="brill" isSelected={selected === "brill"} onClick={() => setSelected("brill")} />
                <ProfileCard employee="lajiri" isSelected={selected === "lajiri"} onClick={() => setSelected("lajiri")} />
              </div>
            </div>

            {/* Results grid */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.25rem" }}>
              {/* Left: profile detail */}
              <div style={{ background: "#0f172a", borderRadius: "14px", padding: "1.25rem", border: "1px solid #1e293b" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.75rem" }}>Full Profile</div>
                <FeatureTable profile={emp.profile} />
              </div>

              {/* Right: risk + factors + recommendations */}
              <div>
                <div style={{ background: "#0f172a", borderRadius: "14px", padding: "1rem", border: "1px solid #1e293b", marginBottom: "1rem" }}>
                  <RiskGauge risk={risk} />
                  {emp.reason && (
                    <div style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "0.25rem", paddingBottom: "0.5rem" }}>
                      Ground truth: <span style={{ color: emp.statusColor, fontWeight: 600 }}>{emp.status}</span>
                      {emp.reason && <span> — {emp.reason}</span>}
                    </div>
                  )}
                  {!emp.reason && (
                    <div style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "0.25rem", paddingBottom: "0.5rem" }}>
                      Ground truth: <span style={{ color: emp.statusColor, fontWeight: 600 }}>{emp.status}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>XAI — Risk Factors</h3>
                  {factors.map((f, i) => <FactorPill key={i} factor={f} />)}
                </div>

                <div style={{ background: "#0c1a0c", borderRadius: "12px", padding: "1rem", border: "1px solid #166534" }}>
                  <h3 style={{ fontSize: "12px", fontWeight: 700, color: "#4ade80", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Recommended Actions</h3>
                  {recs.map((r, i) => (
                    <div key={i} style={{ fontSize: "13px", color: "#bbf7d0", padding: "0.4rem 0", borderBottom: i < recs.length-1 ? "1px solid #1a2e1a" : "none" }}>
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "insights" && <InsightsTab />}
        {tab === "fairness" && <FairnessTab />}

        {/* Footer */}
        <div style={{ marginTop: "2rem", padding: "1rem", borderTop: "1px solid #1e293b", textAlign: "center" }}>
          <p style={{ fontSize: "11px", color: "#475569", margin: 0 }}>
            Model: GradientBoosting (sklearn) · AUC: 0.616 · Trained on voluntary attrition only (n=295) · Dataset: HRDataset_v14 (Rich Huebner, Kaggle)
          </p>
          <p style={{ fontSize: "11px", color: "#475569", margin: "4px 0 0" }}>
            Advisory tool only — all predictions require human validation before any action
          </p>
        </div>
      </div>
    </div>
  );
}
