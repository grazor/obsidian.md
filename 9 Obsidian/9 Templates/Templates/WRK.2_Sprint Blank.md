<%*
Date.prototype.fmt = function() {
    return this.toISOString().slice(0, 10);
}

let parts = tp.file.title.matchAll(/(\d+).*(\d+).*(\d+)/g);

let r,y,q,s;
for (let a of parts) {
	[r,y,q,s] = a;
}

let sprint = tp.user.sprint.get(tp, app, `20${y}`, q, s);
tR += sprint.note();
%>