import Link from "next/link";

import { NoteFileUpload } from "@/features/notes/ui/NoteFileUpload";
import { NoteForm } from "@/features/notes/ui/NoteForm";
import styles from "@/features/notes/ui/notes.module.css";

export default function NewNotePage() {
  return (
    <section className={styles.page} aria-label="새 노트">
      <Link href="/notes" className={styles.backLink}>
        ← 노트 목록
      </Link>
      <header className={styles.header} style={{ marginBottom: 16 }}>
        <div>
          <h1 className={styles.title}>새 노트</h1>
          <p className={styles.subtitle}>
            직접 작성하거나, 메모장(.txt)·PDF를 올려 노트로 만듭니다. txt는 본문으로 들어가고, pdf는 원본이 저장됩니다.
          </p>
        </div>
      </header>
      <NoteFileUpload />
      <NoteForm mode="create" />
    </section>
  );
}
