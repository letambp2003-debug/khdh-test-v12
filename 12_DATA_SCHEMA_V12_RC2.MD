# DATA SCHEMA V12-RC2

```yaml
PROJECT:
  project_id:
  user_id:
  subject:
  grade:
  school_year:
  sources:
  lesson_catalog:
```

```yaml
LESSON_STATE:
  lesson_id:
  data_pack:
  blueprint:
  khdh:
  nls_map:
  evidence_map:
  time_map:
  period_map:
  slides: []
  worksheets: []
  games: []
  videos: []
  qa:
  version:
```

```yaml
ARTIFACT:
  artifact_id:
  type: SLIDE | WORKSHEET | GAME | VIDEO
  lesson_id:
  period_id:
  activity_refs: []
  yccd_refs: []
  nls_refs: []
  source_refs: []
  content:
  qa:
  version:
  stale:
```

Dependency:
```text
SOURCE
→ DATA_PACK
→ BLUEPRINT
→ KHDH
→ PERIOD
→ ARTIFACT
```

Nếu parent thay đổi:
child liên quan = `STALE`, không tự xóa.
