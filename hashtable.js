window.Hashtable = function() {
    this.obj = {};
    this.changed();
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
    var value = this.obj[key];
    if (value === undefined) {return undefined;}
    return value;
};
Hashtable.prototype.set = function(key, value) {
    this.changed();
    this.obj[key] = value;
};
Hashtable.prototype.remove = function(key) {
    this.changed();
    delete this.obj[key];
};
Hashtable.prototype.clear = function() {
    this.changed();
    this.obj = {};
};
Hashtable.prototype.foreach = function(map) {
    var hash, list;
    for (let [hashkey, value] of Object.entries(this.obj)) {
        map(hashkey, value);
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
