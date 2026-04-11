"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { registerRemote } from "@/features/auth/infrastructure/authApi";

import styles from "@/features/auth/ui/auth-forms.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await registerRemote(email, password);
      router.replace("/calendar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className={styles.title}>회원가입</h1>
      <p className={styles.subtitle}>비밀번호는 8자 이상이어야 합니다.</p>
      <form onSubmit={(e) => void onSubmit(e)}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="register-email">
            이메일
          </label>
          <input
            id="register-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="register-password">
            비밀번호
          </label>
          <input
            id="register-password"
            className={styles.input}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={pending}
          />
        </div>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "처리 중…" : "가입하고 시작하기"}
        </button>
      </form>
      <p className={styles.footer}>
        이미 계정이 있나요? <Link href="/login">로그인</Link>
      </p>
    </div>
  );
}
