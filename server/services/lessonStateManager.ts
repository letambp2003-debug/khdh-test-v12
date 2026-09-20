import { db } from '../db/database';
import { DependencyGraphService } from './dependencyGraph';

export interface LessonState {
  lesson_id: string;
  subject: string;
  grade: number;
  chapter: string;
  lesson_title: string;
  total_periods: number;
  ppct: number[];
  weeks: number[];
  yccd: Array<{ id: string; text: string; level: string }>;
  digital_competency_indicators: Array<{
    id: string;
    indicator: string;
    target_activity: string;
    tool: string;
    student_action: string;
    product: string;
    evidence: string;
  }>;
  subject_profile: string;
  lesson_type: string;
  form_mode: 'DEFAULT_V12_FORM_MODE' | 'CUSTOM_FORM_MODE';
  textbook: {
    book: string;
    pages: string;
    assets: Array<{ id: string; page: number; caption: string; status: string }>;
  };
  activities: Array<{
    id: string;
    code: string;
    period: number;
    title: string;
    time: number;
    yccd_refs: string[];
    nls_refs: string[];
    student_task: string;
    teacher_actions: string;
    product: string;
    evidence: string;
    digital_tool: string;
    source_refs: string[];
    locked: boolean;
  }>;
  created_at: string;
  updated_at: string;
  version: number;
}

export class LessonStateManager {
  private static activeLessonId: string | null = null;

  public static getActiveState(): LessonState | null {
    if (!this.activeLessonId) {
      const all = db.getAllLessons();
      if (all.length > 0) {
        this.activeLessonId = all[0].lesson_id;
        return all[0] as LessonState;
      }
      return null;
    }
    return db.getLessonState(this.activeLessonId) as LessonState | null;
  }

  public static setActiveState(state: LessonState): void {
    state.updated_at = new Date().toISOString();
    state.version = (state.version || 0) + 1;
    this.activeLessonId = state.lesson_id;
    db.saveLessonState(state);
  }

  public static updateActivity(activityId: string, updates: { student_task?: string; time?: number; locked?: boolean }): { updated: boolean; staleDependents: string[] } {
    const state = this.getActiveState();
    if (!state) return { updated: false, staleDependents: [] };

    const actIndex = state.activities.findIndex(a => a.id === activityId);
    if (actIndex === -1) return { updated: false, staleDependents: [] };

    const act = state.activities[actIndex];
    if (act.locked && updates.locked !== false) {
      // If locked and not unlocking, cannot edit
      return { updated: false, staleDependents: [] };
    }

    if (updates.student_task !== undefined) act.student_task = updates.student_task;
    if (updates.time !== undefined) act.time = updates.time;
    if (updates.locked !== undefined) act.locked = updates.locked;

    this.setActiveState(state);

    // Trigger Dependency Graph STALE marking
    const staleDependents = DependencyGraphService.markDependentsStale(activityId);
    return { updated: true, staleDependents };
  }
}
