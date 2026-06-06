"use client";

import { useEffect, useState } from "react";

import {
  fetchAdminPageViews,
  type AdminPageViewFilterOption,
  type AdminPageView,
} from "@/features/admin/application/pageViewsApi";
import styles from "@/features/admin/ui/AdminPageViews.module.css";

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function filterValues(options: AdminPageViewFilterOption[]): string[] {
  return options.map((option) => option.value);
}

export function AdminPageViews() {
  const [rows, setRows] = useState<AdminPageView[]>([]);
  const [ipOptions, setIpOptions] = useState<AdminPageViewFilterOption[]>([]);
  const [emailOptions, setEmailOptions] = useState<AdminPageViewFilterOption[]>([]);
  const [selectedIps, setSelectedIps] = useState<string[] | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const filtersReady = selectedIps !== null && selectedEmails !== null;
        const data = await fetchAdminPageViews({
          page,
          ipAddresses: filtersReady ? selectedIps : undefined,
          emails: filtersReady ? selectedEmails : undefined,
        });
        if (!alive) return;
        setRows(data.items);
        setIpOptions(data.filters.ipAddresses);
        setEmailOptions(data.filters.emails);
        if (!filtersReady) {
          setSelectedIps(filterValues(data.filters.ipAddresses));
          setSelectedEmails(filterValues(data.filters.emails));
        }
        setPageSize(data.pageSize);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load page views");
      } finally {
        if (alive) setLoading(false);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, [page, selectedEmails, selectedIps]);

  const fromRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const toRow = Math.min(page * pageSize, total);
  const activeIps = selectedIps ?? filterValues(ipOptions);
  const activeEmails = selectedEmails ?? filterValues(emailOptions);

  function toggleIp(value: string) {
    setPage(1);
    setSelectedIps((current) => {
      const selected = current ?? filterValues(ipOptions);
      return selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
    });
  }

  function toggleEmail(value: string) {
    setPage(1);
    setSelectedEmails((current) => {
      const selected = current ?? filterValues(emailOptions);
      return selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
    });
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Admin</p>
          <h1 className={styles.title}>Page Views</h1>
        </div>
        <div className={styles.headerMeta}>
          <p className={styles.count}>{total} rows</p>
          <p className={styles.pageMeta}>
            {fromRow}-{toRow} / page {page} of {totalPages}
          </p>
        </div>
      </header>

      {loading ? <p className={styles.notice}>Loading...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      {!loading && !error ? (
        <section className={styles.card}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <div className={styles.filterHeader}>
                <h2 className={styles.filterTitle}>IP Filters</h2>
                <span className={styles.filterMeta}>
                  {activeIps.length}/{ipOptions.length} selected
                </span>
              </div>
              <div className={styles.chips}>
                {ipOptions.map((option) => {
                  const active = activeIps.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                      onClick={() => toggleIp(option.value)}
                    >
                      <span>{option.value}</span>
                      <small>{option.count}</small>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <div className={styles.filterHeader}>
                <h2 className={styles.filterTitle}>Account Filters</h2>
                <span className={styles.filterMeta}>
                  {activeEmails.length}/{emailOptions.length} selected
                </span>
              </div>
              <div className={styles.chips}>
                {emailOptions.map((option) => {
                  const active = activeEmails.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                      onClick={() => toggleEmail(option.value)}
                    >
                      <span>{option.value}</span>
                      <small>{option.count}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>IP</th>
                  <th>User</th>
                  <th>Path</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className={styles.time}>{formatDateTime(row.occurredAt)}</td>
                    <td className={styles.ip}>{row.ipAddress}</td>
                    <td>{row.user.email}</td>
                    <td className={styles.path}>{row.path}</td>
                    <td className={styles.userAgent}>{row.userAgent ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 ? <p className={styles.empty}>No page views match the selected filters.</p> : null}
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </button>
            <span className={styles.pageStatus}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className={styles.pageButton}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
