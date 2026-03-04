import { useState } from 'react';
import { useTelegram } from '@/app/context/TelegramContext'; // ← changed context
import { TopBar } from '@/app/components/ui/TopBar';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ChipGroup, Chip } from '@/app/components/ui/Chip';
import { History, Sparkles, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { format, parse } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';

// Backend → Frontend status mapping
const statusMap: Record<string, { label: string; variant: string; icon: JSX.Element | null }> = {
  Successful: {
    label: 'Tasdiqlangan',
    variant: 'success',
    icon: <CheckCircle2 className="w-4 h-4 text-success" />,
  },
  Pending: {
    label: 'Jarayonda',
    variant: 'warning',
    icon: <Loader2 className="w-4 h-4 text-warning animate-spin" />,
  },
  Failed: {
    label: 'Bekor qilingan',
    variant: 'destructive',
    icon: <XCircle className="w-4 h-4 text-destructive" />,
  },
  // add more statuses if your backend sends them
};

type FilterType = 'all' | 'completed' | 'pending' | 'failed';

interface Order {
  order_id: number | string;
  amount: number;       // stars
  summa: number;        // total UZS
  sent: string;         // @username
  status: string;
  type: string;
  date: string;         // "12.01.2026 | 12:03"
}

export function HistoryPage() {
  const { orders, loading } = useTelegram();

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Map backend status → frontend friendly status
  const normalizeStatus = (backendStatus: string) => {
    const s = backendStatus.trim();
    return statusMap[s]?.label || 'unknown';
  };

  const getStatusConfig = (backendStatus: string) => {
    const s = backendStatus.trim();
    return statusMap[s] || {
      label: 'unknown',
      variant: 'default',
      icon: null,
    };
  };

  const parseDate = (dateStr: string) => {
    // "12.01.2026 | 12:03"  →  try to parse
    try {
      const [datePart, timePart] = dateStr.split(' | ');
      const [dd, mm, yyyy] = datePart.split('.');
      return new Date(`${yyyy}-${mm}-${dd}T${timePart}:00`);
    } catch (err) {
      return new Date(dateStr); // fallback
    }
  };

  const formatUZS = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount);
  };

  // Filter orders
  const filteredOrders = orders.filter((order: Order) => {
    if (filter === 'all') return true;
    const normStatus = normalizeStatus(order.status);
    return normStatus === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Tranzaksiyalar tarixi" subtitle="Siz bu yerdan barcha o'tkazmalarni ko'ra olasiz!" />

      <div className="p-4 space-y-5">
        {/* Filters */}
        <ChipGroup>
          <Chip selected={filter === 'all'}    onClick={() => setFilter('all')}>Hamamsi</Chip>
          <Chip selected={filter === 'completed'} onClick={() => setFilter('completed')}>Tasdiqlangan</Chip>
          <Chip selected={filter === 'pending'}   onClick={() => setFilter('pending')}>Jarayonda</Chip>
          <Chip selected={filter === 'failed'}    onClick={() => setFilter('failed')}>Bekor qilingan</Chip>
        </ChipGroup>

        {/* Transaction List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-3">
            {filteredOrders.map((tx: Order) => {
              const statusCfg = getStatusConfig(tx.status);
              const dateObj = parseDate(tx.date);

              // Extract username, try to make display name
              const username = tx.sent.startsWith('@') ? tx.sent : `@${tx.sent}`;
              const displayName = username.replace('@', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'User';

              return (
                <Card
                  key={tx.order_id}
                  onClick={() => setSelectedOrder(tx)}
                  className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {displayName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{displayName}</p>
                        <p className="text-sm text-muted-foreground">{username}</p>
                      </div>
                      {statusCfg.icon}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-telegram-gold" />
                          <span className="font-medium">{tx.amount}</span>
                        </div>
                        <div className="text-muted-foreground font-medium">
                          {formatUZS(tx.summa)} UZS
                        </div>
                      </div>
                      <Badge
                        variant={statusCfg.variant as any}
                        className="text-[10px] uppercase tracking-wide"
                      >
                        {statusCfg.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {format(dateObj, 'MMM d, yyyy • HH:mm')}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<History className="w-16 h-16 text-muted-foreground/70" />}
            title="No transactions yet"
            description={
              filter === 'all'
                ? "Your purchase history will appear here"
                : `No ${filter} transactions found`
            }
          />
        )}
      </div>

      {/* Details Dialog */}
      <Dialog.Root open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md z-50 max-h-[85vh] overflow-y-auto rounded-2xl">
            {selectedOrder && (() => {
              const statusCfg = getStatusConfig(selectedOrder.status);
              const dateObj = parseDate(selectedOrder.date);
              const username = selectedOrder.sent.startsWith('@') ? selectedOrder.sent : `@${selectedOrder.sent}`;
              const displayName = username.replace('@', '');

              return (
                <Card className="shadow-2xl border-0">
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <Dialog.Title className="text-xl font-semibold">
                        {displayName}
                      </Dialog.Title>
                      <Dialog.Description className="text-sm text-muted-foreground mt-1">
                        {username}
                      </Dialog.Description>
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <Badge
                        variant={statusCfg.variant as any}
                        className="text-base px-5 py-1.5 flex items-center gap-2"
                      >
                        {statusCfg.icon}
                        <span className="capitalize font-medium">{statusCfg.label}</span>
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 bg-accent/30 rounded-xl p-4">
                      <div className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">Buyurtma id</span>
                        <span className="font-mono">{selectedOrder.order_id}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">Stars</span>
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-telegram-gold" />
                          <span className="font-semibold">{selectedOrder.amount}</span>
                        </div>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">Summa</span>
                        <span className="font-bold">{formatUZS(selectedOrder.summa)} UZS</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Sana</span>
                        <span>{format(dateObj, 'dd MMM yyyy • HH:mm')}</span>
                      </div>
                    </div>

                    {/* Simple status note */}
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      {statusCfg.label === 'completed' && "Transaction completed successfully ✓"}
                      {statusCfg.label === 'pending' && "Waiting for processing..."}
                      {statusCfg.label === 'failed' && "Transaction was not completed"}
                    </div>

                    <Dialog.Close asChild>
                      <button className="w-full h-11 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/90 transition-colors">
                        Yopish
                      </button>
                    </Dialog.Close>
                  </div>
                </Card>
              );
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}