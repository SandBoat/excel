/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20170427
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

    // Full polyfill for browsers with no classList support
    // Including IE < Edge missing SVGElement.classList
    if (!("classList" in document.createElement("_")) ||
        document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg", "g"))) {

        (function(view) {

            "use strict";

            if (!('Element' in view)) return;

            var
                classListProp = "classList",
                protoProp = "prototype",
                elemCtrProto = view.Element[protoProp],
                objCtr = Object,
                strTrim = String[protoProp].trim || function() {
                    return this.replace(/^\s+|\s+$/g, "");
                },
                arrIndexOf = Array[protoProp].indexOf || function(item) {
                    var
                        i = 0,
                        len = this.length;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                }
                // Vendors: please allow content code to instantiate DOMExceptions
                ,
                DOMEx = function(type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                },
                checkTokenAndGetIndex = function(classList, token) {
                    if (token === "") {
                        throw new DOMEx(
                            "SYNTAX_ERR", "An invalid or illegal string was specified"
                        );
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR", "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call(classList, token);
                },
                ClassList = function(elem) {
                    var
                        trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
                        classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                        i = 0,
                        len = classes.length;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function() {
                        elem.setAttribute("class", this.toString());
                    };
                },
                classListProto = ClassList[protoProp] = [],
                classListGetter = function() {
                    return new ClassList(this);
                };
            // Most DOMException implementations don't allow calling DOMException's toString()
            // on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function(i) {
                return this[i] || null;
            };
            classListProto.contains = function(token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function() {
                var
                    tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token, updated = false;
                do {
                    token = tokens[i] + "";
                    if (checkTokenAndGetIndex(this, token) === -1) {
                        this.push(token);
                        updated = true;
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.remove = function() {
                var
                    tokens = arguments,
                    i = 0,
                    l = tokens.length,
                    token, updated = false,
                    index;
                do {
                    token = tokens[i] + "";
                    index = checkTokenAndGetIndex(this, token);
                    while (index !== -1) {
                        this.splice(index, 1);
                        updated = true;
                        index = checkTokenAndGetIndex(this, token);
                    }
                }
                while (++i < l);

                if (updated) {
                    this._updateClassName();
                }
            };
            classListProto.toggle = function(token, force) {
                token += "";

                var
                    result = this.contains(token),
                    method = result ?
                    force !== true && "remove" :
                    force !== false && "add";

                if (method) {
                    this[method](token);
                }

                if (force === true || force === false) {
                    return force;
                } else {
                    return !result;
                }
            };
            classListProto.toString = function() {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get: classListGetter,
                    enumerable: true,
                    configurable: true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    // adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
                    // modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
                    if (ex.number === undefined || ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }

        }(self));

    }

    // There is full or partial native classList support, so just check if we need
    // to normalize the add/remove and toggle APIs.

    (function() {
        "use strict";

        var testElement = document.createElement("_");

        testElement.classList.add("c1", "c2");

        // Polyfill for IE 10/11 and Firefox <26, where classList.add and
        // classList.remove exist but support only one argument at a time.
        if (!testElement.classList.contains("c2")) {
            var createMethod = function(method) {
                var original = DOMTokenList.prototype[method];

                DOMTokenList.prototype[method] = function(token) {
                    var i, len = arguments.length;

                    for (i = 0; i < len; i++) {
                        token = arguments[i];
                        original.call(this, token);
                    }
                };
            };
            createMethod('add');
            createMethod('remove');
        }

        testElement.classList.toggle("c3", false);

        // Polyfill for IE 10 and Firefox <24, where classList.toggle does not
        // support the second argument.
        if (testElement.classList.contains("c3")) {
            var _toggle = DOMTokenList.prototype.toggle;

            DOMTokenList.prototype.toggle = function(token, force) {
                if (1 in arguments && !this.contains(token) === !force) {
                    return force;
                } else {
                    return _toggle.call(this, token);
                }
            };

        }

        testElement = null;
    }());

}

/**
 * Array
 */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(callback, thisArg) {
        var T, k;
        if (this == null) {
            throw new TypeError("this is null or not defined");
        }
        var O = Object(this);
        var len = O.length >>> 0;
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }
        if (arguments.length > 1) {
            T = thisArg;
        }
        k = 0;
        while (k < len) {
            var kValue;
            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };
}
if (!Array.isArray) {
    Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

//判断IE7\8 兼容性检测  
(function() {
    //为window对象添加
    addEventListener = function(n, f) {
        if ("on" + n in this.constructor.prototype)
            this.attachEvent("on" + n, f);
        else {
            var o = this.customEvents = this.customEvents || {};
            n in o ? o[n].push(f) : (o[n] = [f]);
        };
    };
    removeEventListener = function(n, f) {
        if ("on" + n in this.constructor.prototype)
            this.detachEvent("on" + n, f);
        else {
            var s = this.customEvents && this.customEvents[n];
            if (s)
                for (var i = 0; i < s.length; i++)
                    if (s[i] == f) return void s.splice(i, 1);
        };
    };
    dispatchEvent = function(e) {
        if ("on" + e.type in this.constructor.prototype)
            this.fireEvent("on" + e.type, e);
        else {
            var s = this.customEvents && this.customEvents[e.type];
            if (s)
                for (var s = s.slice(0), i = 0; i < s.length; i++)
                    s[i].call(this, e);
        }
    };
    //为document对象添加
    HTMLDocument.prototype.addEventListener = addEventListener;
    HTMLDocument.prototype.removeEventListener = removeEventListener;
    HTMLDocument.prototype.dispatchEvent = dispatchEvent;
    HTMLDocument.prototype.createEvent = function() {
        var e = document.createEventObject();
        e.initMouseEvent = function(en) { this.type = en; };
        e.initEvent = function(en) { this.type = en; };
        return e;
    };
    //为全元素添加
    var tags = [
            "Unknown", "UList", "Title", "TextArea", "TableSection", "TableRow",
            "Table", "TableCol", "TableCell", "TableCaption", "Style", "Span",
            "Select", "Script", "Param", "Paragraph", "Option", "Object", "OList",
            "Meta", "Marquee", "Map", "Link", "Legend", "Label", "LI", "Input",
            "Image", "IFrame", "Html", "Heading", "Head", "HR", "FrameSet",
            "Frame", "Form", "Font", "FieldSet", "Embed", "Div", "DList",
            "Button", "Body", "Base", "BR", "Area", "Anchor"
        ],
        html5tags = [
            "abbr", "article", "aside", "audio", "canvas", "datalist", "details",
            "dialog", "eventsource", "figure", "footer", "header", "hgroup", "mark",
            "menu", "meter", "nav", "output", "progress", "section", "time", "video"
        ],
        properties = {
            addEventListener: { value: addEventListener },
            removeEventListener: { value: removeEventListener },
            dispatchEvent: { value: dispatchEvent }
        };
    for (var o, n, i = 0; o = window["HTML" + tags[i] + "Element"]; i++)
        tags[i] = o.prototype;
    for (i = 0; i < html5tags.length; i++)
        tags.push(document.createElement(html5tags[i]).constructor.prototype);
    for (i = 0; o = tags[i]; i++)
        for (n in properties) Object.defineProperty(o, n, properties[n]);
})();

/**
 * bind
 */
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }
        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {},
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ?
                    this :
                    oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();
        return fBound;
    };
}