"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";

import { uploadNoteFile } from "@/features/notes/infrastructure/notesApi";
import styles from "@/features/notes/ui/notes.module.css";

export function NoteFileUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const note = await uploadNoteFile(file);
      router.push(`/notes/${note.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "업로드하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.uploadPanel}>
      <div className={styles.uploadTitle}>파일에서 만들기</div>
      <p className={styles.uploadHint}>
        .txt는 내용이 노트 본문으로 들어가 바로 편집할 수 있습니다. .pdf는 서버에 원본이 저장되며, 상세에서 내려받을 수
        있습니다. AI 요약은 백엔드에서 PDF 텍스트를 추출해 처리합니다.
      </p>
      <div className={styles.uploadRow}>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.pdf,text/plain,application/pdf"
          className={styles.uploadInputHidden}
          disabled={busy}
          onChange={(ev) => void onPick(ev)}
        />
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "업로드 중…" : "파일 선택 (.txt / .pdf)"}
        </button>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
