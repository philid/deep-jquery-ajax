if(typeof define !== 'function')
    var define = require('amdefine')(module);

define(["require" ,"deep/deep", "./ajax"],function (require, deep, Ajax)
{
    deep.store.jqueryajax = deep.store.jqueryajax || {};
    deep.store.jqueryajax.XML = deep.compose.Classes(Ajax,{
        headers:{
            "Accept": "application/xml; charset=utf-8",
            "Content-Type": "application/xml; charset=utf-8"
        },
        dataType:"xml",
        bodyParser : function(data){
            if(typeof data === 'string')
                return data;
            if(data.toString())
                return data.toString();
            return String(data);
        },
        responseParser : function(data, msg, jqXHR){
           return jQuery.parseXML( data );
        }
    });
    //__________________________________________________
    deep.extensions.push({
        extensions:[
            /(\.xml(\?.*)?)$/gi
        ],
        store:deep.store.jqueryajax.XML
    });
    deep.store.jqueryajax.XML.createDefault = function(){
        new deep.store.jqueryajax.XML("xml");
    };
    return deep.store.jqueryajax.XML;
});
