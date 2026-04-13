"use client";

import { useEffect, useState } from "react";

import type { NoteDto, SummaryModelTier } from "@/features/notes/infrastructure/notesApi";
import { generateNoteSummary, saveNoteSummary } from "@/features/notes/infrastructure/notesApi";
import styles from "@/features/notes/ui/notes.module.css";

type Props = {
  note: NoteDto;
  onNoteUpdated: (note: NoteDto) => void;
};

export function NoteAiSummarySection({ note, onNoteUpdated }: Props) {
  const [modelTier, setModelTier] = useState<SummaryModelTier>("flash");
  const [draft, setDraft] = useState(note.aiSummary ?? "");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(note.aiSummary ?? "");
  }, [note.id, note.aiSummary]);

  async function onGenerate() {
    setError(null);
    setGenerating(true);
    try {
      const result = await generateNoteSummary(note.id, modelTier);
      setDraft(result.summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "요약 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  async function onSave() {
    const text = draft.trim();
    if (!text) {
      setError("저장할 요약 내용을 입력하세요.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const updated = await saveNoteSummary(note.id, text);
      onNoteUpdated(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.summarySection} aria-label="AI 요약">
      <div className={styles.summaryHeader}>
        <h2 className={styles.summaryTitle}>AI 요약</h2>
        <p className={styles.summaryLead}>
          Spring 서버의 AI 설정(Gemini/OpenAI)에 따라 생성됩니다. 생성 후 수정하고 저장할 수 있어요.
        </p>
      </div>

      {note.aiSummary ? (
        <div className={styles.summarySavedBadge}>
          <span className={styles.summarySavedLabel}>저장된 요약 있음</span>
        </div>
      ) : null}

      {error ? <p className={styles.summaryError}>{error}</p> : null}

      <div className={styles.summaryToolbar}>
        <label className={styles.summaryTierLabel}>
          모델
          <select
            className={styles.select}
            value={modelTier}
            onChange={(e) => setModelTier(e.target.value as SummaryModelTier)}
            disabled={generating}
            aria-label="요약 모델"
          >
            <option value="flash">Flash (빠름)</option>
            <option value="pro">Pro (고품질)</option>
          </select>
        </label>
        <button
          type="button"
          className={styles.summaryGenBtn}
          disabled={generating || saving}
          onClick={() => void onGenerate()}
        >
          {generating ? "생성 중…" : "요약 생성"}
        </button>
      </div>

      <label className={styles.summaryEditorLabel} htmlFor="note-ai-summary-draft">
        요약 문장
      </label>
      <textarea
        id="note-ai-summary-draft"
        className={styles.summaryTextarea}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="요약 생성 버튼을 누르거나 직접 입력하세요."
        rows={6}
        disabled={generating}
      />

      <div className={styles.summaryActions}>
        <button
          type="button"
          className={styles.summarySaveBtn}
          disabled={saving || generating || !draft.trim()}
          onClick={() => void onSave()}
        >
          {saving ? "저장 중…" : "요약 저장"}
        </button>
      </div>
    </section>
  );
}
