import { useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMe,
  useListCategories, getListCategoriesQueryKey,
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useListQuestions, getListQuestionsQueryKey,
  useCreateQuestion, useUpdateQuestion, useDeleteQuestion,
  useListUsers, getListUsersQueryKey, useUpdateUser,
  useListCodes, getListCodesQueryKey, useCreateCodes, useDeleteCode,
  useAdminListProducts, getAdminListProductsQueryKey,
  useCreateProduct, useUpdateProduct, useDeleteProduct,
  useAiGenerateQuestions,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Plus, Edit, Trash2, Image as ImageIcon, Copy, ShieldCheck, Wand2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Q = { id: number; categoryId: number; text: string; answer: string; image?: string | null; points: number };

function errMsg(e: unknown, fallback = "حدث خطأ غير متوقع"): string {
  const x = e as { data?: { error?: string }; message?: string } | null;
  const fromBody = x?.data?.error;
  if (typeof fromBody === "string" && fromBody.trim()) return fromBody;
  if (typeof x?.message === "string" && x.message.trim()) return x.message;
  return fallback;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { data: me } = useGetMe();
  if (me && !me.isAdmin) {
    setTimeout(() => setLocation("/"), 0);
    return <div className="min-h-screen bg-background flex items-center justify-center text-destructive">غير مصرح</div>;
  }
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setLocation("/")} className="gap-2"><ArrowRight className="w-4 h-4" /> الرئيسية</Button>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">لوحة التحكم</h1>
          </div>
        </header>
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="content">المحتوى</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="codes">الأكواد</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
          </TabsList>
          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="codes"><CodesTab /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ContentTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: categories = [] } = useListCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const delCat = useDeleteCategory();
  const createQ = useCreateQuestion();
  const updateQ = useUpdateQuestion();
  const delQ = useDeleteQuestion();
  const aiGen = useAiGenerateQuestions();

  const [activeId, setActiveId] = useState<number | undefined>();
  const [newCat, setNewCat] = useState("");
  const [editing, setEditing] = useState<Partial<Q> | null>(null);
  const [editingCat, setEditingCat] = useState<{ id: number; name: string; imageUrl: string | null } | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTargetCat, setAiTargetCat] = useState<string>("__new__");

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const { data: activeQs = [] } = useListQuestions(
    { categoryId: active?.id ?? 0 },
    { query: { enabled: !!active, queryKey: getListQuestionsQueryKey({ categoryId: active?.id ?? 0 }) } },
  );

  const onCreateCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await createCat.mutateAsync({ data: { name: newCat.trim() } });
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      setNewCat("");
      toast({ title: "تمت إضافة التصنيف" });
    } catch (e) {
      toast({ title: "تعذر إضافة التصنيف", description: errMsg(e), variant: "destructive" });
    }
  };

  const onDeleteCategory = async (id: number) => {
    if (!confirm("حذف التصنيف وجميع أسئلته؟")) return;
    try {
      await delCat.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ title: "تعذر الحذف", description: errMsg(e), variant: "destructive" });
    }
  };

  const saveCatEdit = async () => {
    if (!editingCat) return;
    try {
      await updateCat.mutateAsync({ id: editingCat.id, data: { name: editingCat.name, imageUrl: editingCat.imageUrl ?? null } });
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      setEditingCat(null);
      toast({ title: "تم التحديث" });
    } catch (e) {
      toast({ title: "تعذر التحديث", description: errMsg(e), variant: "destructive" });
    }
  };

  const openNewQ = () => {
    if (!active) return;
    setEditing({ categoryId: active.id, points: 100, text: "", answer: "" });
  };
  const openEditQ = (q: Q) => setEditing(q);

  const saveQ = async () => {
    if (!editing || !editing.text || !editing.answer || !editing.points || !editing.categoryId) {
      toast({ title: "املأ كل الحقول", variant: "destructive" }); return;
    }
    try {
      if (editing.id) {
        await updateQ.mutateAsync({ id: editing.id, data: {
          text: editing.text, answer: editing.answer, points: editing.points,
          image: editing.image?.trim() ? editing.image : null, categoryId: editing.categoryId,
        }});
      } else {
        await createQ.mutateAsync({ data: {
          categoryId: editing.categoryId, text: editing.text, answer: editing.answer,
          points: editing.points, image: editing.image?.trim() ? editing.image : null,
        }});
      }
      setEditing(null);
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      qc.invalidateQueries({ queryKey: getListQuestionsQueryKey({ categoryId: editing.categoryId }) });
      toast({ title: "تم الحفظ" });
    } catch (e) {
      toast({ title: "تعذر الحفظ", description: errMsg(e), variant: "destructive" });
    }
  };

  const onDeleteQ = async (id: number) => {
    if (!confirm("حذف السؤال؟")) return;
    try {
      await delQ.mutateAsync({ id });
      if (active) qc.invalidateQueries({ queryKey: getListQuestionsQueryKey({ categoryId: active.id }) });
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      toast({ title: "تم الحذف" });
    } catch (e) {
      toast({ title: "تعذر الحذف", description: errMsg(e), variant: "destructive" });
    }
  };

  const runAI = async () => {
    if (!aiTopic.trim()) { toast({ title: "اكتب اسم الموضوع", variant: "destructive" }); return; }
    try {
      const res = await aiGen.mutateAsync({
        data: aiTargetCat === "__new__"
          ? { topic: aiTopic.trim(), createCategory: true }
          : { topic: aiTopic.trim(), categoryId: Number(aiTargetCat), createCategory: false },
      });
      qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      qc.invalidateQueries({ queryKey: getListQuestionsQueryKey({ categoryId: res.categoryId }) });
      setAiOpen(false);
      setAiTopic("");
      setActiveId(res.categoryId);
      toast({ title: `تم توليد ${res.created.length} أسئلة في «${res.categoryName}»` });
    } catch (e) {
      toast({ title: "تعذر التوليد", description: errMsg(e), variant: "destructive" });
    }
  };

  return (
    <div className="grid md:grid-cols-[300px_1fr] gap-4">
      <Card className="glass-panel border-primary/20 bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary text-lg">التصنيفات</CardTitle>
          <Button onClick={() => setAiOpen(true)} size="sm" className="gap-1 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/40">
            <Wand2 className="w-4 h-4" /> توليد تلقائي
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="تصنيف جديد" />
            <Button onClick={onCreateCategory} size="icon" className="bg-primary text-primary-foreground"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {categories.map((c) => (
              <div key={c.id} className={`flex items-center gap-1 rounded-md p-2 cursor-pointer ${active?.id === c.id ? "bg-primary/15 border border-primary/30" : "hover:bg-white/5"}`}
                   onClick={() => setActiveId(c.id)}>
                {c.imageUrl ? (
                  <img src={c.imageUrl} className="w-9 h-9 rounded object-cover border border-primary/30" />
                ) : (
                  <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-primary/50" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.questionCount} سؤال</div>
                </div>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingCat({ id: c.id, name: c.name, imageUrl: c.imageUrl ?? null }); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDeleteCategory(c.id); }} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-primary/20 bg-background/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-primary text-lg">{active ? `أسئلة: ${active.name}` : "اختر تصنيفاً"}</CardTitle>
          {active && <Button onClick={openNewQ} className="gap-2 bg-primary text-primary-foreground"><Plus className="w-4 h-4" /> سؤال جديد</Button>}
        </CardHeader>
        <CardContent>
          {active ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>النقاط</TableHead><TableHead>السؤال</TableHead><TableHead>الجواب</TableHead><TableHead>صورة</TableHead><TableHead></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {activeQs.sort((a, b) => a.points - b.points).map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="text-primary font-bold">{q.points}</TableCell>
                      <TableCell className="max-w-xs truncate">{q.text}</TableCell>
                      <TableCell className="max-w-xs truncate">{q.answer}</TableCell>
                      <TableCell>{q.image ? <ImageIcon className="w-4 h-4 text-primary" /> : "-"}</TableCell>
                      <TableCell className="text-left">
                        <Button variant="ghost" size="icon" onClick={() => openEditQ(q)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteQ(q.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activeQs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد أسئلة. أضف 6 أسئلة (نقاط مختلفة) ليظهر التصنيف في اللعبة.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          ) : <div className="p-6 text-center text-muted-foreground">أنشئ تصنيفاً لتبدأ</div>}
        </CardContent>
      </Card>

      {/* Question editor */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "تعديل سؤال" : "إضافة سؤال"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={editing.categoryId?.toString()} onValueChange={(v) => setEditing({ ...editing, categoryId: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>النقاط</Label>
                  <Select value={editing.points?.toString()} onValueChange={(v) => setEditing({ ...editing, points: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[100, 200, 300, 400, 500, 600].map((p) => <SelectItem key={p} value={p.toString()}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>نص السؤال</Label><Textarea value={editing.text || ""} onChange={(e) => setEditing({ ...editing, text: e.target.value })} rows={3} /></div>
              <div className="space-y-2"><Label>الجواب</Label><Textarea value={editing.answer || ""} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} rows={2} /></div>
              <div className="space-y-2">
                <Label>رابط الصورة (اختياري)</Label>
                <Input dir="ltr" value={editing.image || ""} onChange={(e) => setEditing({ ...editing, image: e.target.value || null })} placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-muted-foreground">الصق رابط صورة جاهزة على الإنترنت — لا نخزّن صور هنا للحفاظ على المساحة.</p>
                {editing.image && editing.image.trim().length > 4 && (
                  <div className="flex items-center gap-3 pt-1">
                    <img src={editing.image} className="h-16 rounded border border-primary/30" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setEditing({ ...editing, image: null })}>إزالة</Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={saveQ} className="bg-primary text-primary-foreground">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category editor */}
      <Dialog open={!!editingCat} onOpenChange={(o) => !o && setEditingCat(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل التصنيف</DialogTitle></DialogHeader>
          {editingCat && (
            <div className="space-y-4 py-2">
              <div className="space-y-2"><Label>الاسم</Label><Input value={editingCat.name} onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>رابط صورة الخلفية (اختياري)</Label>
                <Input dir="ltr" value={editingCat.imageUrl || ""} onChange={(e) => setEditingCat({ ...editingCat, imageUrl: e.target.value || null })} placeholder="https://example.com/image.jpg" />
              </div>
              {editingCat.imageUrl && <img src={editingCat.imageUrl} className="max-h-40 rounded border" />}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCat(null)}>إلغاء</Button>
            <Button onClick={saveCatEdit} className="bg-primary text-primary-foreground">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI generation dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary" /> توليد أسئلة بالذكاء الاصطناعي</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>الموضوع</Label>
              <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="مثل: كيمياء، التاريخ الإسلامي، السينما العربية" />
            </div>
            <div className="space-y-2">
              <Label>الوجهة</Label>
              <Select value={aiTargetCat} onValueChange={setAiTargetCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__new__">إنشاء تصنيف جديد باسم الموضوع</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>إضافة إلى: {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">سيتم توليد 6 أسئلة بنقاط من 100 إلى 600 تلقائياً.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)}>إلغاء</Button>
            <Button onClick={runAI} disabled={aiGen.isPending} className="bg-primary text-primary-foreground gap-2">
              <Wand2 className="w-4 h-4" /> {aiGen.isPending ? "جاري التوليد..." : "توليد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsersTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: users = [] } = useListUsers();
  const updateUser = useUpdateUser();
  const [editing, setEditing] = useState<{ id: string; name: string; rounds: number; isAdmin: boolean } | null>(null);

  const save = async () => {
    if (!editing) return;
    await updateUser.mutateAsync({ id: editing.id, data: { roundsBalance: editing.rounds, isAdmin: editing.isAdmin } });
    qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    setEditing(null);
    toast({ title: "تم الحفظ", description: "سيظهر التحديث للمستخدم خلال ثوانٍ." });
  };

  return (
    <Card className="glass-panel border-primary/20 bg-background/60">
      <CardHeader><CardTitle className="text-primary">المستخدمون ({users.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader><TableRow><TableHead>الاسم</TableHead><TableHead>البريد</TableHead><TableHead>الجولات</TableHead><TableHead>مسؤول</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-primary font-bold">{u.roundsBalance}</TableCell>
                  <TableCell>{u.isAdmin ? <ShieldCheck className="w-4 h-4 text-primary" /> : "-"}</TableCell>
                  <TableCell><Button variant="ghost" size="icon" onClick={() => setEditing({ id: u.id, name: u.name, rounds: u.roundsBalance, isAdmin: u.isAdmin })}><Edit className="w-4 h-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل: {editing?.name}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>عدد الجولات المتاحة</Label><Input type="number" value={editing.rounds} onChange={(e) => setEditing({ ...editing, rounds: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-3"><Switch checked={editing.isAdmin} onCheckedChange={(v) => setEditing({ ...editing, isAdmin: v })} /><Label>صلاحيات مسؤول</Label></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={save} className="bg-primary text-primary-foreground">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CodesTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: codes = [] } = useListCodes();
  const createCodes = useCreateCodes();
  const delCode = useDeleteCode();
  const [form, setForm] = useState({ rounds: 1, maxUses: 1, count: 1 });

  const generate = async () => {
    try {
      await createCodes.mutateAsync({ data: { roundsValue: form.rounds, maxUses: form.maxUses, count: form.count } });
      qc.invalidateQueries({ queryKey: getListCodesQueryKey() });
      toast({ title: `تم توليد ${form.count} كود` });
    } catch (e: any) { toast({ title: "فشل", variant: "destructive" }); }
  };
  const copy = (code: string) => { navigator.clipboard.writeText(code); toast({ title: "تم النسخ" }); };
  const remove = async (id: number) => {
    if (!confirm("حذف الكود؟")) return;
    await delCode.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListCodesQueryKey() });
  };

  return (
    <div className="space-y-4">
      <Card className="glass-panel border-primary/20 bg-background/60">
        <CardHeader><CardTitle className="text-primary">توليد أكواد جديدة</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3 items-end">
          <div className="space-y-2"><Label>عدد الجولات لكل كود</Label><Input type="number" min={1} value={form.rounds} onChange={(e) => setForm({ ...form, rounds: parseInt(e.target.value) || 1 })} /></div>
          <div className="space-y-2"><Label>عدد المستخدمين الكلي</Label><Input type="number" min={1} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 1 })} /></div>
          <div className="space-y-2"><Label>عدد الأكواد</Label><Input type="number" min={1} max={100} value={form.count} onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 1 })} /></div>
          <Button onClick={generate} disabled={createCodes.isPending} className="bg-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> توليد</Button>
        </CardContent>
      </Card>
      <Card className="glass-panel border-primary/20 bg-background/60">
        <CardHeader><CardTitle className="text-primary">الأكواد ({codes.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader><TableRow><TableHead>الكود</TableHead><TableHead>الجولات</TableHead><TableHead>الاستخدام</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {codes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><code className="text-primary font-mono text-lg tracking-wider">{c.code}</code></TableCell>
                    <TableCell className="text-primary">{c.roundsValue}</TableCell>
                    <TableCell>{c.usedCount} / {c.maxUses}</TableCell>
                    <TableCell className="text-left">
                      <Button variant="ghost" size="icon" onClick={() => copy(c.code)}><Copy className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(c.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {codes.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">لا توجد أكواد بعد</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type ProductForm = {
  id?: number; name: string; description: string; rounds: number;
  priceCents: number; discountPercent: number; currency: string; payhipUrl: string; badge: string;
  sortOrder: number; active: boolean;
};
const emptyProduct: ProductForm = {
  name: "", description: "", rounds: 5, priceCents: 499, discountPercent: 0, currency: "USD",
  payhipUrl: "", badge: "", sortOrder: 0, active: true,
};

function priceAfterDiscount(cents: number, pct: number): number {
  const p = Math.max(0, Math.min(pct, 95));
  return Math.round(cents * (1 - p / 100));
}

function ProductsTab() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: products = [] } = useAdminListProducts();
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const del = useDeleteProduct();
  const [editing, setEditing] = useState<ProductForm | null>(null);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim() || editing.rounds < 1 || editing.priceCents < 0) {
      toast({ title: "تأكد من الاسم والسعر وعدد الجولات", variant: "destructive" }); return;
    }
    const payload = {
      name: editing.name.trim(),
      description: editing.description ?? "",
      rounds: editing.rounds,
      priceCents: editing.priceCents,
      discountPercent: Math.max(0, Math.min(editing.discountPercent || 0, 95)),
      currency: (editing.currency || "USD").toUpperCase(),
      payhipUrl: editing.payhipUrl ?? "",
      badge: editing.badge?.trim() ? editing.badge.trim() : null,
      sortOrder: editing.sortOrder ?? 0,
      active: editing.active,
    };
    try {
      if (editing.id) await update.mutateAsync({ id: editing.id, data: payload });
      else await create.mutateAsync({ data: payload });
      qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
      setEditing(null);
      toast({ title: "تم الحفظ" });
    } catch (e) {
      toast({ title: "تعذر الحفظ", description: errMsg(e), variant: "destructive" });
    }
  };
  const remove = async (id: number) => {
    if (!confirm("حذف المنتج؟")) return;
    try {
      await del.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getAdminListProductsQueryKey() });
    } catch (e) {
      toast({ title: "تعذر الحذف", description: errMsg(e), variant: "destructive" });
    }
  };

  return (
    <Card className="glass-panel border-primary/20 bg-background/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary flex items-center gap-2"><Package className="w-5 h-5" /> منتجات المتجر ({products.length})</CardTitle>
        <Button onClick={() => setEditing({ ...emptyProduct })} className="gap-2 bg-primary text-primary-foreground"><Plus className="w-4 h-4" /> منتج جديد</Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader><TableRow><TableHead>الاسم</TableHead><TableHead>الجولات</TableHead><TableHead>السعر</TableHead><TableHead>Payhip</TableHead><TableHead>الحالة</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {products.map((p) => {
                const final = priceAfterDiscount(p.priceCents, p.discountPercent);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">
                      {p.name}
                      {p.badge && <span className="mr-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{p.badge}</span>}
                    </TableCell>
                    <TableCell className="text-primary font-bold">{p.rounds}</TableCell>
                    <TableCell>
                      {p.discountPercent > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-400 font-bold">{(final / 100).toFixed(2)} {p.currency}</span>
                          <span className="text-xs text-muted-foreground line-through">{(p.priceCents / 100).toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>{(p.priceCents / 100).toFixed(2)} {p.currency}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.discountPercent > 0
                        ? <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">-{p.discountPercent}%</span>
                        : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground" dir="ltr">{p.payhipUrl || "—"}</TableCell>
                    <TableCell>{p.active ? <span className="text-emerald-400">نشط</span> : <span className="text-muted-foreground">معطّل</span>}</TableCell>
                    <TableCell className="text-left">
                      <Button variant="ghost" size="icon" onClick={() => setEditing({
                        id: p.id, name: p.name, description: p.description, rounds: p.rounds,
                        priceCents: p.priceCents, discountPercent: p.discountPercent,
                        currency: p.currency, payhipUrl: p.payhipUrl,
                        badge: p.badge ?? "", sortOrder: p.sortOrder, active: p.active,
                      })}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {products.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">لا توجد منتجات. أنشئ أول منتج لعرضه في المتجر.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "تعديل منتج" : "منتج جديد"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-2 col-span-2"><Label>اسم المنتج</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="space-y-2 col-span-2"><Label>الوصف</Label><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>عدد الجولات</Label><Input type="number" min={1} value={editing.rounds} onChange={(e) => setEditing({ ...editing, rounds: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>السعر الأصلي (سنت/هللة)</Label><Input type="number" min={0} value={editing.priceCents} onChange={(e) => setEditing({ ...editing, priceCents: parseInt(e.target.value) || 0 })} />
                <div className="text-xs text-muted-foreground">= {(editing.priceCents / 100).toFixed(2)} {editing.currency || "USD"}</div>
              </div>
              <div className="space-y-2"><Label>نسبة الخصم %</Label><Input type="number" min={0} max={95} value={editing.discountPercent} onChange={(e) => setEditing({ ...editing, discountPercent: Math.max(0, Math.min(parseInt(e.target.value) || 0, 95)) })} />
                <div className="text-xs text-emerald-400">السعر بعد الخصم: {(priceAfterDiscount(editing.priceCents, editing.discountPercent) / 100).toFixed(2)} {editing.currency || "USD"}</div>
              </div>
              <div className="space-y-2"><Label>العملة</Label><Input value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value.toUpperCase().slice(0, 4) })} /></div>
              <div className="space-y-2"><Label>الترتيب</Label><Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2 col-span-2"><Label>رابط المنتج في Payhip</Label>
                <Input dir="ltr" value={editing.payhipUrl} onChange={(e) => setEditing({ ...editing, payhipUrl: e.target.value })} placeholder="https://payhip.com/b/XXXX" />
              </div>
              <div className="space-y-2"><Label>شارة (اختياري)</Label><Input value={editing.badge} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="مثل: الأكثر مبيعاً" /></div>
              <div className="flex items-center gap-3 pt-7"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>نشط (يظهر في المتجر)</Label></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
            <Button onClick={save} className="bg-primary text-primary-foreground">حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
