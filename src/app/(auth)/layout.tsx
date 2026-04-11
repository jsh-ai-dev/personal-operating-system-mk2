import styles from "./auth-layout.module.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>{children}</div>
    </div>
  );
}
