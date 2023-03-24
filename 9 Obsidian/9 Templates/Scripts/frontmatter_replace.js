// returns document contents replacing frontmatter with updated one
module.exports = (tp, app, frontmatter = {}, order = []) => {
	let {position} = tp.frontmatter;
	//let fm = tp.obsidian.stringifyYaml(frontmatter).trim();
	
	let fm = ""; 
	if (order.length == 0) {
		fm = tp.user.jsyaml(frontmatter);
	} else {
		const orderMap = order
			.map((x,i) => ({k: x, v: i}))
			.reduce((acc, {k,v}) => ({...acc, [k]: v}), {});

		fm = tp.user.jsyaml(frontmatter, {
			sortKeys: (a, b) => (orderMap[a] - orderMap[b]),
		});
	}

	let content = app.workspace.activeEditor.data;
	
	let result = ["---", fm.trim(), "---"].join("\n");

	if (typeof position === "object" && Object.keys(position).length !== 0) {
		result += content.substring(position.end.offset);
	} else {
		result += content;
	}

	/*
	let curContent = await this.app.vault.read(qcFile);
    let newContents;
    this.app.vault.modify(qcFile, newContents);
	 */

	app.workspace.activeEditor.clear();

	return result
};
