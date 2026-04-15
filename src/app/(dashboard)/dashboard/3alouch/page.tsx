"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Play {
  id: string;
  phone: string;
  ip: string;
  result: "win" | "lose";
  name: string;
  createdAt: string;
}

interface Config {
  winMode: boolean;
  totalWins: number;
  totalPlays: number;
  plays: Play[];
}

export default function AlouchDashboard() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [whitelisting, setWhitelisting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "ok" | "err" } | null>(null);

  const flash = (text: string, type: "ok" | "err" = "ok") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/3alouch/config");
      const data = await res.json();
      setConfig(data);
    } catch {
      flash("خطأ في تحميل البيانات", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleWinMode = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const next = !config.winMode;
      const res = await fetch("/api/3alouch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winMode: next }),
      });
      if (res.ok) {
        setConfig(c => c ? { ...c, winMode: next } : c);
        flash(next ? "✅ اللاعب القادم سيفوز!" : "❌ اللاعب القادم لن يفوز");
      }
    } finally {
      setSaving(false);
    }
  };

  const whitelistMyIP = async () => {
    setWhitelisting(true);
    try {
      // Get our current IP from the check endpoint (it reads x-forwarded-for server-side)
      const res = await fetch("/api/3alouch/my-ip");
      const { ip } = await res.json();
      await fetch("/api/3alouch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "whitelist", phone: "26107128", ip }),
      });
      flash(`✅ تمت إضافة IP الخاص بك (${ip}) للقائمة البيضاء`);
    } catch {
      flash("خطأ أثناء الإضافة", "err");
    } finally {
      setWhitelisting(false);
    }
  };

  const clearAll = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع اللاعبين وإعادة تعيين اللعبة؟")) return;
    setClearing(true);
    try {
      await fetch("/api/3alouch/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      });
      flash("✅ تم مسح البيانات");
      load();
    } finally {
      setClearing(false);
    }
  };

  const gameUrl = typeof window !== "undefined"
    ? `${window.location.origin}/3alouch`
    : "/3alouch";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">🐑 لعبة عيد الأضحى</h1>
          <p className="text-gray-500 text-sm mt-1">تحكم في نتائج اللعبة وشاهد قائمة اللاعبين</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={whitelistMyIP}
            disabled={whitelisting}
            className="px-4 py-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg text-sm hover:bg-yellow-100 font-medium"
          >
            {whitelisting ? "جارٍ الإضافة..." : "🛡️ إضافة IP الخاص بك للاختبار"}
          </button>
          <button
            onClick={load}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`p-3 rounded-lg text-sm font-medium text-center ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-400">جارٍ التحميل...</div>
      ) : config ? (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "إجمالي المشاركين", value: config.totalPlays, icon: "👥", color: "blue" },
              { label: "الفائزون", value: config.totalWins, icon: "🐑", color: "yellow" },
              { label: "الخاسرون", value: config.totalPlays - config.totalWins, icon: "❌", color: "red" },
              { label: "نسبة الفوز", value: config.totalPlays ? `${Math.round((config.totalWins / config.totalPlays) * 100)}%` : "—", icon: "📊", color: "green" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Win mode toggle */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-1">🎯 تحكم في النتيجة</h2>
            <p className="text-gray-500 text-sm mb-6">
              عندما يكون "وضع الفوز" مفعّلاً — اللاعب القادم الأول يفوز بالخروف، ثم يُعاد تعيينه تلقائياً.
            </p>

            <div className="flex items-center gap-6 flex-wrap">
              <button
                onClick={toggleWinMode}
                disabled={saving}
                className={`relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none ${config.winMode ? "bg-yellow-400" : "bg-gray-300"}`}
              >
                <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${config.winMode ? "translate-x-8" : "translate-x-0"}`} />
              </button>

              <span className={`text-lg font-bold ${config.winMode ? "text-yellow-600" : "text-gray-500"}`}>
                {config.winMode ? "🐑 وضع الفوز مفعّل — اللاعب القادم سيفوز!" : "❌ وضع الخسارة — لا أحد يفوز الآن"}
              </span>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              💡 <strong>كيف يعمل:</strong> شغّل "وضع الفوز" قبل أن يلعب الشخص المختار. بعد فوزه يرجع تلقائياً للخسارة. يمكنك تفعيله للاعب محدد فقط.
            </div>
          </div>

          {/* QR / Share link */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-3">🔗 رابط اللعبة</h2>
            <div className="flex gap-3 flex-wrap">
              <input
                readOnly
                value={gameUrl}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 font-mono min-w-0"
              />
              <button
                onClick={() => { navigator.clipboard.writeText(gameUrl); flash("✅ تم نسخ الرابط"); }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700"
              >
                نسخ
              </button>
              <a
                href={gameUrl}
                target="_blank"
                className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-bold hover:bg-yellow-500"
              >
                فتح اللعبة
              </a>
            </div>
          </div>

          {/* Players list */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold">👥 قائمة اللاعبين ({config.plays.length})</h2>
              <button
                onClick={clearAll}
                disabled={clearing}
                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100"
              >
                {clearing ? "جارٍ الحذف..." : "🗑️ مسح الكل"}
              </button>
            </div>

            {config.plays.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <div className="text-4xl mb-3">🎰</div>
                <p>لا يوجد لاعبون بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="px-4 py-3 text-right">#</th>
                      <th className="px-4 py-3 text-right">الاسم</th>
                      <th className="px-4 py-3 text-right">رقم الهاتف</th>
                      <th className="px-4 py-3 text-right">النتيجة</th>
                      <th className="px-4 py-3 text-right">IP</th>
                      <th className="px-4 py-3 text-right">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {config.plays.map((p, i) => (
                      <tr key={p.id} className={`hover:bg-gray-50 ${p.result === "win" ? "bg-yellow-50" : ""}`}>
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{p.name || "—"}</td>
                        <td className="px-4 py-3 font-mono text-blue-600" dir="ltr">{p.phone}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${p.result === "win" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"}`}>
                            {p.result === "win" ? "🐑 فائز" : "❌ لم يفز"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-400 text-xs" dir="ltr">{p.ip}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleString("ar-TN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pro ideas */}
          <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-yellow-800 mb-3">💡 أفكار لتطوير اللعبة</h2>
            <ul className="space-y-2 text-sm text-yellow-900">
              <li>📱 <strong>التحقق عبر OTP</strong> — إرسال رمز تحقق لرقم الهاتف قبل اللعب (منع الغش)</li>
              <li>⏰ <strong>عداد تنازلي لعيد الأضحى</strong> — يُضاف للصفحة لزيادة التشويق</li>
              <li>🏆 <strong>عدد محدود للفوز يومياً</strong> — تحديد عدد الفائزين كل يوم</li>
              <li>📊 <strong>إحصائيات مباشرة</strong> — "تم تسليم 3 خراف اليوم" في أعلى الصفحة</li>
              <li>🔗 <strong>مشاركة النتيجة</strong> — زر مشاركة واتساب للخاسرين أيضاً</li>
              <li>🎵 <strong>أصوات مخصصة</strong> — صوت فوز احتفالي منفصل عن التدوير</li>
              <li>📍 <strong>التحقق من الموقع الجغرافي</strong> — السماح للعب فقط داخل تونس</li>
            </ul>
          </div>
        </>
      ) : null}
    </div>
  );
}
