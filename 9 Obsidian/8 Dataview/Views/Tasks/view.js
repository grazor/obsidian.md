const systemDir = "9 Obsidian";
const defaultOrder = 1000000;

let now = input.now();


function render() {
	let tasks = [];

	for (
		p of
		dv.pages(`"${dv.current().file.folder}"`)
		.filter(c => c.file.name !== dv.current().file.name && !c.hidden)
		.sort(p => p.order && p.file.name)
	) {
		let t = p.file.tasks.filter(t => (
			!t.fullyCompleted && t.text.trim() != ""
		));
		if (tasks) {
			tasks.push(...t);
		}
	}

	tasks = dv.array(tasks).groupBy(t => t.tags.at(0) || "none");
	if (tasks) { 
		dv.taskList(tasks, false);
	}

}

render();

