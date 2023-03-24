let now = input.now;

let current = dv.current();

function render() {
	for (
			g of 
			dv.pages(`#work/issue`)
			.filter(p => p.file.path.startsWith(current.file.folder))
			.groupBy(p => p.watch_reason || "Unknown")
			.sort(g => {
				if (g.key == "Assigned") {
					return 0;
				}
				if (g.key.startsWith("OKR")) {
					return 1;
				}
				return g.key;
			})
		) {
		dv.header(3, g.key);
		for (p of g.rows.sort(p => {
			if (!isOpen(p)) {
				return "zzzzz";
			}
			if (p.points == undefined || p.points == "null" || p.points == -1) {
				return p.issue;
			}
			return "xxxxx";
		})) {
			child(p, g.key)
		}
	}
}

function isOpen(p) {
	return p.status == "Open" || p.status == "In Progress";
}

function child(p, group) {
	let est = (p.points == undefined || p.points == -1 || p.points == null ? "?" : p.points);
	let title = `[[${p.file.name}|${p.issue}]] [${est} sp] ${p.summary}`;


	if (p.status == "Open") {
		dv.el("span", "- [ ] " + title);
	} else if (p.status == "In Progress" || p.status == "In Review") {
		dv.el("span", "- [ ] " + title);
	} else {
		dv.el("span", "- [X] " + title);
	}

}

render();
