if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require", "./ajax"],function (require, Ajax)
{
	var deep = require("deep");
	deep.store.jqueryajax.JSON = deep.compose.Classes(Ajax);
	//__________________________________________________
	deep.extensions.push({
		extensions:[
			/(\.json(\?.*)?)$/gi
		],
		store:deep.store.jqueryajax.JSON
	});
	deep.store.jqueryajax.JSON.createDefault = function(){
		new deep.store.jqueryajax.JSON("json");
	};
	return deep.store.jqueryajax.JSON;
});
