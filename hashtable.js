var oldSnapEquals = snapEquals;
snapEquals = function(a, b) {
    if ((a instanceof Hashtable) || (b instanceof Hashtable)) {
        if ((a instanceof Hashtable) && (b instanceof Hashtable)) {
            return a.equalTo(b);
        }
        return false;
    }
    return oldSnapEquals(a, b);
};
var oldTypeOf = Process.prototype.reportTypeOf;
Process.prototype.reportTypeOf = function(object) {
    if (object instanceof Hashtable) {
        return 'hashtable';
    }
    return oldTypeOf(object);
};
var oldDataAsMorph = SpriteBubbleMorph.prototype.dataAsMorph;
SpriteBubbleMorph.prototype.dataAsMorph = function(data, toggle) {
    if (data instanceof Hashtable) {
        return oldDataAsMorph(data.asString(), toggle);
    } else {
        return oldDataAsMorph(data, toggle);
    }
};
var oldDrawNew = CellMorph.prototype.drawNew;
CellMorph.prototype.drawNew = function(toggle, type) {
    var hash = this.contents instanceof Hashtable;
    var original;
    if (hash) {
        original = this.contents;
        this.contents = this.contents.asString();
    }
    oldDrawNew.call(this, toggle, type);
    if (hash) {
        this.contents = original;
    }
};
window.Hashtable = function() {
    this.obj = {};
    this.changed();
};
Hashtable.prototype.stringify = function(object) {
    var type = typeof(object);
    if (type === 'boolean') {
	return String(object)
    } else if (object === null || type !== 'object') {
        return  '"' + String(object).replace(/\\/, '\\\\').replace(/"/g, '\\\"') + '"';
    }
    else if (object instanceof Context) {
        return this.stringifyContext(object.expression.components()).join('');
    }
    else if (object instanceof List) {
        return this.stringifyList(object).join('');
    }
    else if (object instanceof Hashtable) {
        return this.stringifyHashtable(object);
    }
    else {
        throw new Error('unable to stringify ' + object)
    } 
};
Hashtable.prototype.stringifyContext = function(components, start) {
    start = start || ['c'];
    var selector
    for (var i = 0; i < components.length; i++) {
	if (components[i] instanceof List) {
	    start.push('(');
	    this.stringifyContext(components[i], start);
	    start.push(')');
	} else if (components[i] instanceof Context) {
	    start.push(expression.selector === 'reportGetVar' ?
		       'v' + expression.blockSpec :
		       'b' + expression.selector);
	} else {
	    start.push(this.stringify(components[i]));
	}
	start.push(',');
    }
    return start;
};
Hashtable.prototype.stringifyList = function(list, start) {
    start = start || ['l'];
    var expand = function(data, index, table) {
	start.push('[');
	start.push(table.stringify(data));
	start.push(']');
    };
    var index = 0;
    while (list.isLinked) {
        list.isImmutable = true;
        expand(list.first, index, this);
        index ++;
        list = list.rest;
    }
    for (var i = 0; i < list.contents.length; i++) {
        expand(list.contents[i], index + i, this);
    }
    return start;
};
Hashtable.prototype.stringifyHashtable = function (table) {
    if (table === this) {
        throw new Error('hashtable cannot be its own key');
    }
    var data = ['h'];
    for (let [hashkey, value] of Object.entries(table.obj)) {
	data.push(this.stringify(hashkey));
	data.push(':');
	data.push(this.stringify(value));
	data.push(',');
    }
    return data.join('');
};
Hashtable.prototype.asString = function() {
    data = ['{']
    var index;
    for (let [hashkey, value] of Object.entries(this.obj)) {
        for (index = 0; index < value.length; index ++) {
	    data.push(String(value[index][0]));
	    data.push(':');
	    data.push(String(value[index][1]));
	    data.push(',');
        }
    }
    data[data.length-1] = '}';
    return data.join('');
};
Hashtable.prototype.get = function(key) {
    var hash = this.stringify(key);
    var list = this.obj[hash];
    if (list === undefined) {return undefined;}
    return list[1];
};
Hashtable.prototype.set = function(key, value) {
    this.changed();
    var hash = this.stringify(key);
    this.obj[hash] = [key, value];
};
Hashtable.prototype.remove = function(key) {
    this.changed();
    var hash = this.stringify(key);
    delete this.obj[hash];
};
Hashtable.prototype.clear = function() {
    this.changed();
    this.obj = {};
};
Hashtable.prototype.foreach = function(map) {
    var hash, list;
    for (let [hashkey, value] of Object.entries(this.obj)) {
        map(value[0], value[1]);
    }
};
Hashtable.prototype.keys = function() {
    var keys = [];
    this.foreach(function (key, value) {keys.push(key); });
    return keys
};
Hashtable.prototype.equalTo = function(other) {
    var hashkey;
    for (hashkey of other.obj) {
        if (!Object.prototype.hasOwnProperty.call(this.obj, hashkey)) {
	    return false;
        }
    }
    try {
        this.foreach(function(key, value) {
	    if (value !== other.get(key)) {
                throw new Error();
	    }
        });
        return true;
    } catch(e) {
        return false;
    }
};
Hashtable.prototype.changed = function() {
    this.lastChanged = Date.now();
};

function clean(data) {
    if (data === null || data === undefined) {return 0; }
    return data;
}

SnapExtensions.primitives.set(
    'hsh_new()',
    function() {return new Hashtable(); }
);
SnapExtensions.primitives.set(
    'hsh_clear(hashtable)',
    function(hashtable) {hashtable.clear(); }
);
SnapExtensions.primitives.set(
    'hsh_get(hashtable, key)',
    function(hashtable, key) {return clean(hashtable.get(key)); }
);
SnapExtensions.primitives.set(
    'hsh_contains(hashtable, key)',
    function(hashtable, key) {return hashtable.get(key) !== undefined; }
);
SnapExtensions.primitives.set(
    'hsh_set(hashtable, key, value)',
    function(hashtable, key, value) {hashtable.set(key, value); }
);
SnapExtensions.primitives.set(
    'hsh_remove(hashtable, key)',
    function(hashtable, key) {hashtable.remove(key); }
);
SnapExtensions.primitives.set(
    'hsh_keys(hashtable)',
    function(hashtable) {return new List(hashtable.keys()); }
);
