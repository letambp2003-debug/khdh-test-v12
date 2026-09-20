# KHDH/KHBG PIPELINE V12-RC2

## 1. Route

```text
PL1 LESSON
+ SGK LESSON
+ OLD MATCH
+ FORM PROFILE
→ LESSON ROUTE
```

## 2. Blueprint

```yaml
LESSON_BLUEPRINT:
  subject_profile:
  lesson_type:
  objectives:
  nls_targets: []
  sections:
    A:
    B:
    C:
    D:
  student_products: []
  evidence_targets: []
  differentiation:
  visual_assets: []
  total_periods:
  total_minutes:
```

Chỉ build khi:
`BLUEPRINT_QA_OK`.

## 3. Activity schema

```yaml
ACTIVITY:
  activity_id:
  section:
  objective_refs: []
  yccd_refs: []
  nls_refs: []
  content:
  student_task:
  teacher_actions:
  product:
  evidence:
  digital_tool:
  source_refs: []
  minutes:
```

## 4. NLS consistency gate

Nếu `nls_refs` khác rỗng, bắt buộc có:
- student_task;
- digital_tool;
- product;
- evidence;
- cách kiểm chứng.

Nếu thiếu:
`NLS_MAPPING_FAIL`.

## 5. Period Map

```yaml
PERIOD_MAP:
  - period_index:
    ppct:
    activity_refs: []
    yccd_refs: []
    nls_refs: []
    product_refs: []
    slide_target: 18
```

Artifact Hub sử dụng PERIOD_MAP để lọc theo tiết.
