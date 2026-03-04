import { useState, useEffect, useRef } from "react";
import { useTelegram } from "../context/TelegramContext";
import "../../styles/Payment.css";

const PaymentImages = {
  click: "https://api.logobank.uz/media/logos_preview/Click-01_0xvqWH8.png",
  tonkeeper: "https://i.ibb.co/jkLrSV3X/image-Photoroom-1.png",
};

/* ═══════════════════════════════════════════════
   SUCCESS OVERLAY — to'lov amalga oshdi ekrani
═══════════════════════════════════════════════ */
function SuccessOverlay({ amount, onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = mount, 1 = circle anim, 2 = text shows, 3 = fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 2600);
    const t4 = setTimeout(() => onDone(), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@600;700&family=Sora:wght@500;700;800&display=swap');

        @keyframes successFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes successFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes circleGrow {
          0%   { transform: scale(0) rotate(-90deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes ripple1 {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes ripple2 {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(3.4); opacity: 0; }
        }
        @keyframes textSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes amountPop {
          0%   { opacity: 0; transform: scale(0.7); }
          70%  { transform: scale(1.07); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
        }
        @keyframes particleFloat {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }

        .success-overlay {
          position: fixed; inset: 0; z-index: 2000;
          background: #0f0f0f;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          animation: ${phase === 3 ? "successFadeOut 0.5s ease forwards" : "successFadeIn 0.35s ease forwards"};
        }

        .success-circle-wrap {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 32px;
        }
        .success-ripple {
          position: absolute;
          width: 90px; height: 90px; border-radius: 50%;
          background: rgba(34,197,94,0.25);
        }
      
        .success-ripple.r1 {
          animation: ${phase >= 1 ? "ripple1 1.2s ease-out 0.2s infinite" : "none"};
        }
        .success-ripple.r2 {
          animation: ${phase >= 1 ? "ripple2 1.2s ease-out 0.5s infinite" : "none"};
        }
        .success-circle {
          width: 90px; height: 90px; border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 8px rgba(34,197,94,0.12),
                      0 12px 40px rgba(34,197,94,0.45);
          animation: ${phase >= 1 ? "circleGrow 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none"};
          transform: scale(0);
        }
        .success-check {
          stroke-dasharray: 60;
          stroke-dashoffset: ${phase >= 1 ? "0" : "60"};
          transition: stroke-dashoffset 0.45s ease 0.4s;
        }

        .success-title {
          font-size: 26px; font-weight: 800; color: #ffffff;
          letter-spacing: -0.8px; margin: 0 0 8px; text-align: center;
          animation: ${phase >= 2 ? "textSlideUp 0.45s ease forwards" : "none"};
          opacity: ${phase >= 2 ? 1 : 0};
        }
        .success-sub {
          font-size: 13px; color: rgba(255,255,255,0.4);
          text-align: center; margin: 0 0 28px;
          animation: ${phase >= 2 ? "textSlideUp 0.45s ease 0.08s forwards" : "none"};
          opacity: ${phase >= 2 ? 1 : 0};
        }
        .success-amount-card {
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.2);
          border-radius: 18px; padding: 16px 40px;
          text-align: center;
          animation: ${phase >= 2 ? "amountPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both" : "none"};
          opacity: 0;
        }
        .success-amount-label {
          font-size: 10px; color: rgba(34,197,94,0.6);
          letter-spacing: 1.5px; text-transform: uppercase;
          font-weight: 600; margin-bottom: 6px;
        }
        .success-amount-val {
          font-size: 30px; font-weight: 800; color: #22c55e;
          letter-spacing: -1px; font-family: 'Sora', sans-serif;
        }
        .success-amount-val span {
          font-size: 16px; font-weight: 600;
          color: rgba(34,197,94,0.6); margin-left: 4px;
        }
        .success-redirect-hint {
          margin-top: 24px; font-size: 11px;
          color: rgba(255,255,255,0.2);
          font-family: 'JetBrains Mono', monospace;
          animation: ${phase >= 2 ? "textSlideUp 0.4s ease 0.3s both" : "none"};
          opacity: 0;
        }

        /* Confetti particles */
        .confetti-container {
          position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 2001;
        }
        .confetti-dot {
          position: absolute;
          border-radius: 2px;
          animation: confettiFall linear both;
        }
      `}</style>

      <div className="success-overlay">
        {/* Confetti */}
        {phase >= 1 && (
          <div className="confetti-container">
            {Array.from({ length: 28 }).map((_, i) => {
              const colors = ["#22c55e","#4ade80","#86efac","#2563eb","#60a5fa","#fbbf24","#f9a8d4"];
              const color = colors[i % colors.length];
              const left = `${5 + (i * 3.3) % 92}%`;
              const delay = `${(i * 0.07).toFixed(2)}s`;
              const dur = `${1.2 + (i % 5) * 0.2}s`;
              const w = `${5 + (i % 4) * 3}px`;
              const h = `${8 + (i % 3) * 4}px`;
              return (
                <div key={i} className="confetti-dot" style={{
                  left, top: "-10px", width: w, height: h,
                  background: color, opacity: 0.85,
                  animationDuration: dur,
                  animationDelay: delay,
                }} />
              );
            })}
          </div>
        )}

        {/* Circle + check */}
        <div className="success-circle-wrap">
          <div className="success-ripple r1" />
          <div className="success-ripple r2" />
          <div className="success-circle">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              <path
                className="success-check"
                d="M10 22L18 30L33 13"
                stroke="white" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="success-title">To'lov amalga oshdi!</h2>
        <p className="success-sub">Mablag' muvaffaqiyatli qabul qilindi</p>

        <div className="success-amount-card">
          <div className="success-amount-label">To'langan summa</div>
          <div className="success-amount-val">
            {amount ? Number(amount).toLocaleString("uz-UZ") : "—"}
            <span>so'm</span>
          </div>
        </div>

        <p className="success-redirect-hint">bosh sahifaga yo'naltirilmoqda...</p>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   CLICK PAY MODAL — chek ko'rinishida
═══════════════════════════════════════════════ */
function ClickPayModal({ link, paymentId, amount, status, statusLoading, onCheckStatus, onClose, onPaid }) {
  const [visible, setVisible] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Auto-poll every 4s while modal is open and status is not paid/failed
  useEffect(() => {
    if (!paymentId) return;
    if (status === "paid" || status === "failed") return;

    pollRef.current = setInterval(() => {
      onCheckStatus(paymentId);
    }, 4000);

    return () => clearInterval(pollRef.current);
  }, [paymentId, status]);

  // When status becomes "paid" trigger onPaid after short delay
  useEffect(() => {
    if (status === "paid") {
      clearInterval(pollRef.current);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onPaid(), 300);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [status]);

  const handleClose = () => {
    clearInterval(pollRef.current);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const statusMap = {
    pending: { label: "Kutilmoqda", color: "#f59e0b", dot: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    paid:    { label: "To'landi ✓", color: "#22c55e", dot: "#22c55e", bg: "rgba(34,197,94,0.15)" },
    failed:  { label: "Xato",       color: "#ef4444", dot: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  };
  const s = statusMap[status] || { label: status || "Kutilmoqda", color: "#f59e0b", dot: "#f59e0b", bg: "rgba(245,158,11,0.15)" };

  const now = new Date();
  const dateStr = now.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
  const refCode = paymentId ? `#${String(paymentId).padStart(8, "0")}` : `#--------`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Sora:wght@400;500;600;700;800&display=swap');

        @keyframes rcpt-fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes rcpt-slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes rcpt-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%     { opacity:.45; transform:scale(0.7); }
        }
        @keyframes rcpt-shimmer {
          0%   { left: -60%; }
          100% { left: 120%; }
        }
        @keyframes rcpt-rowFade {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes rcpt-spin {
          from { transform:rotate(0deg) }
          to   { transform:rotate(360deg) }
        }

        .rcpt-overlay {
          position:fixed; inset:0; z-index:1000;
          background:rgba(0,0,0,.75);
          backdrop-filter:blur(10px);
          display:flex; align-items:flex-end; justify-content:center;
          animation: rcpt-fadeIn .28s ease forwards;
          font-family:'Sora',sans-serif;
        }
        .rcpt-sheet {
          width:100%; max-width:440px;
          background:#0f0f0f;
          border-radius:28px 28px 0 0;
          padding:0 0 44px;
          box-shadow:0 -4px 60px rgba(0,0,0,.7),
                     0 0 0 1px rgba(255,255,255,.07),
                     inset 0 1px 0 rgba(255,255,255,.04);
          animation: rcpt-slideUp .38s cubic-bezier(.22,1,.36,1) forwards;
          overflow:hidden; position:relative;
          transition: opacity .3s ease, transform .3s ease;
        }
        .rcpt-top-bar {
          height:4px;
          background:linear-gradient(90deg,#1d4ed8,#60a5fa,#1d4ed8);
        }
        .rcpt-handle {
          width:40px; height:4px; border-radius:2px;
          background:rgba(255,255,255,.1);
          margin:16px auto 0;
        }
        .rcpt-close {
          position:absolute; top:22px; right:18px;
          width:30px; height:30px; border-radius:50%;
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.09);
          cursor:pointer; font-size:13px;
          color:rgba(255,255,255,.45);
          display:flex; align-items:center; justify-content:center;
          transition:all .18s;
        }
        .rcpt-close:hover { background:rgba(255,255,255,.1); color:rgba(255,255,255,.85); }

        .rcpt-header {
          padding:20px 22px 18px;
          display:flex; align-items:center; gap:14px;
          border-bottom:1px dashed rgba(255,255,255,.09);
        }
        .rcpt-logo {
          width:50px; height:50px; border-radius:14px; background:white;
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
          box-shadow:0 4px 18px rgba(37,99,235,.35);
        }
        .rcpt-logo img { width:32px; height:32px; object-fit:contain; }
        .rcpt-header h2 {
          font-size:16px; font-weight:700; color:#fff; margin:0 0 3px;
          letter-spacing:-.3px;
        }
        .rcpt-header p {
          font-size:11px; color:rgba(255,255,255,.35); margin:0;
          font-family:'JetBrains Mono',monospace;
        }

        .rcpt-amount {
          padding:22px 22px 18px;
          border-bottom:1px dashed rgba(255,255,255,.09);
          text-align:center;
        }
        .rcpt-amount-label {
          font-size:10px; font-weight:600; color:rgba(255,255,255,.3);
          letter-spacing:1.8px; text-transform:uppercase; margin-bottom:8px;
        }
        .rcpt-amount-val {
          font-size:36px; font-weight:800; color:#fff;
          letter-spacing:-1.5px; line-height:1;
        }
        .rcpt-amount-val span {
          font-size:17px; font-weight:600;
          color:rgba(255,255,255,.4); margin-left:5px; letter-spacing:0;
        }

        .rcpt-rows {
          padding:18px 22px;
          border-bottom:1px dashed rgba(255,255,255,.09);
          display:flex; flex-direction:column; gap:12px;
        }
        .rcpt-row {
          display:flex; justify-content:space-between; align-items:center;
          animation: rcpt-rowFade .3s ease both;
        }
        .rcpt-row:nth-child(1){animation-delay:.05s}
        .rcpt-row:nth-child(2){animation-delay:.10s}
        .rcpt-row:nth-child(3){animation-delay:.15s}
        .rcpt-row:nth-child(4){animation-delay:.20s}
        .rcpt-row:nth-child(5){animation-delay:.25s}
        .rcpt-row:nth-child(6){animation-delay:.30s}
        .rcpt-row-k { font-size:12px; color:rgba(255,255,255,.35); font-weight:500; }
        .rcpt-row-v {
          font-size:12px; color:rgba(255,255,255,.8); font-weight:600;
          font-family:'JetBrains Mono',monospace; text-align:right;
        }
        .rcpt-badge {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 11px; border-radius:20px;
          font-size:11px; font-weight:700;
          font-family:'JetBrains Mono',monospace;
        }
        .rcpt-dot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .rcpt-dot.pulse { animation: rcpt-pulse 1.3s ease infinite; }

        .rcpt-scissors {
          padding:12px 22px;
          border-bottom:1px dashed rgba(255,255,255,.09);
          display:flex; align-items:center; gap:10px;
        }
        .rcpt-dash {
          flex:1; height:1px;
          background:repeating-linear-gradient(90deg,
            rgba(255,255,255,.12) 0,rgba(255,255,255,.12) 6px,
            transparent 6px,transparent 12px);
        }
        .rcpt-scissors-icon { font-size:15px; opacity:.22; }

        .rcpt-actions { padding:18px 22px 0; display:flex; flex-direction:column; gap:10px; }

        .rcpt-pay-btn {
          display:flex; align-items:center; justify-content:space-between;
          padding:15px 16px; border-radius:16px; text-decoration:none;
          background:linear-gradient(135deg,#ffff 0%,#2563eb 60%,#3b82f6 100%);
          border:none; position:relative; overflow:hidden;
          box-shadow:0 4px 22px rgba(37,99,235,.4);
          transition:transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease;
          cursor:pointer;
        }
        .rcpt-pay-btn:hover { transform:translateY(-2px) scale(1.01); box-shadow:0 8px 32px rgba(37,99,235,.6); }
        .rcpt-pay-btn::after {
          content:''; position:absolute; top:0; left:-60%;
          width:45%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);
          transform:skewX(-18deg);
          animation: rcpt-shimmer 2.8s ease infinite; pointer-events:none;
        }
        .rcpt-btn-icon {
          width:36px; height:36px; border-radius:10px;
          background:rgba(255,255,255,.2);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .rcpt-btn-icon img { width:23px; height:23px; object-fit:contain; }
        .rcpt-btn-left { display:flex; align-items:center; gap:11px; }
        .rcpt-btn-title { font-size:14px; font-weight:700; color:white; letter-spacing:-.2px; }
        .rcpt-btn-sub { font-size:10px; color:rgba(255,255,255,.6); font-weight:500; margin-top:2px; }
        .rcpt-btn-arrow {
          width:30px; height:30px; border-radius:8px;
          background:rgba(255,255,255,.18);
          display:flex; align-items:center; justify-content:center;
          font-size:15px; color:white; flex-shrink:0;
          transition:transform .2s;
        }
        .rcpt-pay-btn:hover .rcpt-btn-arrow { transform:translateX(4px); }

        .rcpt-refresh-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:11px 15px; border-radius:12px;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);
        }
        .rcpt-refresh-label { font-size:11px; color:rgba(255,255,255,.35); font-weight:500; }
        .rcpt-refresh-btn {
          display:flex; align-items:center; gap:5px;
          padding:5px 11px; border-radius:8px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.09);
          color:rgba(255,255,255,.55); font-size:11px; font-weight:600;
          cursor:pointer; transition:all .18s;
          font-family:'Sora',sans-serif;
        }
        .rcpt-refresh-btn:hover:not(:disabled) { background:rgba(255,255,255,.11); color:rgba(255,255,255,.85); }
        .rcpt-refresh-btn:disabled { opacity:.45; cursor:not-allowed; }
        .rcpt-spin { animation: rcpt-spin .8s linear infinite; }

        .rcpt-footer {
          text-align:center; font-size:10px; color:rgba(255,255,255,.18);
          padding:14px 22px 0; font-family:'JetBrains Mono',monospace; letter-spacing:.4px;
        }
      `}</style>

      <div className="rcpt-overlay" onClick={handleClose}>
        <div
          className="rcpt-sheet"
          onClick={(e) => e.stopPropagation()}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          <div className="rcpt-top-bar" />
          <div className="rcpt-handle" />
          <button className="rcpt-close" onClick={handleClose}>✕</button>

          {/* Header */}
          <div className="rcpt-header">
            <div className="rcpt-logo">
              <img src={PaymentImages.click} alt="Click"
                onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
            <div>
              <h2>Click To'lovi</h2>
              <p>click.uz · Onlayn to'lov</p>
            </div>
          </div>

          {/* Amount */}
          <div className="rcpt-amount">
            <div className="rcpt-amount-label">To'lov miqdori</div>
            <div className="rcpt-amount-val">
              {amount ? Number(amount).toLocaleString("uz-UZ") : "—"}
              <span>so'm</span>
            </div>
          </div>

          {/* Details */}
          <div className="rcpt-rows">
            <div className="rcpt-row">
              <span className="rcpt-row-k">Qabul qiluvchi</span>
              <span className="rcpt-row-v">Starsbot</span>
            </div>
            <div className="rcpt-row">
              <span className="rcpt-row-k">To'lov turi</span>
              <span className="rcpt-row-v">Click · UZS</span>
            </div>
            <div className="rcpt-row">
              <span className="rcpt-row-k">Chegirma</span>
              <span className="rcpt-row-v">0%</span>
            </div>
            <div className="rcpt-row">
              <span className="rcpt-row-k">Sana / Vaqt</span>
              <span className="rcpt-row-v">{dateStr} · {timeStr}</span>
            </div>
            <div className="rcpt-row">
              <span className="rcpt-row-k">Referans</span>
              <span className="rcpt-row-v" style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>{refCode}</span>
            </div>
            <div className="rcpt-row">
              <span className="rcpt-row-k">Holat</span>
              <span>
                <span className="rcpt-badge" style={{ background: s.bg, color: s.color }}>
                  <span
                    className={`rcpt-dot ${status !== "paid" && status !== "failed" ? "pulse" : ""}`}
                    style={{ background: s.dot }}
                  />
                  {s.label}
                </span>
              </span>
            </div>
          </div>

          {/* Scissors divider */}
          <div className="rcpt-scissors">
            <div className="rcpt-dash" />
            <span className="rcpt-scissors-icon">✂</span>
            <div className="rcpt-dash" />
          </div>

          {/* Actions */}
          <div className="rcpt-actions">
            <a className="rcpt-pay-btn" href={link} target="_blank" rel="noopener noreferrer">
              <div className="rcpt-btn-left">
                <div className="rcpt-btn-icon">
                  <img src={PaymentImages.click} alt="Click"
                    onError={(e) => { e.currentTarget.style.display = "none"; }} />
                </div>
                <div>
                  <div className="rcpt-btn-title">Click orqali to'lash</div>
                  <div className="rcpt-btn-sub">Tez · Xavfsiz · Ishonchli</div>
                </div>
              </div>
              <div className="rcpt-btn-arrow">→</div>
            </a>

            <div className="rcpt-refresh-row">
              <span className="rcpt-refresh-label">To'lov holatini yangilash</span>
              <button
                className="rcpt-refresh-btn"
                onClick={() => onCheckStatus(paymentId)}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <>
                    <svg className="rcpt-spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Tekshirilmoqda
                  </>
                ) : "🔄 Yangilash"}
              </button>
            </div>
          </div>

          <div className="rcpt-footer">click.uz tomonidan himoyalangan</div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAYMENT PAGE
═══════════════════════════════════════════════ */
export default function Payment() {
  const { user } = useTelegram();
  const [method, setMethod] = useState("click");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [loadedImages, setLoadedImages] = useState(new Set());

  const [clickLoading, setClickLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clickPaymentLink, setClickPaymentLink] = useState(null);
  const [clickPaymentId, setClickPaymentId] = useState(null);
  const [clickStatus, setClickStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Success screen state
  const [showSuccess, setShowSuccess] = useState(false);

  const handleImageLoad = (m) => setLoadedImages((prev) => new Set(prev).add(m));
  const isImageLoaded = (m) => loadedImages.has(m);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);
    if (value === "" || !isNaN(parseFloat(value))) setError("");
  };

  const handleMethodChange = (m) => {
    setMethod(m);
    setError("");
  };

  /* ── CHECK STATUS ── */
  const checkClickStatus = async (paymentId) => {
    try {
      setStatusLoading(true);
      const res = await fetch(`https://tezpremium.uz/MilliyDokon/click_status.php?payment_id=${paymentId}`);
      const data = await res.json();
      const newStatus = data.status || "pending";
      setClickStatus(newStatus);
      return newStatus;
    } catch (err) {
      console.error("❌ checkClickStatus error:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  /* ── ON PAID: show success screen then redirect ── */
  const handlePaid = () => {
    setShowModal(false);
    setShowSuccess(true);
  };

  /* ── SUCCESS DONE: redirect to / ── */
  const handleSuccessDone = () => {
    setShowSuccess(false);
    window.location.href = "/";
  };

  /* ── SUBMIT ── */
  const handleSubmit = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum)) { setError("To'lov miqdorini kiriting"); return; }
    if (amountNum < 1000) { setError("To'lov miqdori 1000 so'mdan kam bo'lmasligi kerak"); return; }
    if (amountNum > 1000000) { setError("To'lov miqdori 1,000,000 so'mdan oshmasligi kerak"); return; }

    setError("");

    if (method === "click") {
      try {
        if (!user?.id) { setError("Foydalanuvchi topilmadi"); return; }
        setClickLoading(true);

        const response = await fetch(`https://tezpremium.uz/MilliyDokon/click.php?user_id=${user.id}&amount=${amountNum}`);
        const data = await response.json();

        if (data.ok && data.link) {
          setClickPaymentLink(data.link);
          setClickPaymentId(data.payment_id);
          setClickStatus(null);
          setShowModal(true);
          if (data.payment_id) {
            const initialStatus = await checkClickStatus(data.payment_id);
            if (initialStatus === "paid") handlePaid();
          }
        } else {
          setError(data.message || "To'lovda xatolik yuz berdi");
        }
      } catch (err) {
        setError("To'lov yuborishda xatolik yuz berdi");
      } finally {
        setClickLoading(false);
      }

    } else if (method === "tonkeeper") {
      try {
        if (!user?.id) { setError("Foydalanuvchi topilmadi"); return; }
        const response = await fetch(`https://m4746.myxvest.ru/webapp/payments/tonpay.php?user_id=${user.id}&amount=${amountNum}`);
        const data = await response.json();
        if (data.status === "ok") {
          window.location.href = `/ton?user_id=${user.id}&amount=${amountNum}&payment_id=${data.payment_id || ""}&sum=${data.sum || amountNum}&ton=${data.ton || ""}&link=${encodeURIComponent(data.link || "")}`;
        } else {
          setError(data.message || "To'lovda xatolik yuz berdi");
        }
      } catch (err) {
        setError("To'lov yuborishda xatolik yuz berdi");
      }
    }
  };

  return (
    <>
      <div className="payment-wrapper">
        {/* Header card */}
        <div className="payment-card">
          <div className="payment-row">
            <div className="payment-row-column">
              <span className="payment-label">Qabul qiluvchi</span>
              <span className="payment-receiver">Starsbot</span>
            </div>
            <div className="payment-row-column">
              <span className="payment-label">Chegirma</span>
              <span className="payment-price">0%</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="payment-input-block" style={{ marginBottom: 20 }}>
          <p className="payment-info-text">
            ℹ️ To'lov miqdori 1000 so'mdan kam va 1,000,000 so'mdan oshmasligi kerak
          </p>
        </div>

        {/* Method selector */}
        <div style={{ marginBottom: 20 }}>
          <h3 className="payment-title">To'lov tizimini tanlang</h3>
          <div className="payment-methods">
            {["click", "tonkeeper"].map((m) => (
              <div
                key={m}
                onClick={() => handleMethodChange(m)}
                className={`payment-method ${method === m ? "selected" : ""}`}
                style={{ cursor: "pointer" }}
              >
                {!isImageLoaded(m) && <div className="payment-skeleton" />}
                <img
                  src={PaymentImages[m]}
                  alt={m.charAt(0).toUpperCase() + m.slice(1)}
                  className={`payment-logo ${isImageLoaded(m) ? "loaded" : ""}`}
                  onLoad={() => handleImageLoad(m)}
                  onError={(e) => {
                    handleImageLoad(m);
                    e.currentTarget.style.display = "none";
                    const fallback = { click: { letter: "C", color: "#fdb813" }, tonkeeper: { letter: "T", color: "#0098ea" } }[m];
                    if (e.currentTarget.parentElement && fallback) {
                      e.currentTarget.parentElement.innerHTML = `<span style="font-size:40px;font-weight:700;color:${fallback.color};">${fallback.letter}</span>`;
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Amount input */}
        <div className="payment-input-block">
          <label htmlFor="amount-input" className="payment-input-label">
            To'lov miqdori (so'm)
          </label>
          <input
            id="amount-input"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Masalan: 50000"
            className="payment-input"
            style={{ cursor: "text", pointerEvents: "auto", opacity: 1 }}
          />
          {error && <p className="payment-error">⚠️ {error}</p>}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="payment-button"
          style={{ cursor: clickLoading ? "not-allowed" : "pointer", opacity: clickLoading ? 0.7 : 1 }}
          disabled={clickLoading}
        >
          {clickLoading ? "⏳ Yuklanmoqda..." : "✓ Yuborish"}
        </button>
      </div>

      {/* Click receipt modal */}
      {showModal && clickPaymentLink && (
        <ClickPayModal
          link={clickPaymentLink}
          paymentId={clickPaymentId}
          amount={amount}
          status={clickStatus}
          statusLoading={statusLoading}
          onCheckStatus={checkClickStatus}
          onClose={() => setShowModal(false)}
          onPaid={handlePaid}
        />
      )}

      {/* Success screen */}
      {showSuccess && (
        <SuccessOverlay
          amount={amount}
          onDone={handleSuccessDone}
        />
      )}
    </>
  );
}