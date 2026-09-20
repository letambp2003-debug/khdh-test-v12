# AGENT ARCHITECTURE V12-RC2

Khuyến nghị 16 service/agent logic:

```text
01 AuthSessionService
02 SourceIndexerAgent
03 LessonRouterAgent
04 SubjectProfileAgent
05 LessonTypeAgent
06 OldKhdhMatcherAgent
07 FormTemplateAgent
08 BlueprintAgent
09 KhdhBuilderAgent
10 NlsEvidenceAgent
11 MathVisualAgent
12 PeriodSlideAgent
13 WorksheetAgent
14 GameAgent
15 VideoDirectorAgent
16 QAAgent
```

`WorkflowOrchestrator` điều phối.
Agents không gọi trực tiếp nhau.

## Artifact agents
Worksheet/Game/Video chỉ chạy khi:
- KHDH_STATE tồn tại;
- Source QA hợp lệ;
- selected period/activity tồn tại.

Không sinh artifact rời khỏi bài.
