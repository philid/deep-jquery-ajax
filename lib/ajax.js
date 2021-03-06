"use strict";

if(typeof define !== 'function')
	var define = require('amdefine')(module);

define(["require","deep/deep"],function (require, deep)
{

	deep.store.jqueryajax = deep.store.jqueryajax || {};
	deep.store.jqueryajax.AJAX = deep.compose.Classes(deep.Store, function(protocole, baseURI, schema, options){
		options = options || {};
        this.baseURI = baseURI || "";
        this.schema = schema;
        if(options.dataType)
			this.dataType = options.dataType;
        if(options.headers)
			deep.utils.up(options.headers, this.headers);
	});

	deep.store.jqueryajax.AJAX.prototype = {
		headers: {
			"Accept" : "application/json; charset=utf-8",
			"Content-Type" : "application/json; charset=utf-8"
		},
		dataType:"json"
	};
	//________________________________________________________________________ Customisation API
	deep.store.jqueryajax.AJAX.prototype.writeHeaders = function (req, headers)
	{
		for(var i in deep.globalHeaders)
			req.setRequestHeader(i, deep.globalHeaders[i]);
		for(i in this.headers)
			req.setRequestHeader(i, this.headers[i]);
		for(i in headers)
			req.setRequestHeader(i, headers[i]);
	};

	deep.store.jqueryajax.AJAX.prototype.bodyParser = function(data){
		try{
			if(typeof data !== 'string')
				data = JSON.stringify(data);
		}
		catch(e)
		{
			return e;
		}
		return data;
	};
	deep.store.jqueryajax.AJAX.prototype.responseParser = function(data, msg, jqXHR){
		try{
			if(typeof data === 'string')
				data = JSON.parse(data);
		}
		catch(e)
		{
			return e;
		}
		return data;
	};
	//________________________________________________________________________ END CUSOTMISATION
	deep.store.jqueryajax.AJAX.prototype.get = function (id, options) {
		//console.log("deep.protocoles."+this.name+".get : ", id);
		var noCache = true;
		if(id !== "")
			if(this.extensions)
			for (var i = 0; i < this.extensions.length; ++i)
			{
				var res = id.match(this.extensions[i]);
				if(res && res.length > 0)
				{
					noCache = false;
					//console.log("NO CACHE : ", id)
					break;
				}
			}
		if(this.baseURI)
			id = this.baseURI + ((id)?id:"");
		var cacheName = this.dataType +"::"+id;
		if(!noCache && id !== "" && deep.mediaCache.cache[cacheName])
			return deep.mediaCache.cache[cacheName];

		var self = this;
		var d = deep.when($.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			//contentType: "application/json; charset=utf-8",
			url:id,
			method:"GET"
		})
		.done(function(data, msg, jqXHR){
			data = self.responseParser(data, msg, jqXHR);
			if(data instanceof Error)
				return data;
		//	console.log("deep.protocoles.ajax.get results : ", data);
			return data;
		})
		.fail(function(){
			//console.log("deep.store.ajax.get error : ",id," - ", arguments);
			return new Error("deep.protocoles."+self.protocole+" failed : "+id+" - \n\n"+JSON.stringify(arguments));
		}));
		if(!noCache && options && options.cache !== false)
			deep.mediaCache.manage(d, cacheName);
		return d;
	};
	deep.store.jqueryajax.AJAX.prototype.put = function (object, options) {
		options = options || {};
		var id = object.id || options.id;
		if(options.uri)
			id = options.uri+((id)?id:"");
		else if(this.baseURI)
			id = this.baseURI + ((id)?id:"");
		var self = this;
		var def = deep.Deferred();

		var body = self.bodyParser(object);
		if(body instanceof Error)
			return deep(body);
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			type:"PUT",
			url:id,
			dataType:self.dataType,
			data:body
		})
		.done(function (data, msg, jqXHR) {
			data = self.responseParser(data, msg, jqXHR);
			def.resolve(data);
		})
		.fail(function  (jqXHR, textStatus, errorThrown) {
			if(jqXHR.status < 400)
			{
				var test = self.responseParser(jqXHR.responseText, textStatus, jqXHR);
				//console.log("DeepRequest.post : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				
				def.resolve(test);
			}
			else
				def.reject(new Error("deep.store."+self.name+".put failed : "+id+" - details : "+JSON.stringify(arguments)));
		});
		return def.promise();
	};
	deep.store.jqueryajax.AJAX.prototype.post = function (object, options) {
		options = options || {};
		var id = object.id || options.id;
		if(options.uri)
			id = options.uri+((id)?id:"");
		else if(this.baseURI)
			id = this.baseURI + ((id)?id:"");
		var self = this;
		//console.log("deep.store."+self.name+" : post : ", object, options, id);
		var def = deep.Deferred();
		//console.log("post on : ", id);
		var body = self.bodyParser(object);
		if(body instanceof Error)
			return deep.when(body);
		//console.log("will post : ", body)
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			type:"POST",
			url:id,
			//processData:false,
			dataType:self.dataType,
			data:body
		})
		.done(function (data, msg, jqXHR) {
			data = self.responseParser(data, msg, jqXHR);
			//console.log("deep.store."+self.name+".success : ", data);
			def.resolve(data);
		})
		.fail(function  (jqXHR, textStatus, errorThrown) {
			//console.log("deep.store."+self.name+".fail : jqXHR : ",jqXHR, " - textStatus : ", textStatus, " - erro : ",errorThrown);
			if(jqXHR.status < 400 && textStatus !== 'error')
			{
				var test = self.responseParser(jqXHR.responseText, textStatus, jqXHR);
				//console.log("deep.protocoles."+self.name+".post : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				def.resolve(test);
			}
			else
				def.reject(new Error("deep.store."+self.name+".post failed : "+id+" - details : "+JSON.stringify(arguments)));
		});
		return def.promise();
	};
	deep.store.jqueryajax.AJAX.prototype.del = function (id, options) {
		var self = this;
		var def = deep.Deferred();
		if(this.baseURI)
			id = this.baseURI + ((id)?id:"");
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			type:"DELETE",
			url:id
		})
		.done(function (data, msg, jqXHR) {
			data = self.responseParser(data, msg, jqXHR);
			//console.log("deep.store.ajax.success : ", success);
			def.resolve(data);
		})
		.fail(function  (jqXHR, textStatus, errorThrown) {
			if(jqXHR.status < 400)
			{
				var test = self.responseParser(jqXHR.responseText, textStatus, jqXHR);
				//console.log("deep.protocoles."+self.name+".del : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				def.resolve(test);
			}
			else
			{
				def.reject(deep.errors.Store("deep.store."+self.name+".del failed : "+id+" - details : "+JSON.stringify(arguments)));
			}
		});
		return def.promise();
	};
	deep.store.jqueryajax.AJAX.prototype.patch = function (object, options) {
		options = options || {};
		var id = object.id || options.id;
		if(options.uri)
			id = options.uri+((id)?id:"");
		else if(this.baseURI)
			id = this.baseURI + ((id)?id:"");
		var self = this;
		var def = deep.Deferred();
		var body = self.bodyParser(object);
		if(body instanceof Error)
			return deep.when(body);
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			type:"PATCH",
			url:id,
			dataType:self.dataType,
			data:body
		})
		.done(function (data, msg, jqXHR) {
			data = self.responseParser(data, msg, jqXHR);
			//console.log("deep.store.ajax.success : ", success);
			def.resolve(data);
		})
		.fail(function  (jqXHR, textStatus, errorThrown)
		{
			if(jqXHR.status < 400)
			{
				var test = self.responseParser(jqXHR.responseText, textStatus, jqXHR);
				//console.log("deep.protocoles."+self.name+".del : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				def.resolve(test);
			}
			else
				def.reject(new Error("deep.store."+self.name+".patch failed : "+id+" - details : "+JSON.stringify(arguments)));
				//deferred.reject({msg:"DeepRequest.patch failed : "+info.request, status:jqXHR.status, details:arguments, uri:id});
		});
		return def.promise();
	};
	deep.store.jqueryajax.AJAX.prototype.bulk = function (arr, uri, options) {
		var self = this;
		options = options || {};
		var def = deep.Deferred();
		//if(this.baseURI)
		//	id = this.baseURI + ((id)?id:"");
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			type:"POST",
			url:uri,
			dataType:self.dataType,
			data:JSON.stringify(arr)
		})
		.done(function (data, msg, jqXHR) {
			data = self.responseParser(data, msg, jqXHR);
			//console.log("deep.store.ajax.success : ", success);
			def.resolve(data);
		})
		.fail(function  (jqXHR, textStatus, errorThrown)
		{
			if(jqXHR.status < 400)
			{
				var test = self.responseParser(jqXHR.responseText, textStatus, jqXHR);
				//console.log("deep.protocoles."+self.name+".del : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				def.resolve(test);
			}
			else
				def.reject(new Error("deep.store."+self.name+".bulk failed : "+uri+" - details : "+JSON.stringify(arguments)));
		});
		return def.promise();
	};
	deep.store.jqueryajax.AJAX.prototype.rpc = function (method, params, id, options) {
		var self = this;
		options = options || {};
		var callId = "call"+new Date().valueOf();
		if(this.baseURI)
			id = this.baseURI + ((id)?id:"");
		var def = deep.Deferred();
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, options.headers);
			},
			type:"POST",
			url:id,
			//dataType:"application/json-rpc; charset=utf-8;",
			//dataType:self.dataType,
			data:JSON.stringify({
				id:callId,
				method:method,
				params:params||[]
			})
		})
		.done(function (data, msg, jqXHR) {
			data = self.responseParser(data, msg, jqXHR);
			//console.log("deep.store.ajax.success : ", success);
			if(data.error)
				def.reject(data.error);
			else
				def.resolve(data.result);
		})
		.fail(function  (jqXHR, textStatus, errorThrown)
		{
			if(jqXHR.status < 400)
			{
				var test = self.responseParser(jqXHR.responseText, textStatus, jqXHR);
				//console.log("deep.protocoles."+self.name+".del : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				if(test && test.error)
					def.reject(test.error);
				else
					def.resolve(test.result);
			}
			else
				def.reject(new Error("deep.store."+self.name+".rpc failed : "+id+" - details : "+JSON.stringify(arguments)));
		});
		return def.promise();
	};
	deep.store.jqueryajax.AJAX.prototype.range = function (arg1, arg2, query, options)
	{
		var self = this;
		var start = arg1, end = arg2;
		var def = deep.Deferred();
		if(this.baseURI)
			query = this.baseURI + ((query)?query:"");
		if(typeof start === 'object')
		{
			start = start.step*start.width;
			end = ((start.step+1)*start.width)-1;
		}
		var headers = {
			"range":"items=" +start+"-"+end
		}
		if(options.headers)
			deep.utils.up(options.headers, headers);

		function success(jqXHR, data){
			var rangePart = [];
			var rangeResult = {};
			var headers = jqXHR.getResponseHeader("content-range");
			headers = headers.substring(6);
			if(headers)
				rangePart = headers.split('/');

			if(headers && rangePart && rangePart.length > 0)
			{
				rangeResult.range = rangePart[0];
				if(rangeResult.range == "0--1")
				{
					rangeResult.totalCount = 0;
					rangeResult.start = 0;
					rangeResult.end = 0;
				}
				else
				{
					rangeResult.totalCount = parseInt(rangePart[1], 10);
					var spl = rangePart[0].split("-");
					rangeResult.start = parseInt(spl[0], 10);
					rangeResult.end = parseInt(spl[1], 10);
				}
			}
			else
				console.log("ERROR deep.protocoles."+self.name+".range : range header missing !! ");
			rangeResult = deep.utils.createRangeObject(rangeResult.start, rangeResult.end, rangeResult.totalCount);
			rangeResult.results = data;
			return rangeResult;
		}
		$.ajax({
			beforeSend :function(req) {
				self.writeHeaders(req, headers);
			},
			type:"GET",
			url:query,
			dataType:self.dataType,

		}).then(function(data, text, jqXHR) {
			return def.resolve(success(jqXHR, data));
		}, function  (jqXHR, statusText, errorThrown) {
			if(jqXHR.status == 200 || jqXHR.status == 206)
			{
				var test = self.responseParser(jqXHR.responseText, statusText, jqXHR);
				//console.log("deep.protocoles."+self.name+".del : error but status 2xx : ", test, " - status provided : "+jqXHR.status);
				def.resolve(success(jqXHR, test));
			}
			else
				def.reject(new Error("deep.store."+self.name+".range failed : details : "+JSON.stringify(arguments)));
		});

		return def.promise();
	};
	return deep.store.jqueryajax.AJAX;
});