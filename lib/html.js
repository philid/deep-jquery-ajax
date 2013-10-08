if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","deep/deep", "./ajax"],function (require, deep, Ajax)
{
	deep.store.jqueryajax = deep.store.jqueryajax || {};
	deep.store.jqueryajax.HTML = deep.compose.Classes(Ajax, {
		headers:{
			"Accept" : "text/html; charset=utf-8"
        },
        dataType:"html",
        bodyParser : function(data){
            if(typeof data === 'string')
                return data;
            if(data.toString())
                return data.toString();
            return String(data);
        },
        responseParser : function(data, msg, jqXHR){
           return data.toString();
        }
	});
	//__________________________________________________
	deep.extensions.push({
		extensions:[
			/(\.(html|htm|xhtm|xhtml)(\?.*)?)$/gi
		],
		store:deep.store.jqueryajax.HTML
	});
	deep.store.jqueryajax.HTML.createDefault = function(){
		new deep.store.jqueryajax.HTML("html");
	};
	return deep.store.jqueryajax.HTML;

});