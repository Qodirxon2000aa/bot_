import { useState } from "react";
import { useNavigate } from "react-router";
import { TopBar } from "@/app/components/ui/TopBar";
import { Card, CardContent } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import {
  Copy,
  Eye,
  ShoppingCart,
  Sparkles,
  CheckCircle2,
  Gift,
} from "lucide-react";

const GIFTS_DATA = [
  { id: "GIFT-001", name: "Golden Star",  image: "⭐", price: 15000,  category: "new", link: "https://t.me/gift/golden-star-001",  rarity: "Rare",      rarityVariant: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { id: "GIFT-002", name: "Blue Diamond", image: "💎", price: 45000,  category: "new", link: "https://t.me/gift/blue-diamond-002", rarity: "Epic",      rarityVariant: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { id: "GIFT-003", name: "Red Heart",    image: "❤️", price: 8000,   category: "old", link: "https://t.me/gift/red-heart-003",    rarity: "Common",    rarityVariant: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  { id: "GIFT-004", name: "Crown Royal",  image: "👑", price: 120000, category: "new", link: "https://t.me/gift/crown-royal-004",  rarity: "Legendary", rarityVariant: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { id: "GIFT-005", name: "Fire Bolt",    image: "🔥", price: 22000,  category: "old", link: "https://t.me/gift/fire-bolt-005",    rarity: "Uncommon",  rarityVariant: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  { id: "GIFT-006", name: "Ice Crystal",  image: "❄️", price: 30000,  category: "new", link: "https://t.me/gift/ice-crystal-006",  rarity: "Rare",      rarityVariant: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { id: "GIFT-007", name: "Magic Wand",   image: "🪄", price: 18000,  category: "old", link: "https://t.me/gift/magic-wand-007",   rarity: "Uncommon",  rarityVariant: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  { id: "GIFT-008", name: "Rainbow Gem",  image: "🌈", price: 55000,  category: "new", link: "https://t.me/gift/rainbow-gem-008",  rarity: "Epic",      rarityVariant: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
  { id: "GIFT-009", name: "Lucky Clover", image: "🍀", price: 12000,  category: "old", link: "https://t.me/gift/lucky-clover-009", rarity: "Common",    rarityVariant: "bg-green-500/10 text-green-500 border-green-500/20" },
  { id: "GIFT-010", name: "Thunder God",  image: "⚡", price: 88000,  category: "new", link: "https://t.me/gift/thunder-god-010",  rarity: "Legendary", rarityVariant: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
];

const FILTERS = [
  { key: "all", label: "Barcha giftlar" },
  { key: "new", label: "Yangi" },
  { key: "old", label: "Eski" },
];

export default function GiftsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  const filtered =
    activeFilter === "all"
      ? GIFTS_DATA
      : GIFTS_DATA.filter((g) => g.category === activeFilter);

  const handleCopy = (gift) => {
    navigator.clipboard.writeText(gift.link).catch(() => {});
    setCopiedId(gift.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Gifts" subtitle="Telegram sovg'alari bozori" />

      <div className="p-4 space-y-6 pb-20">

        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border
                ${
                  activeFilter === f.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent/50 text-muted-foreground border-border hover:bg-accent"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jami giftlar</p>
                  <p className="text-2xl font-bold">{GIFTS_DATA.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Yangi giftlar</p>
                  <p className="text-2xl font-bold">
                    {GIFTS_DATA.filter((g) => g.category === "new").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gifts grid */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {activeFilter === "all"
                  ? "Barcha giftlar"
                  : activeFilter === "new"
                  ? "Yangi giftlar"
                  : "Eski giftlar"}
              </h3>
              <span className="text-sm text-muted-foreground">{filtered.length} ta</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Hali giftlar yo'q</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filtered.map((gift) => (
                  <div
                    key={gift.id}
                    className="rounded-xl border border-border/50 overflow-hidden transition-all hover:border-border"
                  >
                    {/* Image — background bilan uyg'un, hech qanday ajraluvsiz */}
                    <div className="flex items-center justify-center py-6">
                      <span className="text-5xl select-none drop-shadow-sm">
                        {gift.image}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border/40 mx-3" />

                    {/* Info */}
                    <div className="p-3 space-y-2">
                      <div>
                        <p className="font-medium text-sm truncate">{gift.name}</p>
                        <div className="mt-0.5">
                          <Badge
                            variant="default"
                            className={`text-[10px] px-1.5 py-0 h-4 ${gift.rarityVariant}`}
                          >
                            {gift.rarity}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground/60 font-mono">
                        {gift.id}
                      </p>

                      <p className="font-semibold text-sm">
                        {gift.price.toLocaleString("uz-UZ")}{" "}
                        <span className="text-xs font-normal text-muted-foreground">UZS</span>
                      </p>

                      {/* Buttons */}
                      <div className="flex gap-1.5 pt-0.5">
                        <button
                          onClick={() => handleCopy(gift)}
                          title="Linkni nusxalash"
                          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all
                            ${
                              copiedId === gift.id
                                ? "bg-green-500/10 text-green-500 border-green-500/30"
                                : "text-muted-foreground border-border/60 hover:border-border hover:text-foreground"
                            }`}
                        >
                          {copiedId === gift.id
                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>

                        <button
                          title="Ko'rish"
                          className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 text-muted-foreground hover:border-border hover:text-foreground transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => navigate("/buy")}
                          className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Sotib ol
                        </button>
                      </div>
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