---
created: <% tp.file.creation_date() %>
tags:
  - kind/daily
---

# <% moment(tp.file.title,'YYYY-MM-DD').format("dddd, MMMM DD, YYYY") %>

[[Dashboard]] | [[Projects]] | [[Areas]] | [[Resources]] | [[Archive]] | [[Quick Capture]]

<< [[<% fileDate = moment(tp.file.title, 'YYYY-MM-DD-dddd').subtract(1, 'd').format('YYYY-MM-DD-dddd') %>|Yesterday]] | [[<% fileDate = moment(tp.file.title, 'YYYY-MM-DD-dddd').add(1, 'd').format('YYYY-MM-DD-dddd') %>|Tomorrow]] >>

---
### 📅 Daily Tasks

##### 🚀 Work
- [ ] 

##### 📝 Other
- [ ] 

---
# 📝 Notes
<% tp.file.cursor() %>

---
### Previous tasks
```dataviewjs
await dv.view("9 Obsidian/8 Dataview/Views/Tasks", {
	now: now,
});
```

### Notes created today
```dataview
List FROM "" WHERE file.cday = date("<%tp.date.now("YYYY-MM-DD")%>") SORT file.ctime asc
```

### Notes last touched today
```dataview
List FROM "" WHERE file.mday = date("<%tp.date.now("YYYY-MM-DD")%>") SORT file.mtime asc
```
