import { useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trophy, Settings, ShoppingBag, LogOut, Wallet, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  const { data: me } = useGetMe({ query: { refetchInterval: 5000, queryKey: getGetMeQueryKey() } });

  const tiles: { key: string; label: string; sub: string; icon: React.ReactNode; onClick: () => void; admin?: boolean }[] = [
    { key: "play", label: "ابدأ اللعبة", sub: "اختر الفرق والتصنيفات وابدأ", icon: <Play className="w-12 h-12" />, onClick: () => setLocation("/play") },
    { key: "store", label: "المتجر", sub: "اشترِ جولات أو استبدل كوداً", icon: <ShoppingBag className="w-12 h-12" />, onClick: () => setLocation("/store") },
    { key: "admin", label: "لوحة التحكم", sub: "إدارة المحتوى والمستخدمين", icon: <Settings className="w-12 h-12" />, onClick: () => setLocation("/admin"), admin: true },
  ];

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <header className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-background/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 w-12 h-12 rounded-full flex items-center justify-center border border-primary/40 shadow-[0_0_24px_rgba(212,175,55,0.3)]">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary text-glow">سين جيم</h1>
            <p className="text-xs md:text-sm text-muted-foreground">مرحباً، {me?.name || me?.email || "ضيف"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-4 h-10 rounded-full bg-primary/10 border border-primary/30 shadow-inner">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-lg">{me?.roundsBalance ?? 0}</span>
            <span className="text-muted-foreground text-sm">جولة</span>
          </div>
          <Button variant="ghost" onClick={() => signOut()} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" /> خروج
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-10">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs md:text-sm font-bold backdrop-blur"
            >
              <Sparkles className="w-3.5 h-3.5" />
              تجربة معرفة عربية بطعم الجوائز الكبرى
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-display font-bold text-primary text-glow leading-tight"
            >
              اختر وجهتك
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
            >
              جاهز لجولة جديدة من التحدي والمعرفة بين أصدقائك وعائلتك؟
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {tiles.map((t, i) => {
              if (t.admin && !me?.isAdmin) return null;
              return (
                <motion.button
                  key={t.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={t.onClick}
                  className="group relative overflow-hidden rounded-3xl border-2 border-primary/25 bg-gradient-to-br from-primary/10 via-background/70 to-background p-8 md:p-10 text-center transition-all hover:border-primary hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] backdrop-blur-sm"
                >
                  <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-primary/15 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 border border-primary/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-[0_8px_30px_rgba(212,175,55,0.25)]">
                      {t.icon}
                    </div>
                    <div className="text-3xl md:text-4xl font-display font-bold text-primary">{t.label}</div>
                    <div className="text-muted-foreground">{t.sub}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground/60 py-4 border-t border-white/5">
        © سين جيم — لعبة معرفة عربية
      </footer>
    </div>
  );
}
