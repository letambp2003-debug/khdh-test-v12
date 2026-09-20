"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraphService = void 0;
const database_1 = require("../db/database");
class DependencyGraphService {
    // Activity ID -> List of dependent Artifact IDs
    static graph = {
        'act_b2': ['worksheet_01', 'game_01', 'video_01', 'slide_p1'],
        'act_b1': ['slide_p1'],
        'act_c1': ['game_01', 'slide_p2'],
        'act_d1': ['slide_p2', 'worksheet_01']
    };
    static getDependents(activityId) {
        return this.graph[activityId] || [];
    }
    static markDependentsStale(activityId) {
        const dependents = this.getDependents(activityId);
        for (const artId of dependents) {
            database_1.db.markArtifactStale(artId, true);
        }
        return dependents;
    }
    static clearStale(artifactId) {
        database_1.db.markArtifactStale(artifactId, false);
    }
}
exports.DependencyGraphService = DependencyGraphService;
