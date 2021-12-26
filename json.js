function snapify(js) {
    if (typeof js === 'object') {
	if (js === null) {
	    return js;
	} else if (js instanceof Array) {
	    var data = new List();
	    for (var i = 0; i < js.length; i++) {
		data.add(snapify(js[i]));
	    }
	    return data;
	} else {
	    var data = new Hashtable();
	    for (let [hashkey, value] of Object.entries(js)) {
		data.set(hashkey, snapify(value));
	    }
	    return data;
	}
    } else {
	return js;
    }
}
function unsnapify(data) {
    if (typeof data === 'object') {
	if (data instanceof List) {
	    var result = [];
	    while (data.isLinked) {
		result.push(unsnapify(data.first));
		data = data.rest;
	    }
	    for (var i = 0; i < data.contents.length; i++) {
		result.push(unsnapify(data.contents[i]));
	    }
	    return result;
	} else if (data instanceof Hashtable) {
	    var result = {};
	    data.foreach(function(key, value) {
		if (typeof key !== 'string') {
		    throw new Error('json key must be string ' + key);
		}
		result[key] = unsnapify(value);
	    });
	    return result;
	} else {
	    throw new Error('not json serializable: ' + Process.prototype.reportTypeOf(data) + ' ' + data)
	}
    } else {
	return data;
    }
}

function parse(json) {
    return snapify(JSON.parse(json));
}
function stringify(snap) {
    return JSON.stringify(unsnapify(snap));
}

SnapExtensions.primitives.set('jso_parse(json)', parse);
SnapExtensions.primitives.set('jso_stringify(snap)', stringify);
