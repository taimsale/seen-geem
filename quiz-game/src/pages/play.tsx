import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe, useListCategories, useStartGame, getGetMeQueryKey, getGetActiveGameQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, Trash2, CircleCheck, Wallet, Play, Users, Layers, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

function errMsg(e: unknown, fallback = "حدث خطأ غير متوقع"): string {
  const x = e as { data?: { error?: string }; message?: string } | null;
  const fromBody = x?.data?.error;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody;
  if (typeof x?.message === "string" && x.message.trim()) return x.message;
  return fallback;
}

export default function PlaySetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: me } = useGetMe({ query: { refetchInterval: 5000, queryKey: getGetMeQueryKey() } });
  const { data: categories = [] } = useListCategories();
  const startGame = useStartGame();

  const [teamNames, setTeamNames] = useState<string[]>(["الفريق الأول", "الفريق الثاني"]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const eligible = categories.filter((c) => c.questionCount >= 6);

  useEffect(() => {
    if (selectedIds.length === 0 && eligible.length >= 6) {
      setSelectedIds(eligible.slice(0, 6).map((c) => c.id));
    }
  }, [eligible.length]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) {
        toast({ title: "يمكنك اختيار 6 تصنيفات فقط", variant: "destructive" });
        return prev;
      }
      return [...prev, id];
    });
  };

  const onStart = async () => {
    if (selectedIds.length !== 6) {
      toast({ title: "اختر 6 تصنيفات بالضبط", variant: "destructive" }); return;
    }
    if (!me || me.roundsBalance < 1) {
      toast({ title: "لا توجد جولات متاحة", description: "اشترِ جولات من المتجر", variant: "destructive" });
      setLocation("/store"); return;
    }
    try {
      await startGame.mutateAsync({
        data: {
          teams: teamNames.map((n, i) => ({ id: `t${i}`, name: n.trim() || `الفريق ${i + 1}` })),
          categoryIds: selectedIds,
        },
      });
      qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
      qc.invalidateQueries({ queryKey: getGetActiveGameQueryKey() });
      setLocation("/board");
    } catch (e) {
      toast({ title: "تعذر بدء اللعبة", description: errMsg(e, "حاول مجدداً"), variant: "destructive" });
    }
  };

  return (
    <div className="relative min-h-screen bg-background p-4 md:p-8 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/")} className="gap-2"><ArrowRight className="w-4 h-4" /> الرئيسية</Button>
            <div>
              <h1 className="text-2xl md:text-4xl font-display font-bold text-primary text-glow">إعداد اللعبة</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">حدّد فرقك واختر تصنيفاتك المفضلة لتبدأ التحدي</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 h-11 rounded-full bg-primary/10 border border-primary/30 shadow-inner">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold">{me?.roundsBalance ?? 0}</span>
            <span className="text-muted-foreground text-sm">جولة</span>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-panel border-primary/20 bg-background/60 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-2"><Users className="w-6 h-6" /> الفرق المشاركة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <Label className="text-lg text-primary">الفرق (٢ - ٤ فرق)</Label>
              <div className="grid gap-3">
                {teamNames.map((name, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input value={name} onChange={(e) => setTeamNames(teamNames.map((n, j) => (j === i ? e.target.value : n)))} className="text-lg h-12 bg-background/50 border-primary/20 focus:border-primary" />
                    {teamNames.length > 2 && (
                      <Button variant="outline" size="icon" onClick={() => setTeamNames(teamNames.filter((_, j) => j !== i))} className="h-12 w-12 border-destructive/50 text-destructive hover:bg-destructive/20">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {teamNames.length < 4 && (
                <Button variant="outline" onClick={() => setTeamNames([...teamNames, `الفريق ${teamNames.length + 1}`])} className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/10">
                  <Plus className="w-4 h-4 ml-2" /> إضافة فريق
                </Button>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="text-lg text-primary flex items-center gap-2"><Layers className="w-5 h-5" /> اختر 6 تصنيفات</Label>
                <span className={`text-sm font-bold px-3 py-1 rounded-full border ${selectedIds.length === 6 ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-primary/30 text-primary bg-primary/10"}`}>
                  {selectedIds.length}/6
                </span>
              </div>
              {eligible.length < 6 ? (
                <div className="text-muted-foreground text-sm bg-background/30 border border-white/5 rounded-lg p-4">عدد التصنيفات المتاحة (التي تحتوي على 6 أسئلة على الأقل) غير كافٍ. اطلب من المسؤول إضافة المزيد.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {eligible.map((c) => {
                    const sel = selectedIds.includes(c.id);
                    return (
                      <button key={c.id} onClick={() => toggle(c.id)}
                        className={`group relative aspect-[4/3] rounded-xl border-2 text-center transition-all overflow-hidden ${sel ? "border-primary shadow-[0_0_24px_rgba(212,175,55,0.45)]" : "border-white/10 hover:border-primary/60 hover:shadow-[0_0_18px_rgba(212,175,55,0.25)]"}`}
                        style={c.imageUrl ? { backgroundImage: `url(${c.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(15,20,34,0.6))" }}
                      >
                        <div className={`absolute inset-0 transition-opacity ${sel ? "bg-gradient-to-t from-primary/40 via-black/30 to-black/10" : "bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/70"}`} />
                        {sel && (
                          <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                            <CircleCheck className="w-5 h-5" />
                          </div>
                        )}
                        <div className="relative z-10 h-full flex flex-col items-center justify-end p-3 gap-1">
                          <div className={`font-bold text-base md:text-lg ${sel ? "text-white" : "text-white/95"} drop-shadow-lg`}>{c.name}</div>
                          <div className="text-xs text-white/70">{c.questionCount} سؤال</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Button onClick={onStart} disabled={startGame.isPending || selectedIds.length !== 6 || (me?.roundsBalance ?? 0) < 1}
              className="w-full h-16 text-2xl font-bold font-display tracking-wider bg-gradient-to-l from-primary to-amber-400 text-primary-foreground hover:from-primary/90 hover:to-amber-300 shadow-[0_0_30px_rgba(212,175,55,0.5)] disabled:opacity-50 gap-3 rounded-xl">
              {startGame.isPending ? <><Sparkles className="w-6 h-6 animate-pulse" /> جاري التحضير...</> : <><Play className="w-6 h-6" /> ابدأ اللعبة (تستهلك جولة واحدة)</>}
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
