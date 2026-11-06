import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ChangePasswordDialog() {
  const { user, refreshUser, logout } = useRole();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If there's no user or user.isLogging is already true, do not display anything
  if (!user || user.isLogging) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      toast.success("Password changed successfully!");
      await refreshUser(); // Refresh the context state
    } catch (err: any) {
      setError(err.message || "Failed to change password. Make sure current password is correct.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl overflow-hidden"
        >
          {/* Subtle colored accent gradient at the top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-primary-glow to-info" />

          <div className="flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
              <Lock className="h-6 w-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              First-Time Login Password Change
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm">
              For security reasons, you must change your temporary password before accessing the application dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="h-10 w-full rounded-xl border border-input bg-background/50 px-3.5 pr-10 text-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent cursor-pointer"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  className="h-10 w-full rounded-xl border border-input bg-background/50 px-3.5 pr-10 text-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent cursor-pointer"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-10 w-full rounded-xl border border-input bg-background/50 px-3.5 pr-10 text-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-accent cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={logout}
                className="flex-1 h-10 rounded-xl border border-input bg-card text-xs font-semibold hover:bg-accent cursor-pointer"
              >
                Cancel / Sign Out
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-xl bg-primary text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-primary/20"
              >
                {isSubmitting ? "Saving..." : "Change Password"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
