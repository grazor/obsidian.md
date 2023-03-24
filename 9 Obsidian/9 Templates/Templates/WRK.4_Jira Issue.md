<%*
let id = tp.user.issue.getId(tp.file.title);
if (!id) {
	throw "missing issue id";
}
let issue = await tp.user.issue.load(tp, app, id);
tR += issue.note();
%>