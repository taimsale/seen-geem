import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="glass-panel border-primary/20 bg-background/60">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-2 border border-primary/30">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-6xl font-bold text-primary text-glow font-display">سين جيم</CardTitle>
            <CardDescription className="text-2xl">لعبة التحدي والمعرفة بين الفرق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-background/50 border border-primary/10">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">حتى 4 فرق</div>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-primary/10">
                <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">6 تصنيفات</div>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-primary/10">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-sm text-muted-foreground">36 سؤال</div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => setLocation("/sign-up")} className="h-14 text-xl font-bold font-display tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                إنشاء حساب جديد
              </Button>
              <Button onClick={() => setLocation("/sign-in")} variant="outline" className="h-12 text-lg border-primary/50 text-primary hover:bg-primary/10">
                لدي حساب — تسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
