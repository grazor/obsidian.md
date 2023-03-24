const systemDir = "9 Obsidian";
const defaultOrder = 1000000;

let kind = input.kind;
let minimal = input.minimal;
let context = input.context;
let now = input.now();


function render() {
	let section = new ParaSection(kind);
	if (!minimal) {
		section.render_full();
	} else {
		section.render_minimal();
	}
}


class ParaSection {
	constructor(kind) {
		this.kind = kind;
		this.minimal = minimal;
		this.is_archived = false;
		this.tag = `#para/${kind}`;
		if (kind == "archive") {
			this.tag = `#para`;
			this.is_archived = true;
		}
	}

	children() {
		return dv.pages(`${this.tag}`)
				 .filter(c => !c.file.path.startsWith(systemDir) && c.is_archived == this.is_archived)
			     .sort(c =>
					 !c.is_archived
					 && (c.order != undefined? c.order : defaultOrder)
					 && c.file.name
				 )
				 .map(c => ElementFactory.create(this.kind, c));
	}

	render_full(minimal) {
		for (let c of this.children()) {
			c.render_full();
		}
	}

	render_minimal() {
		for (let c of this.children()) {
			c.render_minimal();
		}
	}
};

class ParaElement {
	constructor(page) {
		this.page = page;
	}

	children() {
		return dv.pages(`"${this.page.file.folder}"`)
			     .filter(c => c.file.name !== this.page.file.name && !c.hidden)
			     .sort(c =>
					 (c.order != undefined? c.order : defaultOrder)
					 && c.file.name
				 )
				 .map(c => new ElementNote(c));
	}

	reviewRequired() {
		if (!this.page.reviewed_at || !this.page.review_frequency) {
			return false
		}
		return now > dv.date(this.page.reviewed_at) + dv.duration(this.page.review_frequency);
	}

	isOverdue() {
		if (!this.page.due_to) {
			return false
		}
		return now > dv.date(this.page.due_to);
	}

	remained() {
		if (!this.page.due_to) {
			return undefined;
		}
		return Math.floor((dv.date(this.page.due_to) - now)/60/60/1000/24);
	}

	title() {
		let progress = "";
		if (this.page.progress_pc != undefined) {
			progress = `[${this.page.progress_pc}%] `;
		}

		let warns = "";
		if (this.isOverdue() && !this.page.is_archived) {
			warns += "❗";
		}
		if (this.reviewRequired() && !this.page.is_archived) {
			warns += "❓";
		}
		if (warns.length > 0) {
			warns += " ";
		}

		let state = "";
		if (this.page.status) {
			state = ` (${this.page.status})`;
		}

		let fname = this.page.file.name;
		fname = fname.replace(/^! /g, '');
		
		return `${progress}${warns}${dv.fileLink(this.page.file.name, false, fname)}${state}`;
	}

	shortDescription() {
		if (this.page.description != undefined && this.page.description.length < 100) {
			return this.page.description;
		}
		return "";
	}

	render_full() {
		dv.header(2, this.title());
		if (this.page.description) {
			dv.paragraph(this.page.description);
		}

		if (this.page.goal) {
			dv.paragraph(`Goal: ${this.page.goal}`);
		}

		let remained = this.remained();
		if (remained != undefined && !this.page.is_archived) {
			dv.paragraph(`Days left: ${remained}`);
		}

		for (let c of this.children()) {
			c.render_full();
		}

		dv.el("br", "");
	}

	render_minimal() {
		let desc = this.shortDescription();
		if (desc != "") {
			desc = ". " + desc;
		}
		dv.el("li", this.title() + desc);
	}
}

class ProjectElement extends ParaElement {
	header() {
		console.log(context);
		let header = dv.el("div", "");
		let progressOutter = header.createEl("div", {style: "width:30px"});
		let progressInner = progressOutter.createEl("div", "a");

		let title = header.createEl("h2", {text: "lol"});

		progressOutter.appendChild(progressInner);
		header.appendChild(progressOutter);
		header.appendChild(title);

		console.log(header);
		//context.container.appendChild(header);
		//dv.header(2, this.title());
	}

	_render_full() {
		this.header();

		if (this.page.description) {
			dv.paragraph(this.page.description);
		}

		if (this.page.goal) {
			dv.paragraph(`Goal: ${this.page.goal}`);
		}

		let remained = this.remained();
		if (remained != undefined) {
			dv.paragraph(`Days left: ${remained}`);
		}

		for (let c of this.children()) {
			c.render_full();
		}

		dv.el("br", "");
	}
}

class AreaElement extends ParaElement {

}

class ResourceElement extends ParaElement {

}

class ArchiveElement extends ParaElement {

}

class ElementFactory {
	static create(kind, page) {
		if (kind == "project") {
			return new ProjectElement(page);
		} else if (kind == "area") {
			return new AreaElement(page);
		} else if (kind == "resource") {
			return new ResourceElement(page);
		}
		return new ArchiveElement(page);
	}
}

class ElementNote {
	constructor(page) {
		this.page = page;
	}

	title() {
		return `${dv.fileLink(this.page.file.name, false)}`;
	}

	render_full() {
		dv.el("li", this.title());
	}

	render_minimal() {

	}
}


render();

