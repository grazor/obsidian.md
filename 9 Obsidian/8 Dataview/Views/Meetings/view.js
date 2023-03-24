const dateFmt = "dd.LL.yyyy";
const noteFmt = "yyyy-LL-dd";

let now = input.now;

let current = dv.current();
let tag = current.tags?.filter(t => t.startsWith("work/meeting/"))?.at(0);

function render() {
	let meetings = dv.pages(`#${tag}`).sort(p => dv.date(p.meeting_date));
	let meetingIdx = meetings.findIndex(p => p.file.name == current.file.name);

	let nav = [];
	if (meetingIdx > 0) {
		let prev = meetings[meetingIdx-1];
		let dt = dv.date(prev.meeting_date).toFormat(dateFmt);
		nav.push(dv.fileLink(prev.file.name, false, `< Previous (${dt})`));
	} else {
		nav.push("First");
	}

	if (meetingIdx != meetings.length - 1) {
		let next = meetings[meetingIdx+1];
		let dt = dv.date(next.meeting_date).toFormat(dateFmt);
		nav.push(dv.fileLink(next.file.name, false, `Next (${dt}) >`));

		let last = meetings[meetings.length-1];
		dt = dv.date(last.meeting_date).toFormat(dateFmt);
		nav.push(dv.fileLink(last.file.name, false, `Last (${dt}) >>`))
	} else {
		if (meetingIdx > 0) {
			let prevDt = dv.date(meetings[meetingIdx-1].meeting_date);
			let curDt = dv.date(meetings[meetingIdx].meeting_date);

			let diff = curDt.diff(prevDt, "days");
			let nextDt = curDt.plus(diff);

			let noteDt = nextDt.toFormat(noteFmt);
			let meetingName = current.file.name.split(" ").slice(1).join(" ");

			let fileName = `${current.file.folder}/M.${noteDt} ${meetingName}.md`;
			nav.push(dv.fileLink(fileName, false, `Schedule (${noteDt}) >>`));
		}
	}

	let catalog = dv.pages("#work/meeting").filter(p => p.tags.includes("work/meeting"))[0];

	let line = ""; 
	if (catalog) {
		line += dv.fileLink(catalog.file.name, false, "Meetings") + ": ";
	}
	line += nav.join(" | ");

	dv.el("p", line);

}

render();
