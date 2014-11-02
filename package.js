// https://github.com/evilstreak/markdown-js

Package.describe({
	summary: "A markdown parser and compiler with intermediate JsonML representation"
,	version: "0.0.1"
,	name: "xananax:markdown-js"
,	git: "https://github.com/xananax/meteor-markdown-js.git"
});

Npm.depends({
	'markdown': '0.5.0'
});

Package.on_use(function (api) {
	api.versionsFrom("0.9.0");
	api.use("templating", "client", {weak: true});
	api.imply("templating")
	api.add_files('.npm/package/node_modules/markdown/lib/markdown.js','client');
	api.add_files('markdown-js.js',['client','server']);
	api.add_files('template-integration.js', 'client');
	api.export('markdown');
});
