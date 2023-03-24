<%*
Date.prototype.fmt = function() {
    return this.toISOString().slice(0, 10);
}

let sprints = tp.user.sprint.sprintsDate().concat( tp.user.sprint.sprintsNextQ());

for (var sp of sprints) {
	let path = `${tp.file.folder(true)}/${sp.fileName}.md`;
	if (!await tp.file.exists(path)) {
		await tp.file.create_new(tp.file.find_tfile("WRK.2_Sprint Blank"), path);
	}
}

let sprintName = `${sprints[0].quarter}${sprints[sprints.length-1].quarter}`; 
let tag = `work/${sprintName}`;

tR += `---
due_to: ${sprints[sprints.length-1].end.fmt()}
reviewed_at: ${sprints[0].end.fmt()}
review_frequency: 14 days
status: created
is_archived: false
progress_pc: 0
order: 1
tags:
  - para/project
  - kind/work
  - work/reviewperiod
  - ${tag}
---

Description:: Avito Paas Dev

Goal:: 

Календарь [miro](https://miro.com/app/board/uXjVOJouKx0=/)

## Sprints

\`\`\`dataviewjs
await dv.view(
	"9 Obsidian/8 Dataview/Views/Sprint", {
	now: now(),
});
\`\`\`

---
## Issues watched

\`\`\`dataviewjs
await dv.view(
	"9 Obsidian/8 Dataview/Views/Watched", {
	now: now(),
});
\`\`\`

---
## No task

- 
`
%>