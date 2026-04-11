import styles from "./notes.module.css";

export default function NotesPage() {
  return (
    <section className={styles.wrap} aria-label="노트">
      <h1 className={styles.title}>노트</h1>
      <p className={styles.lead}>
        이 영역은 MSA로 연결된 다른 프로젝트의 API에서 데이터를 조회해 표시할 예정입니다.
      </p>
      <p className={styles.hint}>지금은 자리만 잡아 둔 화면입니다.</p>
    </section>
  );
}
