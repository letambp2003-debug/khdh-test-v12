"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonStateManager = void 0;
const database_1 = require("../db/database");
const dependencyGraph_1 = require("./dependencyGraph");
class LessonStateManager {
    static activeLessonId = null;
    static getActiveState() {
        if (!this.activeLessonId) {
            const all = database_1.db.getAllLessons();
            if (all.length > 0) {
                this.activeLessonId = all[0].lesson_id;
                return all[0];
            }
            return null;
        }
        return database_1.db.getLessonState(this.activeLessonId);
    }
    static setActiveState(state) {
        state.updated_at = new Date().toISOString();
        state.version = (state.version || 0) + 1;
        this.activeLessonId = state.lesson_id;
        database_1.db.saveLessonState(state);
    }
    static updateActivity(activityId, updates) {
        const state = this.getActiveState();
        if (!state)
            return { updated: false, staleDependents: [] };
        const actIndex = state.activities.findIndex(a => a.id === activityId);
        if (actIndex === -1)
            return { updated: false, staleDependents: [] };
        const act = state.activities[actIndex];
        if (act.locked && updates.locked !== false) {
            // If locked and not unlocking, cannot edit
            return { updated: false, staleDependents: [] };
        }
        if (updates.student_task !== undefined)
            act.student_task = updates.student_task;
        if (updates.time !== undefined)
            act.time = updates.time;
        if (updates.locked !== undefined)
            act.locked = updates.locked;
        this.setActiveState(state);
        // Trigger Dependency Graph STALE marking
        const staleDependents = dependencyGraph_1.DependencyGraphService.markDependentsStale(activityId);
        return { updated: true, staleDependents };
    }
}
exports.LessonStateManager = LessonStateManager;
