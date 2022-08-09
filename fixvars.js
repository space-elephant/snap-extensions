VariableFrame.prototype.allNamesDict = function (upTo, includeHidden) {
	// "upTo" is an optional parent frame at which to stop, e.g. globals
    var dict = {}, current = this;
    function addKeysToDict(srcDict, trgtDict) {
        var eachKey,
	    array = [],
	    index;
        for (eachKey in srcDict) {
            if (Object.prototype.hasOwnProperty.call(srcDict, eachKey)) {
                if (!srcDict[eachKey].isHidden || includeHidden) {
                    array.push(eachKey);
                }
            }
        }
	array.sort(function(a, b) {return a.toLowerCase() > b.toLowerCase()});
	for (index = 0; index < array.length; index++) {
	    eachKey = array[index];
	    trgtDict[eachKey] = eachKey;
	}
    }
    while (current && (current !== upTo)) {
        addKeysToDict(current.vars, dict);
        current = current.parentFrame;
    }
    return dict;
};

SyntaxElementMorph.prototype.getVarNamesDict = function () {
    var block = this.parentThatIsA(BlockMorph),
        rcvr,
        tempVars = [],
        dict;

    if (!block) {
        return {};
    }
    rcvr = block.scriptTarget();
    block.allParents().forEach(morph => {
        if (morph instanceof PrototypeHatBlockMorph) {
            tempVars.push.apply(
                tempVars,
                morph.variableNames()
            );
            tempVars.push.apply(
                tempVars,
                morph.inputs()[0].inputFragmentNames()
            );
        } else if (morph instanceof BlockMorph) {
            morph.inputs().forEach(inp => {
                inp.allChildren().forEach(child => {
                    if (child instanceof TemplateSlotMorph) {
                        tempVars.push(child.contents());
                    } else if (child instanceof MultiArgMorph) {
                        child.children.forEach(m => {
                            if (m instanceof TemplateSlotMorph) {
                                tempVars.push(m.contents());
                            }
                        });
                    }
                });
            });
        }
    });
    if (rcvr) {
        dict = rcvr.variables.allNamesDict();
	tempVars.sort(function(a, b) {return a.toLowerCase() > b.toLowerCase()});
        tempVars.forEach(name =>
            dict[name] = name
        );
        if (block.selector === 'doSetVar') {
            // add settable object attributes
            dict['~'] = null;
            dict.my = [{// wrap the submenu into a 1-item array to translate it
                'anchor' : ['my anchor'],
                'parent' : ['my parent'],
                'name' : ['my name'],
                'temporary?' : ['my temporary?'],
                'dangling?' : ['my dangling?'],
                'draggable?' : ['my draggable?'],
                'rotation style' : ['my rotation style'],
                'rotation x' : ['my rotation x'],
                'rotation y' : ['my rotation y']
            }];
            if (this.world().currentKey === 16) { // shift
                dict.my[0]['~'] = null; // don't forget we're inside an array...
                dict.my[0]['microphone modifier'] = ['microphone modifier'];
            }
        }
        return dict;
    }
    return {};
};
