"use client";

import { useEffect, useState } from "react";

import { changePasswordRemote } from "@/features/auth/infrastructure/authApi";
import { parseErrorMessage } from "@/lib/api/parseErrorMessage";

import styles from "@/features/auth/ui/password-change.module.css";

type CurrentUserResponse = {
  user?: {
    email?: string;
    isDemo?: boolean;
  };
};

export function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          if (alive) setError(await parseErrorMessage(res));
          return;
        }
        const data = (await res.json()) as CurrentUserResponse;
        if (alive) setIsDemo(Boolean(data.user?.isDemo));
      } catch {
        if (alive) setError("Failed to load current user.");
      } finally {
        if (alive) setCheckingUser(false);
      }
    }

    void loadCurrentUser();
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("New password confirmation does not match.");
      return;
    }

    setPending(true);
    try {
      await changePasswordRemote({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPending(false);
    }
  }

  if (checkingUser) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>Loading...</section>
      </main>
    );
  }

  if (isDemo) {
    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.title}>Password</h1>
          <p className={styles.notice}>
            Demo account passwords cannot be changed.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Account</p>
        <h1 className={styles.title}>Password</h1>
        <p className={styles.subtitle}>Change the password for this account.</p>

        <form className={styles.form} onSubmit={(e) => void onSubmit(e)}>
          <label className={styles.field}>
            <span>Current password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              minLength={1}
              required
              disabled={pending}
            />
          </label>

          <label className={styles.field}>
            <span>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              maxLength={200}
              required
              disabled={pending}
            />
          </label>

          <label className={styles.field}>
            <span>Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              maxLength={200}
              required
              disabled={pending}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}
          {success ? <p className={styles.success}>{success}</p> : null}

          <button type="submit" className={styles.submit} disabled={pending}>
            {pending ? "Changing..." : "Change password"}
          </button>
        </form>
      </section>
    </main>
  );
}
