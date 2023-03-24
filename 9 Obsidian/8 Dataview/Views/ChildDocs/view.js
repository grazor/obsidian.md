let context = input.context;
let now = input.now();


function render() {
	for (
		p of
		dv.pages(`"${dv.current().file.folder}"`)
		.filter(c => c.file.name !== dv.current().file.name && !c.hidden)
		.sort(p => p.order && p.file.name)
	) {
		let title = dv.fileLink(p.file.name);
		if (p.description) {
			title += ". " + p.description;
		}
		dv.el("li", title)
	}
}

render();
