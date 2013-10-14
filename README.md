deep-jquery-ajax provides jquery based ajax driver (store) for deepjs.

Provided protocoles (see deep protocoles) :

	- html (html::)
	- json (json::)
	- xml (xml::)

## Required

* deepjs >= v0.9.4
* jquery >= 1.5

## Install
```shell
	git clone https://github.com/deepjs/deep-jquery-ajax
	cd deep-jquery-ajax
	npm install
```

## Usage

```javascript

	require("deep-jquery-ajax/json").createDefault();

	deep("json::/my/file.json")			// relative to root server path  e.g. http://yourdomain.com/
	.log();

	//...

	deep.store.jqueryajax.JSON.create("myprotocole","/myRESTservice/");

	deep.store("myprotocole")
	.post({ hello:"stored json", id:"33"})
	.log();

	deep("myprotocole::33")
	.log();

	deep.store("myprotocole")
	.put({ hello:"world" }, { id:"33" }) // put is replacing the entire object
	.log();

	deep.store("myprotocole")
	.patch({ name:"George" }, { id:"33" }) // patch update only the fields that are sended
	.log();

	deep.store("myprotocole")
	.rpc("methodName", { arg1:"myValue" }) // call rpc method named "methodName" with the object passed { arg1:"myValue" } as argument
	.log();

	deep.store("myprotocole") // bulk call allows multiple operations with one call
	.bulk([
	    {to:"id1381690769563", method:"patch", body:{name:"updated 2"}},
	    {to:"id1381690769563", method:"get"}
	])
	.log();
	
	//...


```
	
