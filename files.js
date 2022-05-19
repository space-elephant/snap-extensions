function load() {
    var done = false;
    var result;
    var input = document.createElement('input');
    input.type = 'file';
    document.body.onfocus = function () {
	if (input.files.length === 0) {
	    done = true;
	    result = false;
	} else {
	    var reader = new FileReader();
	    reader.onload = function(e) {
		done = true;
		result = atob(this.result.substring(this.result.indexOf(';base64,') + 8));
	    };
	    reader.readAsDataURL(input.files[0]);
	}
    };
    input.click();
    return new List([function() {return done; }, function() {return result; }]);
}

SnapExtensions.primitives.set(
    'sav_upload()',
    function() {return load(); }
);
SnapExtensions.primitives.set(
    'sav_download(data, filename)',
    function(data, filename) {saveAs(new Blob(new String(data)), filename); }
);
