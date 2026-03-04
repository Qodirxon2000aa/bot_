import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTelegram } from "@/app/context/TelegramContext";
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
  Wallet,
} from "lucide-react";

const API_BASE = "https://tezpremium.uz/webapp/giftlar.php";

const FILTERS = [
  { key: "all",       label: "Barcha"    },
  { key: "cheap",     label: "Arzon ↑"   },
  { key: "expensive", label: "Qimmat ↓"  },
  { key: "new",       label: "Yangi"     },
  { key: "old",       label: "Eski"      },
];

export default function GiftsPage() {
  const navigate = useNavigate();
  const { apiUser } = useTelegram();

  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId]         = useState(null);
  const [gifts, setGifts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const userBalance = Number(apiUser?.balance || 0);

  const fetchGifts = async (type = "all") => {
    setLoading(true);
    setError(null);
    try {
      const url  = type === "all" ? API_BASE : `${API_BASE}?type=${type}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.ok) {
        setGifts(data.gifts || []);
      } else {
        setError("Ma'lumot olishda xatolik");
      }
    } catch {
      setError("Serverga ulanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts(activeFilter);
  }, [activeFilter]);

  const handleFilterChange = (key) => {
    if (key === activeFilter) return;
    setActiveFilter(key);
    setGifts([]);
  };

  const handleCopy = (gift) => {
    navigator.clipboard.writeText(gift.link).catch(() => {});
    setCopiedId(gift.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatName = (nftId) => {
    if (!nftId) return "Gift";
    return nftId.split("-")[0].replace(/([A-Z])/g, " $1").trim();
  };

  const canBuy = (price) => userBalance >= price;
  const minPrice = gifts.length > 0 ? Math.min(...gifts.map((g) => g.price)) : 0;
  const canAffordAny = gifts.length > 0 && userBalance >= minPrice;

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Gifts" subtitle="Telegram NFT sovg'alari" />

      <div className="p-3 space-y-4 pb-24">

        {/* ── Balance card ── */}
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs mb-1">Sizning balansingiz</p>
                <h2 className="text-2xl font-bold leading-none">
                  {userBalance.toLocaleString("uz-UZ")}
                  <span className="text-base font-normal ml-1">UZS</span>
                </h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            {!loading && gifts.length > 0 && !canAffordAny && (
              <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-white/80" />
                <p className="text-xs text-white/80">
                  Giftlar sotib olish uchun balansingizni to'ldiring
                </p>
                <button
                  onClick={() => navigate("/payment")}
                  className="ml-auto shrink-0 text-xs font-semibold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-all"
                >
                  To'ldirish
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Filter tabs ── */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => handleFilterChange(f.key)}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap
                ${activeFilter === f.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-accent/50 text-muted-foreground border-border hover:bg-accent"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

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
                  <p className="text-xs text-muted-foreground truncate">Eng arzon</p>
                  <p className="text-xl font-bold leading-none mt-0.5">
                    {loading || gifts.length === 0
                      ? "—"
                      : minPrice.toLocaleString("uz-UZ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Gifts grid ── */}
        <Card>
          <CardContent className="pt-4 px-3 pb-4">

            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base">
                {FILTERS.find((f) => f.key === activeFilter)?.label ?? "Giftlar"}
              </h3>
              <div className="flex items-center gap-2">
                {!loading && (
                  <span className="text-xs text-muted-foreground">{gifts.length} ta</span>
                )}
                <button
                  onClick={() => fetchGifts(activeFilter)}
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
                  onClick={() => fetchGifts(activeFilter)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium"
                >
                  <RefreshCw className="w-3 h-3" /> Qayta urinish
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && gifts.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Gift className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Bu kategoriyada giftlar yo'q</p>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && gifts.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {gifts.map((gift) => {
                  const affordable = canBuy(gift.price);
                  return (
                    <div
                      key={gift.id}
                      className={`rounded-xl border overflow-hidden transition-all
                        ${affordable ? "border-border/50" : "border-border/30 opacity-70"}`}
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
                            e.currentTarget.nextElementSibling.style.display = "flex";
                          }}
                        />
                        <div
                          className="absolute inset-0 items-center justify-center"
                          style={{ display: "none" }}
                        >
                          <Gift className="w-10 h-10 text-muted-foreground/30" />
                        </div>

                        {!affordable && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <div className="bg-background/90 rounded-lg px-2 py-1 flex items-center gap-1">
                              <Wallet className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground font-medium">
                                Balans yetmaydi
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-border/30" />

                      {/* Info */}
                      <div className="p-2.5 space-y-1.5">
                        <p className="font-semibold text-xs leading-tight truncate">
                          {formatName(gift.nft_id)}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 truncate">
                          {gift.model} · {gift.backdrop}
                        </p>
                        <p className="text-[10px] text-muted-foreground/40 font-mono truncate">
                          #{gift.nft_id}
                        </p>

                        <p className={`font-bold text-sm ${affordable ? "" : "text-red-500/70"}`}>
                          {gift.price.toLocaleString("uz-UZ")}
                          <span className="font-normal text-xs text-muted-foreground ml-0.5">UZS</span>
                        </p>

                        <p className="text-[10px] text-muted-foreground/50">{gift.created_at}</p>

                        {/* Copy + View */}
                        <div className="flex gap-1.5 pt-0.5">
                          <button
                            onClick={() => handleCopy(gift)}
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
                            onClick={() => window.open(gift.link, "_blank")}
                            className="flex-1 flex items-center justify-center gap-1 h-7 rounded-lg border border-border/60 text-muted-foreground text-[11px] font-medium hover:border-border transition-all"
                          >
                            <Eye className="w-3 h-3 shrink-0" />
                            <span>View</span>
                          </button>
                        </div>

                        {/* Buy */}
                        <button
                          onClick={() => affordable && navigate("/buy", { state: { gift } })}
                          disabled={!affordable}
                          className={`w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all
                            ${affordable
                              ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                              : "bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                        >
                          {affordable
                            ? <><ShoppingCart className="w-3.5 h-3.5 shrink-0" />Sotib olish</>
                            : <><Wallet className="w-3.5 h-3.5 shrink-0" />Balans yetmaydi</>
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}