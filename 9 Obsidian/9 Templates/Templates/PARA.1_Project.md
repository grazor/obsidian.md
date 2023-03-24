---
due_to: <% tp.date.now("YYYY-MM-DD", 30) %>
reviewed_at: <% tp.date.now("YYYY-MM-DD") %>
review_frequency: 28 days
status: created
is_archived: false
progress_pc: 0
order: 90
tags:
  - para/project
  - kind/personal
---

[[Projects]]

Description:: 

Goal:: 

## Roadmap
- [ ] Update description
- [ ] Update goal
- [ ] Update metadata
- [ ] Fill roadmap ↓

## Articles

## Documents

```dataviewjs
await dv.view("9 Obsidian/8 Dataview/Views/ChildDocs", {
	context: this,
	now: now,
});
```
