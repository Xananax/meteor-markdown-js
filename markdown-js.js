markdown = (function(){

	var md = ((typeof window!=='undefined') && window.markdown) ? window.markdown : Npm.require('markdown').markdown;

	var run_hooks = function(hooks,data){
		var i = 0, l = hooks.length,fn;
		for(i;i<l;i++){
			fn = hooks[i];
			fn(data);
		}
	}

	var hooks = {
		'before':[]
	,	'json':[]
	,	'html':[]
	,	'after':[]
	};

	var render = function(content){
		if(hooks['before'] && hooks.before.length){run_hooks(hooks.before,{data:content});}
		var jsonMLTree = md.parse(content);
		if(hooks['json'] && hooks.json.length){run_hooks(hooks.json,jsonMLTree);}
		var htmlTree = md.toHTMLTree(jsonMLTree);
		if(hooks['html'] && hooks.html.length){run_hooks(hooks.html,htmlTree);}
		var html = md.renderJsonML(htmlTree);
		if(hooks['after'] && hooks.after.length){run_hooks(hooks.after,{data:html});}
		return html;
	}

	var register_hook = function(hook_name,fn){
		if(!fn){return register_hook_curry(hook_name);}
		if(!hooks[hook_name]){hooks[hook_name] = [];}
		hooks[hook_name].push(fn);
		return register_hook_curry(hook_name);
	}

	var register_hook_curry = function(hook_name){
		return function(fn){
			return register_hook(hook_name,fn);
		}
	}

	render.register = register_hook;
	render.markdown = md;

	return render;

})();