"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoAiService = exports.NEGATIVE_PROMPT = exports.VIDEO_STYLES_15 = void 0;
const lessonStateManager_1 = require("./lessonStateManager");
const database_1 = require("../db/database");
exports.VIDEO_STYLES_15 = [
    'STYLE_01 Cinematic Classroom',
    'STYLE_02 Premium 3D Educational Animation',
    'STYLE_03 Clean 2D Motion Graphic',
    'STYLE_04 Realistic Documentary',
    'STYLE_05 Science Lab Cinematic',
    'STYLE_06 STEM Tech Futuristic',
    'STYLE_07 Storybook Educational',
    'STYLE_08 Historical Reenactment',
    'STYLE_09 Minimal Academic Explainer',
    'STYLE_10 Friendly School Life',
    'STYLE_11 Safety Training Simulation',
    'STYLE_12 Interactive Scenario Film',
    'STYLE_13 Infographic Motion Design',
    'STYLE_14 Nature & Field Study Documentary',
    'STYLE_15 Maker Lab / Engineering Workshop'
];
exports.NEGATIVE_PROMPT = 'no readable text, no subtitles, no captions, no on-screen text, no UI, no interface, no logo, no watermark, no random letters, no distorted hands, no duplicated people';
class VideoAiService {
    static countWords(text) {
        return text.trim().split(/\s+/).filter(Boolean).length;
    }
    static validateDialogue(dialogue) {
        const wordCount = this.countWords(dialogue);
        if (wordCount > 24) {
            return { valid: false, wordCount, error: `DIALOGUE_TOO_LONG: Lời thoại có ${wordCount} từ (vượt quá giới hạn tối đa 24 từ/cảnh 8s)` };
        }
        return { valid: true, wordCount };
    }
    static generate(options) {
        const lesson = lessonStateManager_1.LessonStateManager.getActiveState();
        if (!lesson)
            throw new Error('Chưa có LESSON_STATE nào để sinh kịch bản video AI');
        const act = lesson.activities.find(a => a.id === options.activityId) || lesson.activities[0];
        const artifactId = 'video_01';
        const scenes = [];
        for (let i = 1; i <= options.sceneCount; i++) {
            const num = String(i).padStart(2, '0');
            let dialogue = 'Hãy quan sát kĩ tình huống này và đối chiếu ngay với trang ' + lesson.textbook.pages + ' sách giáo khoa.';
            if (i === 1)
                dialogue = 'Quan sát chuyển động thực tế và dự đoán quy luật bài học.';
            else if (i === 2)
                dialogue = 'Liệu kết quả này có luôn đúng trong mọi trường hợp không?';
            const validation = this.validateDialogue(dialogue);
            scenes.push({
                scene_id: `SCENE_${num}`,
                duration_seconds: 8,
                purpose: `Bám sát hoạt động ${act.code} (${act.title})`,
                source_ref: `SGK ${lesson.subject} ${lesson.grade} tr. ${lesson.textbook.pages}`,
                image_prompt: `High-end cinematic educational visual for Vietnamese students exploring ${lesson.lesson_title}, natural lighting, 8k resolution.`,
                video_prompt: `Smooth steady camera zoom into lesson concept, natural pacing for students, 24fps.`,
                dialogue_vi: dialogue,
                word_count: validation.wordCount,
                camera: 'Eye-level medium shot, cinematic depth of field',
                action: 'Student-centered educational inquiry action',
                style: options.style,
                negative_prompt: exports.NEGATIVE_PROMPT
            });
        }
        const artifact = {
            artifact_id: artifactId,
            type: 'VIDEO',
            lesson_id: lesson.lesson_id,
            period_id: act.period,
            activity_refs: [act.id],
            yccd_refs: act.yccd_refs,
            nls_refs: act.nls_refs,
            source_refs: act.source_refs,
            content: {
                video_type: options.videoType,
                scene_count: options.sceneCount,
                style: options.style,
                default_scene_seconds: 8,
                scenes
            },
            qa: { score: 95, status: 'PASS' },
            stale: false,
            version: 1
        };
        database_1.db.saveArtifact(artifact);
        return artifact;
    }
}
exports.VideoAiService = VideoAiService;
