import { useState } from "react";
import { useLocation } from "wouter";
import { useGetMe, useRedeemCode, useListProducts, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ShoppingBag, Wallet, Gift, Sparkles, BadgePercent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function discounted(cents: number, pct: number): number {
  const p = Math.max(0, Math.min(pct, 95));
  return Math.round(cents * (1 - p / 100));
}

export default function Store() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: me } = useGetMe({ query: { refetchInterval: 5000, queryKey: getGetMeQueryKey() } });
  const { data: products = [] } = useListProducts();
  const redeem = useRedeemCode();
  const [code, setCode] = useState("");

  const onRedeem = async () => {
    if (!code.trim()) return;
    try {
      const res = await redeem.mutateAsync({ data: { code: code.trim() } });
      toast({ title: res.message, description: `رصيدك الجديد: ${res.newBalance} جولة` });
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      setCode("");
    } catch (e: any) {
      toast({ title: "تعذر استبدال الكود", description: e?.data?.error || "حاول مجدداً", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/")} className="gap-2">
              <ArrowRight className="w-4 h-4" /> الرئيسية
            </Button>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">المتجر</h1>
          </div>
          <div className="flex items-center gap-2 px-4 h-10 rounded-md bg-primary/10 border border-primary/30">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold">{me?.roundsBalance ?? 0}</span>
            <span className="text-muted-foreground text-sm">جولة</span>
          </div>
        </header>

        <Card className="glass-panel border-primary/20 bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary"><ShoppingBag className="w-5 h-5" /> شراء جولات</CardTitle>
            <CardDescription>اختر الباقة المناسبة. ستحصل على كود استبدال عبر البريد الإلكتروني بعد الدفع.</CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">لا توجد منتجات معروضة حالياً.</div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {products.map((p) => {
                  const hasDiscount = (p.discountPercent ?? 0) > 0;
                  const finalCents = hasDiscount ? discounted(p.priceCents, p.discountPercent) : p.priceCents;
                  return (
                    <div key={p.id} className="relative rounded-xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-background p-5 flex flex-col items-center text-center gap-3 hover:border-primary transition-colors">
                      {p.badge && (
                        <div className="absolute -top-3 right-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> {p.badge}
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute -top-3 left-3 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-500/30">
                          <BadgePercent className="w-3 h-3" /> خصم {p.discountPercent}%
                        </div>
                      )}
                      <div className="text-lg font-bold text-white">{p.name}</div>
                      {p.description && <div className="text-sm text-muted-foreground">{p.description}</div>}
                      <div className="text-5xl font-display font-bold text-primary text-glow">{p.rounds}</div>
                      <div className="text-muted-foreground text-sm">{p.rounds === 1 ? "جولة" : "جولات"}</div>
                      {hasDiscount ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="text-sm text-muted-foreground line-through">{formatPrice(p.priceCents, p.currency)}</div>
                          <div className="text-3xl font-bold text-emerald-400 drop-shadow">{formatPrice(finalCents, p.currency)}</div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-white">{formatPrice(p.priceCents, p.currency)}</div>
                      )}
                      {p.payhipUrl ? (
                        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <a href={p.payhipUrl} target="_blank" rel="noreferrer">شراء عبر Payhip</a>
                        </Button>
                      ) : (
                        <Button disabled className="w-full">قريباً</Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/20 bg-background/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary"><Gift className="w-5 h-5" /> استبدال كود</CardTitle>
            <CardDescription>أدخل كود الاستبدال للحصول على جولاتك. يستخدم الكود مرة واحدة فقط لكل حساب.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="أدخل الكود هنا"
                className="text-lg h-12 bg-background/50 border-primary/20 uppercase tracking-wider"
              />
              <Button onClick={onRedeem} disabled={redeem.isPending || !code.trim()} className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                {redeem.isPending ? "..." : "استبدال"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
