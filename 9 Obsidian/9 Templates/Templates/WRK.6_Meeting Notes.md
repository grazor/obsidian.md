<%*
let meetingDate = tp.file.title.match(/\d{4}-\d{2}-\d{2}/g).at(0) || tp.date.now("YYYY-MM-DD");
let name = tp.file.title.split(" ").slice(1).join(" ");

let tag = "";
let description = "";
if (name) {
		let baseDir = tp.file.folder(true);
		let files = app.vault.getMarkdownFiles().filter(
			f => f.path.startsWith(baseDir) && f.path.includes(name)
		);

		for (let f of files) {
			let ff = await app.vault.read(f);
			let matches = ff.match(/work\/meeting\/.*/g);
			if (!tag && matches) {
				tag = matches[0];
			}
			
			let descMatches = ff.match(/Description::.*/g);
			if (!description && descMatches) {
				description = descMatches[0];
			}
			
			if (tag && description) {
				break;
			}
		}
}

if (tag == "") {
	tag = "work/meeting";
}

if (description == "") {
	description = "Description:: ";
}

-%>
---
meeting_date: <% meetingDate %>
name: <% name %>
hidden: true
tags:
  - <% tag %>
---

<% description %>

```dataviewjs
await dv.view(
	"9 Obsidian/8 Dataview/Views/Meetings", {
	now: now(),
});
```

# <% name %>

## Info

Participants: `@smporyvaev`, 

## Raw / Plan


## Follow Up
