const frontmatterOrder = [
	"name", "starts_at", "ends_at", "hidden", "tags",
];

Date.prototype.fmt = function() {
    return this.toISOString().slice(0, 10);
}

Date.prototype.getQuarter = function() {
  return Math.ceil((this.getMonth() + 1) / 3)
}

Date.prototype.getWeek = function() {
  let onejan = new Date(this.getFullYear(),0,1);
  let today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  let dayOfYear = ((today - onejan + 86400000)/86400000);
  return Math.ceil(dayOfYear/7);
};

Date.prototype.getQWeek = function() {
  let d = new Date(this.getTime());
  let q = this.getQuarter();
  let qs = new Date(Date.UTC(this.getFullYear(), (q-1)*3, 1));
  if(qs.getDay() != 0){
    qs.setDate(qs.getDate() - (qs.getDay()-1));
  }
  return Math.round((d-qs)/(1000*60*60*24*14)) + 1;
};

class Sprint {
	constructor(tp, app, at) {
		let d = (at == undefined ? new Date() : new Date(at));

		this.tp = tp;
		this.app = app;
		this.start = Sprint.getPreviousMonday(d);
		this.end = Sprint.getSprintEndSunday(this.start);
	}

	year = () => this.start.getFullYear() % 100;
	quarter = () => this.start.getQuarter();
	calendarWeek = () => this.start.getWeek();
	quarterWeek = () => this.start.getQWeek();

	quarterCode = () => `y${this.year()}q${this.quarter()}`
	sprintCode = () => `${this.quarterCode()}s${this.quarterWeek()}`;
	fileNameSuffix = () => `${this.year()}.${this.quarter()} №${this.quarterWeek()}`;
	fileName = () => `Sprint ${this.fileNameSuffix()}`;

	startRepr = () => this.start.fmt();
	endRepr = () => this.end.fmt();

	halfYearTag = () => {
		let y = this.year();
		let q = this.quarter();

		let y1 = (q == 1 ? y-1 : y);
		let q1 = (q % 2 == 0 ? q : ((q + 2) % 4) + 1);
		let y2 = (q == 4 ? y+1 : y);
		let q2 = (q % 2 == 1 ? q : (q % 4) + 1);
		return `work/y${y1}q${q1}y${y2}q${q2}`;
	};
	quarterTag = () => `${this.halfYearTag()}/y${this.year()}/q${this.quarter()}`;
	sprintTag = () => `${this.quarterTag()}/s${this.quarterWeek()}`;

	noteName = () => {
		let baseDir = this.tp.file.folder(true);
		let files = this.app.vault.getMarkdownFiles().filter(
			f => f.path.startsWith(baseDir) && f.path.includes(this.fileNameSuffix())
		) || [];
		return files.at(0)?.basename;
	}

	frontmatter = () => {
		let fm = this.frontmatterVolatile();
		fm.hidden = true;
		return fm;
	}

	frontmatterVolatile = () => {
		let fm = {
			name: this.sprintCode(),
			starts_at: this.startRepr(),
			ends_at: this.endRepr(),
			tags: [
				"kind/work",
				"work/sprint",
				this.sprintTag(),
			],
		};
		return fm
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
		let tR = `

## Meetings

---
## Not tracked

---
## Issues
\`\`\`dataviewjs
await dv.view(
	"9 Obsidian/8 Dataview/Views/SprintIssues", {
	now: now(),
});
\`\`\`
---
`
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

	static getPreviousMonday(at) {
		let d = (at == undefined ? new Date() : new Date(at));
		while (d.getDay() != 1) {
			d.setDate(d.getDate() - 1);
		}
		return d;
	}

	static getSprintEndSunday(start) {
		let end = new Date(start);
		end.setDate(end.getDate() + 9);
		for (let offset = 0; offset < 5; offset++) {
			end.setDate(end.getDate() + 1);
			if (end.getDay() == 0) {
				break;
			}
		}
		return end
	}

	static get(tp, app, year, quarter, sprint) {
		let sprints = Sprint.quarterSprints(tp, app, year, quarter);
		return sprints.filter(s => s.quarterWeek() == sprint).at(0);
	}

	static quarterSprints(tp, app, year, quarter) {
		// offset 1 week
		let q = new Date(Date.UTC(year, (quarter-1)*3, 8));
		let nextQ = new Date(Date.UTC(year, (quarter)*3, 10));

		let sprints = [];
		while (q < nextQ) {
			let sprint = new Sprint(tp, app, q);
			sprints.push(sprint);
			q = new Date(sprint.end);
			q.setDate(q.getDate() + 1);
		}
		return sprints;
	}

	static quarterSprintsAt(tp, app, at) {
		let d = (at == undefined ? new Date() : new Date(at));
		let year = d.getFullYear();
		let quarter = d.getQuarter();
		return this.quarterSprints(year, quarter);
	}

	static nextQuarterSprints(tp, app) {
		let d = new Date();
		d.setDate(d.getDate() + 90);
		return Sprint.quarterSprintsAt(tp, app, d);
	}

	static halfYearSprints(tp, app) {
		return Sprint.quarterSprintsAt(tp, app).concat(Sprint.nextQuarterSprints(tp, app));
	}
}

module.exports = Sprint;
