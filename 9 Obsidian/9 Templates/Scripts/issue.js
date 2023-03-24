const username = "MYUSERNAME";

const frontmatterOrder = [
	"issue", "summary", "url", "status", "status_code", "points", "watch_reason",
	"priority", "created_at", "reporter", "assignee", "hidden", "tags",
];

const issueRegex = /[A-Z]+-\d+/g;

Date.prototype.fmt = function() {
    return this.toISOString().slice(0, 10);
}

class Issue {
	static async load(tp, app, id) {
		let data = await tp.user.jira({id});
		let json = JSON.parse(data);
		let issue = new Issue(tp, app, json);

		await issue.loadEpic();
		return issue;
	}

	static getId(str) {
		let ids = str.match(issueRegex);
		return ids.at(0);
	}

	constructor(tp, app, data) {
		this.tp = tp;
		this.app = app;
		this.id = data.key;
		this.data = data;
		this.epic = undefined;
	}

	summary = () => this.data.fields.summary;
	url = () => {
		let base = this.data.self;
		let i = new URL(base);
		i.pathname = `/browse/${this.id}`;
		return i.toString();
	}

	description = () => this.tp.user.j2m(this.data.fields.description).trim();
	descriptionQuote = () => this.description().split("\n").join("\n> ");

	reporterLogin = () => this.data.fields.reporter.name;
	reporterFullname = () => this.data.fields.reporter.displayName;
	reporter = () => `${this.reporterFullname()} (@${this.reporterLogin()})`;

	assigneeLogin = () => this.data.fields.assignee.name;
	assigneeFullname = () => this.data.fields.assignee.displayName;
	assignee = () => `${this.assigneeFullname()} (@${this.assigneeLogin()})`;

	createdAt = () => new Date(this.data.fields.created);
	createdRepr = () => this.createdAt().fmt();

	points = () => this.data.fields.customfield_10212 || -1;
	priority = () => this.data.fields.priority?.name || "Normal";

	status = () => this.data.fields.status.name;
	isComplete = () => this.data.fields.status.statusCategory.key == "done";
	isInProgress = () => this.data.fields.status.statusCategory.key == "indeterminate";
	isOpen = () => this.data.fields.status.statusCategory.key == "new";
	statusCode = () => {
		if (this.isOpen()) return "open";
		if (this.isInProgress()) return "in_progress";
		return "complete";
	}

	epicId = () => this.data.fields.customfield_10216;

	kind = () => "ISSUE TODO";
	kindTag = () => "ISSUE/EPIC";

	comments = () => this.data.fields.comment.comments.map(c => ({
			authorFullname: c.author.displayName,
			authorLogin: c.author.name,
			createdAt: new Date(c.created),
			createdAtRepr: new Date(c.created).fmt(),
			body: c.body,
	}));

	watchReason = () => {
		if (this.assigneeLogin() == username) {
			return "Assigned";
		} else if (this.reporterLogin() == username) {
			return "Reported";
		}
		return "Unknown";
	}

	async loadEpic() {
		let id = this.epicId();
		if (id == undefined) {
			return;
		}
		this.epic = await Issue.load(this.tp, this.app, id);
	}

	sprintSpec = () => {
		let sprints = this.data.fields.customfield_10215;
		if (sprints == undefined) {
			return undefined
		}

		let sprint = sprints.at(-1);
		if (sprint == undefined) {
			return undefined
		}
		let parts = sprint.matchAll(/Dev sprint \d{2}(\d{2}).Q(\d) #(\d)/g);
		let r,y,q,s;
		for (let a of parts) {
			[r,y,q,s] = a;
		}
		return [y,q,s];
	}

	sprint = () => {
		let sprintSpec = this.sprintSpec();
		if (sprintSpec == undefined) {
			return undefined;
		}
		let sprint = this.tp.user.sprint.get(this.tp, this.app, ...sprintSpec);
		return sprint;
	}

	sprintTag = () => {
		let sprint = this.sprint();
		if (sprint != undefined) {
			return sprint.sprintTag();
		}

		sprint = new this.tp.user.sprint(this.tp, this.app);
		return sprint.quarterTag();
	}

	noteName = () => {
		let baseDir = this.tp.file.folder(true);
		let files = this.app.vault.getMarkdownFiles().filter(
			f => f.path.startsWith(baseDir) && f.path.includes(this.id)
		) || [];
		return files.at(0)?.basename;
	}

	frontmatter = () => {
		let fm = this.frontmatterVolatile();

		fm.issue = this.id;
		fm.summary = this.summary();
		fm.url = this.url();
		fm.watch_reason = this.watchReason();
		fm.created_at = this.createdRepr();
		fm.hidden = true;
		fm.tags = [
			"kind/work",
			"work/issue",
			`${this.sprintTag()}`,
		];

		return fm;
	}

	frontmatterVolatile = () => {
		let fm = {
			priority: this.priority(),
			points: this.points(),
			reporter: this.reporter(),
			assignee: this.assignee(),
			status: this.status(),
			status_code: this.statusCode(),
			tags: [`${this.sprintTag()}`],
		}

		if (this.epic != undefined) {
			fm.tags.push(`work/epic/${this.epic.id}`);
		}

		return fm;
	}

	updateFrontmatter() {
		let {position, ...fmCurrent} = this.tp.frontmatter;
		let fm = this.frontmatter();

		if (typeof position == "object" && Object.keys(position).length !== 0) {
			fm = this.frontmatterVolatile();
			fm = this.tp.user.frontmatter_join(this.tp, fm);
		}

		return this.tp.user.frontmatter_replace(this.tp, this.app, fm, frontmatterOrder);
	}

	noteBody = () => {
		let tR = "\n";

		let sprint = this.sprint();
		if (sprint != undefined) {
			tR += `\nSprint: [[${sprint.noteName()}]]\n`;
		}

		let epic = this.epic;
		if (epic != undefined) {
			tR += `\nEpic: [[${epic.noteName()}]] ${epic.summary()}\n`;
		}

		tR += `
# [${this.id}](${this.url()}) ${this.summary()}

Description:: 

> [!abstract]- Description
> ${this.descriptionQuote()}`;

		let comments = this.comments();
		if (Array.isArray(comments) && comments.length > 0) {
			tR += '\n\n> [!example]- Comments\n';
			tR += comments.reverse().map((c) => `> ${c.authorFullname} (@${c.authorLogin})
	> ${this.tp.user.j2m(c.body).trim().split('\n').join('\n>> ')}`).join('\n> \n')
		}

		tR += '\n\n## Worklog\n\n* ';
		return tR;
	}

	note = () => {
		let {position, ...fm} = this.tp.frontmatter;
		let isEmpty = typeof fm !== "object" || Object.keys(fm).length === 0;
		let tR = this.updateFrontmatter();
		new Notice("Updated frontmatter", 2000);
		if (isEmpty) {
			tR += this.noteBody();
			new Notice("Appended body", 2000);
		}
		return tR;
	}
}

module.exports = Issue;
