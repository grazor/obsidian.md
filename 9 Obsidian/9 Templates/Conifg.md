# Obsidian templater

```
jira: jira view -t debug $id
jira_tasks: jira list -t debug -a smporyvaev
jira_tasks: jira list -t debug -q 'assignee = smporyvaev AND Sprint in openSprints() AND Sprint not in futureSprints()'
```