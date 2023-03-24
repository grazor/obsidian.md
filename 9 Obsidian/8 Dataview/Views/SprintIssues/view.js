const username = "smporyvaev";
const systemDir = "9 Obsidian";

let now = input.now;

let weight = {"open": 1, "in_progress": 0, "complete": 3};

let current = dv.current();
let tag = current.tags.filter(t => t.startsWith("work/y"))[0];

function render() {
	for (
			g of 
			dv.pages(`#${tag} and #work/issue`)
			.groupBy(p => (p.assignee.includes(username) ? "My" : "Other"))
			.sort(g => g.key)
	) {
		dv.header(3, g.key);
		for (
			gg of g.rows
			.groupBy(p => p.status_code)
			.sort(g => weight[g.key])
		) {
			dv.el("p", "");
			for (p of gg.rows) {
				child(p, gg.key);
			}
		}
	}
}

function child(p, group) {
	let title = dv.fileLink(p.file.name);
	if (p.description) {
		title += ". " + p.description;
	}

	if (group == "complete") {
		dv.el("span", "- [X] " + title);
	} else if (group == "in_progress") {
		dv.el("span", "- [ ] WIP: " + title);
	} else {
		dv.el("span", "- [ ] TODO: " + title);
	}
}

render();
