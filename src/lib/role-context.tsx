import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Role } from "./mock-data";
import { apiClient } from "./api-client";

interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatar: string;
  school_id: string | null;
  isLogging?: boolean;
  custom_role?: string;
  dept?: string;
  phone?: string;
  joined?: string;
  status?: string;
  address?: string;
  metadata?: any;
}

interface RoleCtx {
  role: Role;
  user: User | null;
  setRole: (r: Role) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<RoleCtx | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("school_admin");
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const t = localStorage.getItem("erp-theme") as "light" | "dark" | null;
    if (t) setTheme(t);

    const token = localStorage.getItem("erp-token");
    if (token) {
      apiClient
        .get<{ user: User }>("/auth/me")
        .then((res) => {
          setUser(res.user);
          setRoleState(res.user.role);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem("erp-token");
          localStorage.removeItem("erp-auth");
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") localStorage.setItem("erp-theme", theme);
  }, [theme]);

  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("erp-role", r);
  };

  const login = (token: string, userData: User) => {
    setUser(userData);
    setRoleState(userData.role);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("erp-token", token);
      localStorage.setItem("erp-auth", "1");
      localStorage.setItem("erp-role", userData.role);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("erp-token");
      localStorage.removeItem("erp-auth");
      localStorage.removeItem("erp-role");
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("erp-token");
    if (token) {
      try {
        const res = await apiClient.get<{ user: User }>("/auth/me");
        setUser(res.user);
        setRoleState(res.user.role);
      } catch (e) {
        logout();
      }
    }
  };

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <Ctx.Provider
      value={{ role, user, setRole, theme, toggleTheme, isAuthenticated, login, logout, isLoading, refreshUser }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useRole() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRole outside provider");
  return c;
}
