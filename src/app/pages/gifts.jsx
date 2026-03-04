import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { TopBar } from "@/app/components/ui/TopBar";
import { Card, CardContent } from "@/app/components/ui/Card";
import {
  Copy,
  Eye,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  Gift,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_URL = "https://tezpremium.uz/webapp/giftlar.php";

// const FILTERS = [
//   { key: "all", label: "Barcha" },
//   { key: "new", label: "Yangi" },
//   { key: "old", label: "Eski"  },
// ];

export default function GiftsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId]         = useState(null);
  const [gifts, setGifts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [apiType, setApiType]           = useState("all"); // API dan kelgan type

  const fetchGifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      if (data.ok) {
        setGifts(data.gifts || []);
        setApiType(data.type || "all");
        // API type ga qarab filter ni avtomatik o'rnatish
        if (data.type === "new" || data.type === "old") {
          setActiveFilter(data.type);
        }
      } else {
        setError("Ma'lumot olishda xatolik");
      }
    } catch (e) {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const filtered =
    activeFilter === "all"
      ? gifts
      : gifts.filter((g) => g.type === activeFilter ||
          // API da type field bo'lmasa, apiType dan foydalanamiz
          (apiType === activeFilter));

  // Agar API da har bir gift uchun type yo'q bo'lsa, 
  // global type ga qarab filter qilamiz
  const filteredGifts = activeFilter === "all"
    ? gifts
    : activeFilter === apiType
      ? gifts
      : [];

  const handleCopy = (gift) => {
    navigator.clipboard.writeText(gift.link).catch(() => {});
    setCopiedId(gift.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // NFT ID dan qisqa nom olish (masalan: "SakuraFlower-69632" → "Sakura Flower")
  const formatName = (nftId) => {
    if (!nftId) return "Gift";
    const base = nftId.split("-")[0]; // raqamni olib tashlash
    // CamelCase ni bo'sh joyga aylantirish
    return base.replace(/([A-Z])/g, " $1").trim();
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Gifts" subtitle="Telegram NFT sovg'alari" />

      <div className="p-3 space-y-4 pb-24">

        {/* ── Filter tabs ── */}
        {/* <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                ${activeFilter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-accent/50 text-muted-foreground border-border hover:bg-accent"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div> */}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-pink-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Jami giftlar</p>
                  <p className="text-xl font-bold leading-none mt-0.5">
                    {loading ? "—" : gifts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">Narx (eng kam)</p>
                  <p className="text-xl font-bold leading-none mt-0.5">
                    {loading || gifts.length === 0
                      ? "—"
                      : `${Math.min(...gifts.map((g) => g.price)).toLocaleString("uz-UZ")}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Main content ── */}
        <Card>
          <CardContent className="pt-4 px-3 pb-4">

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">
                {activeFilter === "all" ? "Barcha giftlar"
                  : activeFilter === "new" ? "Barcha giftlar"
                  : "Eski giftlar"}
              </h3>
              <div className="flex items-center gap-2">
                {!loading && (
                  <span className="text-xs text-muted-foreground">
                    {filteredGifts.length} ta
                  </span>
                )}
                <button
                  onClick={fetchGifts}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title="Yangilash"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Yuklanmoqda...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mb-3 text-red-500/60" />
                <p className="text-sm mb-3">{error}</p>
                <button
                  onClick={fetchGifts}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Qayta urinish
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredGifts.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Gift className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Bu kategoriyada giftlar yo'q</p>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && filteredGifts.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {filteredGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="rounded-xl border border-border/50 overflow-hidden"
                  >
                    {/* Photo */}
                    <div className="relative w-full aspect-square bg-accent/20">
                      <img
                        src={gift.photo}
                        alt={formatName(gift.nft_id)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                      {/* Fallback emoji */}
                      <div
                        className="absolute inset-0 items-center justify-center hidden"
                        style={{ display: "none" }}
                      >
                        <Gift className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    </div>

                    {/* Thin divider */}
                    <div className="h-px bg-border/30" />

                    {/* Info */}
                    <div className="p-2.5 space-y-1.5">

                      {/* Name */}
                      <p className="font-semibold text-xs leading-tight truncate">
                        {formatName(gift.nft_id)}
                      </p>

                      {/* Model + Backdrop */}
                      <p className="text-[10px] text-muted-foreground/70 truncate">
                        {gift.model} · {gift.backdrop}
                      </p>

                      {/* NFT ID */}
                      <p className="text-[10px] text-muted-foreground/40 font-mono truncate">
                        #{gift.nft_id}
                      </p>

                      {/* Price */}
                      <p className="font-bold text-sm">
                        {gift.price.toLocaleString("uz-UZ")}
                        <span className="font-normal text-xs text-muted-foreground ml-0.5">UZS</span>
                      </p>

                      {/* Date */}
                      <p className="text-[10px] text-muted-foreground/50">{gift.created_at}</p>

                      {/* Row 1: Copy + View */}
                      <div className="flex gap-1.5 pt-0.5">
                        <button
                          onClick={() => handleCopy(gift)}
                          title="Linkni nusxalash"
                          className={`flex-1 flex items-center justify-center gap-1 h-7 rounded-lg border text-[11px] font-medium transition-all
                            ${copiedId === gift.id
                              ? "bg-green-500/10 text-green-500 border-green-500/30"
                              : "text-muted-foreground border-border/60 hover:border-border"
                            }`}
                        >
                          {copiedId === gift.id
                            ? <><CheckCircle2 className="w-3 h-3 shrink-0" /><span>OK</span></>
                            : <><Copy className="w-3 h-3 shrink-0" /><span>Copy</span></>
                          }
                        </button>

                        <button
                          title="Ko'rish"
                          onClick={() => window.open(gift.link, "_blank")}
                          className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg border border-border/60 text-muted-foreground text-[11px] font-medium hover:border-border transition-all"
                        >
                          <Eye className="w-3 h-3 shrink-0" />
                          <span>View</span>
                        </button>
                      </div>

                      {/* Row 2: Buy full width */}
                      <button
                        onClick={() => navigate("/buy", { state: { gift } })}
                        className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                        Sotib olish
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}