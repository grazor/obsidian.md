<%*
function issueExists(name) {
	let baseDir = tp.file.folder(true);
	files = app.vault.getMarkdownFiles().filter(
		f => f.path.includes(baseDir) && f.path.includes(name)
	);
	return files.length > 0;
}

async function issueToNote(data) {
	if (!issueExists(data.key)) {
		let path = `${tp.file.folder(true)}/${data.key}.md`;
		await tp.file.create_new(tp.file.find_tfile("WRK.4_Jira Issue"), path);
		new Notice(`Created: ${data.key}`);
	} else {
		new Notice(`Exists: ${data.key}`);
	}

	let detail = JSON.parse(await tp.user.jira({id: data.key}));
	return {
		id: data.key,
		description: data.fields.summary,
		url: tp.user.jurl(data.self, data.key),
	}
}

let y = JSON.parse(await tp.user.jira_tasks()).issues;

let issues = [];
for (i in y) {
	issues.push(await issueToNote(y[i]));
}
%>