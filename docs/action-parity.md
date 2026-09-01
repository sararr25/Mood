# MOOD action parity

MOOD has one runtime project state in Zustand. The selected direction is the canonical source for palette and typography; the System view is a synchronized projection. UI and WebMCP call the same store/domain actions.

| Action | Human UI | WebMCP tool | Domain action | Resulting state |
| --- | --- | --- | --- | --- |
| Create project | Project home | `create_project` | `createProject()` | Active project created |
| Add / keep / reject / restore reference | Explore card/dialog | `add_reference`, `keep_reference`, `reject_reference`, `restore_reference` | reference store actions | Reference and order persisted |
| Note reference | Explore note dialog | `add_reference_note` | `addReferenceNote()` | Reference note persisted |
| Reorder reference | Drag on Explore | `reorder_references` | `reorderReferences()` | `referenceOrder` persisted |
| Create / select direction | Direction | `create_direction`, `select_direction` | direction store actions | Selected direction drives views |
| Update palette | Direction palette context | `update_palette` | `updatePalette()` | Direction and System colors update atomically |
| Update typography | Refine / System | `update_typography_token` | `updateTypography()` | Direction and System typography update atomically |
| Create / lock decision | Refine | `create_design_decision`, `lock_design_decision` | decision store actions | Decision evidence and lock persisted |
| Apply critique | Refine critique | `apply_suggestion` | `applySuggestion()` | Suggestion mutation uses canonical action |
| Navigate phase | Top navigation | `navigate_to_phase` | `setPhase()` | Current phase updates immediately |

Runtime creative requests use site tools and modify the already-open application. They never require a build, commit, or deployment. Development requests that change application code do.
