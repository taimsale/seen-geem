import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import PlaySetup from "@/pages/play";
import Board from "@/pages/board";
import Admin from "@/pages/admin";
import Store from "@/pages/store";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(p: string): string {
  return basePath && p.startsWith(basePath) ? p.slice(basePath.length) || "/" : p;
}

if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#D4AF37",
    colorForeground: "#F5F5F5",
    colorMutedForeground: "#A0A8B8",
    colorDanger: "#EF4444",
    colorBackground: "#0F1422",
    colorInput: "#1A2236",
    colorInputForeground: "#F5F5F5",
    colorNeutral: "#2A3450",
    fontFamily: "Tajawal, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-[#0F1422] border border-[#D4AF37]/30 rounded-2xl w-[440px] max-w-full overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.15)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#D4AF37] font-bold text-2xl",
    headerSubtitle: "text-[#A0A8B8]",
    socialButtonsBlockButtonText: "text-[#F5F5F5]",
    formFieldLabel: "text-[#F5F5F5]",
    footerActionLink: "text-[#D4AF37] hover:text-[#E5C04A]",
    footerActionText: "text-[#A0A8B8]",
    dividerText: "text-[#A0A8B8]",
    identityPreviewEditButton: "text-[#D4AF37]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-[#F5F5F5]",
    logoBox: "justify-center mb-2",
    logoImage: "h-12 w-12",
    socialButtonsBlockButton: "border border-[#2A3450] hover:bg-[#1A2236]",
    formButtonPrimary: "bg-[#D4AF37] hover:bg-[#E5C04A] text-[#0F1422] font-bold",
    formFieldInput: "bg-[#1A2236] border-[#2A3450] text-[#F5F5F5]",
    footerAction: "",
    dividerLine: "bg-[#2A3450]",
    alert: "bg-[#1A2236] border-[#2A3450]",
    otpCodeFieldInput: "bg-[#1A2236] border-[#2A3450] text-[#F5F5F5]",
    formFieldRow: "",
    main: "",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4" dir="ltr">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}
function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4" dir="ltr">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Home /></Show>
      <Show when="signed-out"><Landing /></Show>
    </>
  );
}
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
    </>
  );
}

function ClerkQueryInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prev = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    return addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prev.current !== undefined && prev.current !== id) qc.clear();
      prev.current = id;
    });
  }, [addListener, qc]);
  return null;
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "تسجيل الدخول", subtitle: "سجل الدخول لمتابعة لعبة سين جيم" } },
        signUp: { start: { title: "إنشاء حساب جديد", subtitle: "ابدأ مغامرتك في سين جيم" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/play">{() => <Protected><PlaySetup /></Protected>}</Route>
            <Route path="/board">{() => <Protected><Board /></Protected>}</Route>
            <Route path="/admin">{() => <Protected><Admin /></Protected>}</Route>
            <Route path="/store">{() => <Protected><Store /></Protected>}</Route>
            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkRoutes />
    </WouterRouter>
  );
}
