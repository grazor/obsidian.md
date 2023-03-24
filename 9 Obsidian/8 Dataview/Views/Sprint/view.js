const systemDir = "9 Obsidian";

let now = input.now;

let weight = {"Past": 2, "Present": 0, "Future": 1};

let current = dv.current();
let tag = current.tags.filter(t => t.startsWith("work/y"))[0];

function render() {
	for (
			g of 
			dv.pages(`#${tag} and #work/sprint`)
			.groupBy(p => {
				let from = dv.date(p.starts_at);
				let to = dv.date(p.ends_at);
				if (now > to) {
					return "Past";
				} else if (now > from) {
					return "Present";
				} else {
					return "Future";
				}
			})
			.sort(g => weight[g.key])
		) {
		dv.header(3, g.key);
		for (p of g.rows.sort(p => dv.date(p.starts_at))) {
			child(p, g.key)
		}
	}
}

function child(p, group) {
	let title = dv.fileLink(p.file.name) + ` (${p.starts_at.toISODate()} — ${p.ends_at.toISODate()})`;
	if (group == "Past") {
		dv.el("span", "- [X] " + title);
	} else if (group == "Future") {
		dv.el("span", "- [ ] " + title);
	} else {
		dv.el("span", "- [ ] " + title);
	}
}

render();
