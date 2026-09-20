import { db } from '../db/database';

export class DependencyGraphService {
  // Activity ID -> List of dependent Artifact IDs
  private static graph: Record<string, string[]> = {
    'act_b2': ['worksheet_01', 'game_01', 'video_01', 'slide_p1'],
    'act_b1': ['slide_p1'],
    'act_c1': ['game_01', 'slide_p2'],
    'act_d1': ['slide_p2', 'worksheet_01']
  };

  public static getDependents(activityId: string): string[] {
    return this.graph[activityId] || [];
  }

  public static markDependentsStale(activityId: string): string[] {
    const dependents = this.getDependents(activityId);
    for (const artId of dependents) {
      db.markArtifactStale(artId, true);
    }
    return dependents;
  }

  public static clearStale(artifactId: string): void {
    db.markArtifactStale(artifactId, false);
  }
}
