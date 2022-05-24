function load(list) {
    list.clear();
    list.add(false);
    list.add(0);
    var input = document.createElement('input');
    input.type = 'file';
    input.addEventListener("change", function () {
	if (input.files.length === 0) {
	    list.put(true, 1);
	    list.put(false, 2);
	} else {
	    var reader = new FileReader();
	    reader.onload = function(e) {
		list.put(true, 1);
		list.put(atob(this.result.substring(this.result.indexOf(';base64,') + 8)), 2);
	    };
	    reader.readAsDataURL(input.files[0]);
	}
    }, false);
    input.click();
}

SnapExtensions.primitives.set(
    'sav_upload(list)',
    load
);
SnapExtensions.primitives.set(
    'sav_download(data, filename)',
    function(data, filename) {saveAs(new Blob(new String(data)), filename); }
);
