if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require", "./ajax"],function (require, Ajax)
{
	var deep = require("deep/deep");
	deep.store.jqueryajax.JSON = deep.compose.Classes(Ajax);
	//__________________________________________________
	deep.extensions.push({
		extensions:[
			/(\.json(\?.*)?)$/gi
		],
		store:deep.store.jqueryajax.JSON
	});
	return deep.store.jqueryajax.JSON;
});
