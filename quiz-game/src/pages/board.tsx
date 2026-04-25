import { useState } from "react";
import { useLocation } from "wouter";
import { useGetActiveGame, useUpdateActiveGame, useEndActiveGame, getGetActiveGameQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Home, RefreshCw, Plus, Minus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type GQ = { id: number; text: string; answer: string; image?: string | null; points: number };
type GC = { id: number; name: string; imageUrl?: string | null; questions: GQ[] };
type GT = { id: string; name: string; score: number };

const TEAM_COLORS = ["#D4AF37", "#22D3EE", "#A78BFA", "#F472B6"];

function DigitalScore({ score }: { score: number }) {
  // Pad to 4 chars; preserve sign separately
  const sign = score < 0 ? "-" : "";
  const abs = Math.abs(score);
  const padded = abs.toString().padStart(4, "0");
  return (
    <div className="flex items-center justify-center gap-0.5 font-mono">
      {sign && <span className="text-2xl md:text-3xl text-primary/70">{sign}</span>}
      {padded.split("").map((d, i) => (
        <span key={i} className="relative inline-flex items-center justify-center w-7 md:w-9 lg:w-11 h-10 md:h-12 lg:h-14 rounded-md bg-black/60 border border-primary/20">
          <span className="absolute inset-0 flex items-center justify-center text-primary/10 text-2xl md:text-3xl lg:text-4xl font-bold">8</span>
          <motion.span key={d} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="relative text-2xl md:text-3xl lg:text-4xl font-bold text-primary text-glow">
            {d}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

export default function Board() {
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const { data: game, isLoading } = useGetActiveGame();
  const update = useUpdateActiveGame();
  const end = useEndActiveGame();
  const [selected, setSelected] = useState<{ q: GQ; cat: GC } | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">جاري التحميل...</div>;
  if (!game) {
    setTimeout(() => setLocation("/"), 0);
    return null;
  }

  const teams = game.teams as GT[];
  const categories = game.categories as GC[];
  const used = (game.usedQuestionIds as number[]) || [];

  const persist = async (changes: { teams?: GT[]; usedQuestionIds?: number[] }) => {
    await update.mutateAsync({ data: changes });
    qc.invalidateQueries({ queryKey: getGetActiveGameQueryKey() });
  };

  const onCellClick = (cat: GC, q: GQ) => {
    if (used.includes(q.id)) return;
    setSelected({ q, cat });
    setShowAnswer(false);
  };

  const closeModal = async () => {
    if (selected && !used.includes(selected.q.id)) {
      await persist({ usedQuestionIds: [...used, selected.q.id] });
    }
    setSelected(null);
  };

  const updateScore = async (teamId: string, delta: number) => {
    const newTeams = teams.map((t) => (t.id === teamId ? { ...t, score: t.score + delta } : t));
    await persist({ teams: newTeams });
  };

  const endGame = async () => {
    await end.mutateAsync();
    qc.invalidateQueries({ queryKey: getGetActiveGameQueryKey() });
    setLocation("/");
  };

  const renderCategoryCell = (cat: GC) => {
    const sorted = [...cat.questions].sort((a, b) => a.points - b.points);
    const left = sorted.slice(0, 3);
    const right = sorted.slice(3, 6);
    const renderQ = (q: GQ) => {
      const isUsed = used.includes(q.id);
      return (
        <motion.button
          key={q.id}
          whileHover={!isUsed ? { scale: 1.05 } : {}}
          whileTap={!isUsed ? { scale: 0.95 } : {}}
          onClick={() => onCellClick(cat, q)}
          className={`flex-1 min-h-16 flex items-center justify-center rounded-lg border-2 transition-colors ${
            isUsed ? "bg-background/20 border-white/5 text-white/15 cursor-not-allowed line-through"
                   : "bg-card/50 border-primary/30 text-primary hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_12px_rgba(212,175,55,0.3)]"
          }`}
        >
          <span className="text-xl md:text-2xl lg:text-3xl font-display font-bold">{isUsed ? "✕" : q.points}</span>
        </motion.button>
      );
    };
    const hasImg = !!cat.imageUrl;
    return (
      <div key={cat.id} className="bg-background/30 rounded-xl border border-primary/20 p-2 md:p-3 flex items-stretch gap-2 md:gap-3 min-h-[140px]">
        <div className="flex flex-col gap-2 flex-1">{right.map(renderQ)}</div>
        <div
          className={`flex items-center justify-center px-2 md:px-3 min-w-[90px] md:min-w-[120px] rounded-lg border border-primary/40 overflow-hidden relative shadow-inner ${hasImg ? "" : "bg-primary/10"}`}
          style={hasImg ? { backgroundImage: `url(${cat.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          title={cat.name}
        >
          {hasImg ? (
            <span className="sr-only">{cat.name}</span>
          ) : (
            <h2 className="text-base md:text-xl lg:text-2xl font-display font-bold text-primary text-center leading-tight relative z-10">{cat.name}</h2>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1">{left.map(renderQ)}</div>
      </div>
    );
  };

  const awardToTeam = async (teamId: string, points: number) => {
    if (!selected) return;
    const newTeams = teams.map((t) => (t.id === teamId ? { ...t, score: t.score + points } : t));
    const newUsed = used.includes(selected.q.id) ? used : [...used, selected.q.id];
    await persist({ teams: newTeams, usedQuestionIds: newUsed });
    setSelected(null);
    setShowAnswer(false);
  };

  const skipNoAnswer = async () => {
    if (!selected) return;
    const newUsed = used.includes(selected.q.id) ? used : [...used, selected.q.id];
    await persist({ usedQuestionIds: newUsed });
    setSelected(null);
    setShowAnswer(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between p-3 md:p-4 border-b border-white/5 bg-background/60 backdrop-blur">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground hover:text-primary">
            <Home className="w-4 h-4 ml-2" /> الرئيسية
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(true)} className="text-muted-foreground hover:text-destructive">
            <RefreshCw className="w-4 h-4 ml-2" /> إنهاء الجولة
          </Button>
        </div>
        <h1 className="text-xl md:text-2xl font-display font-bold text-primary text-glow">سين جيم</h1>
      </header>

      {/* Scoreboard at top with digital counters */}
      <section className="border-b border-white/5 bg-gradient-to-b from-black/40 to-transparent p-3 md:p-4">
        <div className="w-full max-w-[1800px] mx-auto grid gap-3" style={{ gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))` }}>
          {teams.map((team, i) => {
            const color = TEAM_COLORS[i % TEAM_COLORS.length];
            return (
              <div key={team.id} className="rounded-xl bg-black/40 border border-white/10 overflow-hidden shadow-[0_0_24px_rgba(0,0,0,0.4)]">
                <div className="px-3 py-2 flex items-center justify-between border-b border-white/10" style={{ background: `linear-gradient(90deg, ${color}22, transparent)` }}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                    <h3 className="text-sm md:text-lg font-bold text-white/90 truncate">{team.name}</h3>
                  </div>
                  <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">SCORE</div>
                </div>
                <div className="px-2 py-3 flex items-center justify-center bg-black/40">
                  <DigitalScore score={team.score} />
                </div>
                <div className="grid grid-cols-2 h-9 md:h-10">
                  <button onClick={() => updateScore(team.id, -100)} className="flex items-center justify-center gap-1 hover:bg-destructive/15 text-white/60 hover:text-destructive text-sm border-l border-white/10">
                    <Minus className="w-4 h-4" /> 100
                  </button>
                  <button onClick={() => updateScore(team.id, 100)} className="flex items-center justify-center gap-1 hover:bg-emerald-500/15 text-white/60 hover:text-emerald-400 text-sm">
                    <Plus className="w-4 h-4" /> 100
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <main className="flex-1 p-3 md:p-6 flex flex-col justify-center">
        <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {categories.slice(0, 3).map(renderCategoryCell)}
          {categories.slice(3, 6).map(renderCategoryCell)}
        </div>
      </main>

      <AnimatePresence>
        {selected && (
          <Dialog open={true} onOpenChange={(o) => !o && closeModal()}>
            <DialogContent className="max-w-5xl w-[90vw] min-h-[60vh] flex flex-col glass-panel border-primary/30 p-0 overflow-hidden">
              <div className="bg-primary/10 p-4 md:p-6 flex justify-between items-center border-b border-primary/20">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">{selected.cat.name}</h2>
                <div className="text-2xl md:text-3xl font-display font-bold text-primary">{selected.q.points} نقطة</div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center">
                <AnimatePresence mode="wait">
                  {!showAnswer ? (
                    <motion.div key="q" initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, rotateX: -90 }} className="flex flex-col items-center gap-6 w-full">
                      <h3 className="text-3xl md:text-5xl font-display font-bold text-white leading-tight">{selected.q.text}</h3>
                      {selected.q.image && (
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <img src={selected.q.image} alt="" className="max-h-[35vh] rounded-lg object-contain" />
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="a" initial={{ opacity: 0, rotateX: 90 }} animate={{ opacity: 1, rotateX: 0 }} className="flex flex-col items-center gap-6 w-full">
                      <div className="text-xl text-muted-foreground">الجواب الصحيح</div>
                      <h3 className="text-4xl md:text-6xl font-display font-bold text-primary text-glow leading-tight">{selected.q.answer}</h3>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-4 md:p-6 bg-black/30 border-t border-white/5 flex flex-col items-center gap-4">
                {!showAnswer ? (
                  <Button onClick={() => setShowAnswer(true)} className="h-14 px-10 text-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(212,175,55,0.4)]">كشف الجواب</Button>
                ) : (
                  <div className="w-full flex flex-col items-center gap-3">
                    <div className="text-sm md:text-base text-white/70 font-bold">من أجاب إجابة صحيحة؟ امنح الفريق <span className="text-primary">{selected.q.points}</span> نقطة</div>
                    <div className="grid gap-2 w-full max-w-3xl" style={{ gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))` }}>
                      {teams.map((t, i) => {
                        const color = TEAM_COLORS[i % TEAM_COLORS.length];
                        return (
                          <button
                            key={t.id}
                            onClick={() => awardToTeam(t.id, selected.q.points)}
                            className="group relative rounded-xl p-3 md:p-4 border-2 border-white/10 hover:border-white/40 bg-black/40 hover:bg-black/60 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            style={{ boxShadow: `inset 0 0 0 1px ${color}33` }}
                          >
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                              <span className="text-base md:text-lg font-bold text-white/90 truncate">{t.name}</span>
                            </div>
                            <div className="text-center text-emerald-400 font-bold text-lg md:text-xl">+{selected.q.points}</div>
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      onClick={skipNoAnswer}
                      variant="outline"
                      className="h-11 px-6 text-base font-bold border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      تخطّي بدون نقاط
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Dialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <DialogContent>
          <DialogHeader><DialogTitle>إنهاء الجولة</DialogTitle></DialogHeader>
          <div className="py-4 text-muted-foreground">هل تريد إنهاء الجولة الحالية والعودة للرئيسية؟ لن يتم استرداد رصيد الجولة.</div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmEnd(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={endGame}>نعم، إنهاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
