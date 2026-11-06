import { type ReactNode, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronDown,
  Download,
  GraduationCap,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import { useRole } from "@/lib/role-context";
import { NAV } from "@/lib/navigation";
import { ROLE_LABELS, ROLE_USERS, type Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChangePasswordDialog } from "./auth/ChangePasswordDialog";

export function AppShell({ children }: { children: ReactNode }) {
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const items = NAV[role];
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChangePasswordDialog />
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarInner items={items} pathname={pathname} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border animate-[slide-in-right_0.2s_ease-out] flex flex-col">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 hover:bg-sidebar-accent"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarInner items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden">
        <TopBar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarInner({
  items,
  pathname,
  onNavigate,
}: {
  items: typeof NAV[Role];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6 select-none">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-elegant)] transition-all duration-500 hover:rotate-12 cursor-pointer">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold tracking-tight text-foreground bg-clip-text">EduSync ERP</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suite Pro</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin select-none">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
          Workspace
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 relative select-none",
                    active
                      ? "bg-primary/8 text-primary shadow-[0_2px_8px_rgba(var(--primary-glow),0.04)]"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:translate-x-0.5"
                  )}
                >
                  {/* Left indicator bar */}
                  {active && (
                    <span className="absolute left-1 top-2.5 bottom-2.5 w-[3.5px] rounded-full bg-primary animate-in fade-in zoom-in duration-300" />
                  )}

                  <Icon className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                    active ? "text-primary scale-105" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                  )} />

                  <span className="truncate transition-transform duration-300 group-hover:translate-x-0.5">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-sidebar-border p-4 select-none">
        <div className="rounded-xl border border-sidebar-border/50 bg-gradient-to-br from-primary/5 to-primary-glow/5 p-4 transition-all duration-300 hover:shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <p className="text-xs font-bold text-foreground">Need Assistance?</p>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">Browse documentation or start a live support ticket.</p>
          <button
            type="button"
            onClick={() => toast.info("Help Center is being initialized")}
            className="mt-3 w-full inline-flex h-8 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold transition-all duration-200 cursor-pointer"
          >
            Open Help Center
          </button>
        </div>
      </div>
    </>
  );
}

function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { role, user: loggedInUser, theme, toggleTheme, logout } = useRole();
  const [open, setOpen] = useState(false);
  const user = loggedInUser || ROLE_USERS[role];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenuClick}
        className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search students, staff, invoices…"
          className="h-10 w-full rounded-lg border border-input bg-card pl-10 pr-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button className="hidden h-9 items-center gap-1.5 rounded-md border border-input bg-card px-3 text-xs font-medium hover:bg-accent sm:inline-flex">
          <Download className="h-3.5 w-3.5" /> Export
        </button>

        <button
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-md border border-input bg-card hover:bg-accent"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <button className="relative grid h-9 w-9 place-items-center rounded-md border border-input bg-card hover:bg-accent">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
            5
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-2 pr-3 hover:bg-accent"
          >
            <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-[11px] font-bold text-primary-foreground">
              {user.avatar}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{ROLE_LABELS[role]}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-border bg-popover p-2 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-bold text-primary-foreground">
                    {user.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{user.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground leading-tight">{user.email}</p>
                  </div>
                </div>
                <div className="my-1 border-t border-border" />
                <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Account
                </p>
                <div className="grid gap-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <span>My Profile</span>
                    <span className="text-[10px] text-muted-foreground">{ROLE_LABELS[role]}</span>
                  </Link>
                </div>
                <div className="mt-1 border-t border-border pt-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
