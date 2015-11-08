// we need to log somethings before the log module is loaded, 
// so we buffer these messages
var log_buffer = [];

﻿﻿/* 
 * Patches for functional programming. 
 * Inspired by and sometimes copied from underscore.js 
 */

/**
 * @desc Merge two objects together. This modifies the original object.
 * First use :func:`Object#clone` on the object if you want to keep the original object intact.
 * 
 * @param {Object} obj The object to merge into this one.
 *
 * @returns {Object} Returns the merged object (``this``);
 */

Object.prototype.merge = function (obj) {
	if (!obj) return;
	
	var merged_obj = this;
	for (var name in obj) {
		merged_obj[name] = obj[name];
	}
	return merged_obj;
}

/**
 * @function
 * @desc An alias for :func:`Object#merge`
 */

Object.prototype.extend = Object.prototype.merge

/**
 * @desc Creates and returns a clone of the object.
 */

Object.prototype.clone = function () {
	// speeds things up if we're cloning an array
	if (this instanceof Array) return this.slice(0);
	if (this instanceof String) return this.substring(0);
	// the normal route for any other object
	// though it might not work on some built-in
	// application-specific objects
	return new this.constructor().merge(this);
}

/**
 * @desc
 *     Returns only the keys (also known as 'names') of an object or associative array.
 *     Will filter out any functions, as these are presumed to be object methods. 
 * @returns {Array} An array with all the keys.
 */

Object.prototype.keys = function () {
	var keys = [];
	for (var key in this) {
        if (this.hasOwnProperty(key) && !(this[key] instanceof Function)) keys.push(key);
    }
	return keys;
}

/**
 * @desc Returns only the values of an object or associative array.
 * @returns {Array} An array with all the values.
 *
 * @example
 *     > var nation = {'name': 'Belgium', 'continent': 'Europe'}
 *     > nation.values();
 *     ['Belgium', 'Europe']
 */

Object.prototype.values = function () {
	var self = this;
	return this.keys().map(function (key) {
		return self[key];
	});
}

/**
 * @desc An alias for ``this instanceof type``.
 * @returns {Bool} True or false.
 *
 * @example
 *     > [].is(Array);
 *     true
 */
Object.prototype.is = function(type) {
	return this instanceof type;
}

/**
 * @desc Checks whether the object has a value for the specified property.
 * @returns {Bool} True or false.
 */

Object.prototype.has = function (key) {
	// could be just null or an invalid object
	// either way, has() should return false
	if (this == null || this[key] == null) return false; 
	
	if (key in this) {
		return new Boolean(this[key]) != false;
	} else {
		return false;
	}
}

/**
 * @desc Alias for ``obj.hasOwnProperty``
 * @returns {Bool} True or false.
 */

Object.prototype.has_own = function (key) {
	return this.hasOwnProperty(key);
}

/**
 * @desc A debugging utility. When used without the ``dump`` argument,
 * equivalent to ``$.writeln(obj.toString())``.
 * @param {Bool} [dump=false]
 *     Dump all properties of this object;
 *     otherwise just returns a string representation.
 */

Object.prototype.to_console = function (dump) {
	if (dump) {
		var obj = this;
		var out = obj.reflect.properties.map(function (property) {
			return property.name + "\t => " + obj[property.name]; 
		}).join("\n");
	} else {
		var out = this.toString();
	}
	return $.writeln(out);
}
﻿/**
 * @desc This is a simple string formatting method, loosely inspired on the one in Python 3.
 * 
 * * In unnamed mode, specify placeholders with the **{}** symbol.
 * * In named mode, specify placeholders with **{propname}**.
 *
 * @param {String} replacements
 *     For each **{}** symbol in the text, ``format`` expects a replacement argument.
 *     Calls `.toString()` on each replacement, so you can pass in any data type.
 *     You may also specify a single replacement object, which will do named formatting.
 *
 * @example
 *     > var person = {'salutation': 'mister', 'name': 'John Smith'};
 *     > var hello = "Hello there, {}, I've heard your name is {}!".format(person.salutation, person.name);
 *     > $.writeln(hello);
 *     "Hello there, mister, I've heard your name is John Smith"
 *
 * @example
 *     > var person = {'salutation': 'mister', 'name': 'John Smith'};
 *     > var hello = "Hello there, {salutation}, I've heard your name is {name}!".format(person);
 *     > $.writeln(hello);
 *     "Hello there, mister, I've heard your name is John Smith"
 */

String.prototype.format = function() {
	var str = this;
	var replacements = arguments.to('array');
	var named = replacements.length == 1 && replacements[0].reflect.name == 'Object';
	
	if (named) {
		var dict = replacements[0];
        dict.keys().forEach(function (key) {
			// replace globally (flagged g)
			str = str.replace("{" + key + "}", dict[key], "g");
		});
		return str;
	} else {
		// split the string into parts around the substring replacement symbols ({}).
		var chunks = str.split("{}");
		// fill in the replacements
		for (var i in chunks) {
			var replacement = replacements.shift();
			if (replacement) chunks[i] += replacement.toString();
		}
		// join everything together
		return chunks.join('');		
	}
}

/**
 * @desc Tests whether the string starts with the specified substring.
 * @param {String} substring
 * @returns {Bool} True or false.
 */

String.prototype.startswith = function (substring) {
	return new Boolean(this.length && this.indexOf(substring) === 0).valueOf();
}

/**
 * @desc Tests whether the string ends with the specified substring.
 * @param {String} substring
 * @returns {Bool} True or false.
 */

String.prototype.endswith = function (substring) {
	return new Boolean(this.length && this.indexOf(substring) == (this.length - substring.length)).valueOf();
}

/**
 * @desc Tests whether the string contains the specified substring.
 * This is equal to ``str.indexOf(substring) != -1``.
 * @param {String} substring
 * @returns {Bool} True or false.
 */

String.prototype.contains = function (substring) {
	return this.indexOf(substring) != -1;
}

/**
 * @desc Does what it says.
 * Does not check whether the string actually extends beyond the the substring.
 */

String.prototype.indexAfter = function (substring) {
	var index = this.indexOf(substring);
	if (index == -1) {
		return index;
	} else {
		return index + substring.length;
	}
}

/**
 * @desc Removes leading whitespace characters, including tabs, line endings and the like.
 * @param {String} [character] if specified, removes leading characters matching the parameter
 * instead of whitespace.
 *
 * @example
 *     > $.writeln("   hello there   ".trim());
 *     "hello there   "
 */

String.prototype.ltrim = function(character) {
	if (character) {
		if (this.endswith(character) == true) {
			return this.substr(1).ltrim(character);
		} else {
			return this;
		}
	} else {
		return this.replace(/^\s+/, "");
	}
}

/**
 * @desc Removes trailing whitespace characters, including tabs, line endings and the like.
 * @param {String} [character] if specified, removes trailing characters matching the parameter
 * instead of whitespace.
 *
 * @example
 *     > $.writeln("   hello there   ".trim());
 *     "   hello there"
 */

String.prototype.rtrim = function (character) {
	if (character) {
		if (this.endswith(character) == true) {
			return this.slice(0, -1).rtrim(character);
		} else {
			return this;
		}
	} else {
		return this.replace(/\s+$/, "");
	}
}

/**
 * @desc Removes leading and trailing whitespace characters, including tabs, line endings and the like.
 * @param {String} [character] if specified, removes leading and trailing characters matching the 
 * parameter instead of whitespace.
 * 
 * @example
 *     > $.writeln("   hello there   ".trim());
 *     "hello there"
 */

String.prototype.trim = function(character) {
	if (character) {
		return this.ltrim(character).rtrim(character);
	} else {
		return this.replace(/^\s+|\s+$/g, "");
	}
}
﻿// note: the Mozilla stuff is MIT licensed!

/* Javascript 1.6 Array extras, courtesy of Mozilla */

/**
 * @desc Returns the first index at which a given element can be found in the array, or -1 if it is not present.
 *
 * @param {Object} element
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
 */

  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };

/**
 * @desc Does what it says.
 * Does not check whether there is actually a next element, that's up to you.
 */

Array.prototype.indexAfter = function (element) {
	var index = this.indexOf(element);
	if (index == -1) {
		return index;
	} else {
		return index + 1;
	}
}

/**
 * @desc Returns the last index at which a given element can be found in the array, 
 * or -1 if it is not present. The array is searched backwards, starting at from_index.
 *
 * @param {Object} element
 * @param {Number} from_index
 * 
 * @see https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Array/lastIndexOf
 */

  Array.prototype.lastIndexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]);
    if (isNaN(from))
    {
      from = len - 1;
    }
    else
    {
      from = (from < 0)
           ? Math.ceil(from)
           : Math.floor(from);
      if (from < 0)
        from += len;
      else if (from >= len)
        from = len - 1;
    }

    for (; from > -1; from--)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };

/**
 * @desc Tests whether all elements in the array pass the test implemented by the provided function.
 *
 * @param {Function} function
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
 */

  Array.prototype.every = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this &&
          !fun.call(thisp, this[i], i, this))
        return false;
    }

    return true;
  };

/**
 * @desc Creates a new array with all elements that pass the test implemented by the provided function.
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
 */

  Array.prototype.filter = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
      {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this))
          res.push(val);
      }
    }

    return res;
  };

/**
 * @desc Executes a provided function once per array element.
 *
 * @param {Function} function
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
 */

  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };

/**
 * @desc Creates a new array with the results of calling a provided function on every element in this array.
 *
 * @param {Function} function
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/map
 */

  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };

/**
 * @desc Tests whether some element in the array passes the test implemented by the provided function.
 *
 * @param {Function} function
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
 */

  Array.prototype.some = function(fun /*, thisp*/)
  {
    var i = 0,
        len = this.length >>> 0;

    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (; i < len; i++)
    {
      if (i in this &&
          fun.call(thisp, this[i], i, this))
        return true;
    }

    return false;
  };

/* Javascript 1.8 Array extras, courtesy of Mozilla */

/**
 * @desc Apply a function against an accumulator and 
 * each value of the array (from left-to-right) as to reduce it to a single value.
 *
 * @param {Function} function
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/Reduce
 */

  Array.prototype.reduce = function(fun /*, initial*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    // no value to return if no initial value and an empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var i = 0;
    if (arguments.length >= 2)
    {
      var rv = arguments[1];
    }
    else
    {
      do
      {
        if (i in this)
        {
          var rv = this[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len)
          throw new TypeError();
      }
      while (true);
    }

    for (; i < len; i++)
    {
      if (i in this)
        rv = fun.call(undefined, rv, this[i], i, this);
    }

    return rv;
  };

/**
 * @desc Apply a function simultaneously against two values of the array (from right-to-left)
 * as to reduce it to a single value.
 *
 * @param {Function} function
 * 
 * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/ReduceRight
 */

  Array.prototype.reduceRight = function(fun /*, initial*/)
  {
    var len = this.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    // no value to return if no initial value, empty array
    if (len == 0 && arguments.length == 1)
      throw new TypeError();

    var i = len - 1;
    if (arguments.length >= 2)
    {
      var rv = arguments[1];
    }
    else
    {
      do
      {
        if (i in this)
        {
          var rv = this[i--];
          break;
        }

        // if array contains no values, no initial value to return
        if (--i < 0)
          throw new TypeError();
      }
      while (true);
    }

    for (; i >= 0; i--)
    {
      if (i in this)
        rv = fun.call(undefined, rv, this[i], i, this);
    }

    return rv;
  };

/**
 * @desc Allows you to quickly pluck a single attribute from an array of objects.
 *
 * @example
 *     > var people = [{'name': 'Alfred', age: 33}, {'name': 'Zed', age: 45}];
 *     > people.pluck('age');
 *     [33,45]
 *     > people.pluck('age').sum();
 *     78
 *     > people.sum('age');
 *     78
 *     > people.sum(function (person) { return person.age });
 *     78
 */

Array.prototype.pluck = function (name) {
	return this.map(function (item) {
		return item[name];
	});
}

/**
 * @desc Returns the maximum value in an array.
 *
 * @param {Function|String} [salient_feature] ``min`` can also order objects
 *     if you provide a salient feature for it to work on, either a function
 *     or the name of an object property
 *
 * @example
 *     > var people = [{'name': 'Alfred'}, {'name': 'Zed'}];
 *     > people.max(function (obj) {
 *     ... return obj.name;
 *     ... });
 *     {'name': 'Zed'}
 */

Array.prototype.max = function (salient) {
	if (salient && salient.is(String)) {
		var mapper = function (obj) { return obj[salient]; }
	} else {
		var mapper = salient || function (obj) { return obj; }
	}
	
	function fn (a, b) {
		return mapper(a) > mapper(b);
	}
	var array = this.clone();
	array.sort(fn);
	return array.pop();
};

/**
 * @returns The minimum value in an array. Works like :func:`Array#max`
 *
 * @param {Function|String} [salient_feature] See ``max``.
 */

Array.prototype.min = function (salient) {
	if (salient && salient.is(String)) {
		var mapper = function (obj) { return obj[salient]; }
	} else {
		var mapper = salient || function (obj) { return obj; }
	}
	
	function fn (a, b) {
		return mapper(a) > mapper(b);
	}
	var array = this.clone();
	array.sort(fn);
	return array.shift();
}

/**
 * @returns The sum of all array values.
 *
 * @param {Function|String} [salient_feature] See ``max``.
 *
 * @example
 *     > var persons = [
 *     ... {'name': 'Abraham', 'children': 5},
 *     ... {'name': 'Joe', 'children': 3},
 *     ... {'name': 'Zed', 'children': 0}
 *     ... ];
 *     > persons.sum('children');
 *     8
 */

Array.prototype.sum = function (salient) {
	if (salient && salient.is(String)) {
		var mapper = function (obj) { return obj[salient]; }
	} else {
		var mapper = salient || function (obj) { return obj; }
	}

	var features = this.map(mapper);
	
	return features.reduce(function (a, b) { return a + b; });	
}

/**
 * @desc Alias for :func:`Array#filter`
 * @function
 */

Array.prototype.select = Array.prototype.filter

/**
 * @desc Does exactly the inverse of :func:`Array#filter` and its alias :func:`Array#select`.
 *
 * @param {Function} fn
 */

Array.prototype.reject = function (fn) {
	return this.select(function (value) {
		return !fn(value);
	});
}

/**
 * @desc Flattens nested arrays.
 *
 * @example
 *     > var list = [[1, 2, [3, 4, 5], 6], [7, 8], 9];
 *     > list.flatten();
 *     [1,2,3,4,5,6,7,8,9];
 */

Array.prototype.flatten = function () {
	return this.reduce(function(memo, value) {
		if (value instanceof Array) return memo.concat(value.flatten());
		memo.push(value);
		return memo;
	}, []);
};

/**
 * @desc Returns a copy of the array with all falsy values removed.
 * This includes ``false``, ``null``, ``0``, ``""``, ``undefined`` and ``NaN``.
 */

Array.prototype.compact = function () {
	return this.reject(function (value) {
		return new Boolean(value) == false;
	});
}

/**
 * @desc Returns the first item of this array
 */

Array.prototype.first = function () {
	return this[0];
}

/**
 * @desc Returns the last item of this array
 */

Array.prototype.last = function () {
	return this.slice(-1)[0];
}

/**
 * @desc Similar to indexOf
 */

Array.prototype.contains = function (obj) {
	return this.indexOf(obj) != -1;
}
﻿var exports = {};
var base64 = exports;
﻿exports.encode64 = encoder('+/');
exports.decode64 = decoder('+/');
exports.urlsafeEncode64 = encoder('-_');
exports.urlsafeDecode64 = decoder('-_');

// base64.js - Base64 encoding and decoding functions
//
// Copyright (c) 2007, David Lindquist <david.lindquist@gmail.com>
// Released under the MIT license
//
// Modified by TJ Holowaychuk for CommonJS module support.
// Modified by Ben Weaver to use any alphabet.
// Modified by Stijn Debrouwere for ExtendScript support.

function encoder(extra) {
  var chars = alphabet(extra);

  return function(str) {
    str = str.toString();
    var encoded = [];
    var c = 0;
    while (c < str.length) {
      var b0 = str.charCodeAt(c++);
      var b1 = str.charCodeAt(c++);
      var b2 = str.charCodeAt(c++);
      var buf = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);
      var i0 = (buf & (63 << 18)) >> 18;
      var i1 = (buf & (63 << 12)) >> 12;
      var i2 = isNaN(b1) ? 64 : (buf & (63 << 6)) >> 6;
      var i3 = isNaN(b2) ? 64 : (buf & 63);
      encoded[encoded.length] = chars.charAt(i0);
      encoded[encoded.length] = chars.charAt(i1);
      encoded[encoded.length] = chars.charAt(i2);
      encoded[encoded.length] = chars.charAt(i3);
    }
    return encoded.join('');
  };
}

function decoder(extra) {
  var chars = alphabet(extra),
      invalid_char = new RegExp('[^' + regexp_escape(chars) + ']');

  return function(str) {
    var invalid = {
      strlen: (str.length % 4 != 0),
      chars:  invalid_char.test(str),
      equals: (new RegExp("/=/").test(str) && (new RegExp("/=[^=]/").test(str) || new RegExp("/={3}/").test(str)))
    };
    if (invalid.strlen || invalid.chars || invalid.equals)
      throw new Error('Invalid base64 data');
    var decoded = [];
    var c = 0;
    while (c < str.length) {
      var i0 = chars.indexOf(str.charAt(c++));
      var i1 = chars.indexOf(str.charAt(c++));
      var i2 = chars.indexOf(str.charAt(c++));
      var i3 = chars.indexOf(str.charAt(c++));
      var buf = (i0 << 18) + (i1 << 12) + ((i2 & 63) << 6) + (i3 & 63);
      var b0 = (buf & (255 << 16)) >> 16;
      var b1 = (i2 == 64) ? -1 : (buf & (255 << 8)) >> 8;
      var b2 = (i3 == 64) ? -1 : (buf & 255);
      decoded[decoded.length] = String.fromCharCode(b0);
      if (b1 >= 0) decoded[decoded.length] = String.fromCharCode(b1);
      if (b2 >= 0) decoded[decoded.length] = String.fromCharCode(b2);
    }
    return decoded.join('');
  };
}

/// --- Aux

function alphabet(extra) {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    + extra
    + '=';
}

function regexp_escape(expr) {
  return expr.replace(/([\^\$\/\.\*\-\+\?\|\(\)\[\]\{\}\\])/, '\\$1');
}
﻿/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

// keyvalue encoding comes in handy to create things like INI files and HTTP headers

var keyvalue = {};
keyvalue.encode = function (obj, options) {
	var separator = options["separator"] || "=";
	var eol = options["eol"] || "\n";
	var output = "";
	var properties = obj.reflect.properties.reject(function (property) {
		return property.name.startswith("_") || property.name == 'reflect';
	});
	properties.forEach(function (property) {
		output += property.name + separator + obj[property.name] + eol;
	});
	return output;
}
keyvalue.decode = function (str, options) {
	var separator = options["separator"] || "=";
	var eol = options["eol"] || "\n";
	var obj = {};
	var pairs = str.split(eol);
	pairs.forEach(function (pair) {
		pair = pair.split(separator);
		obj[pair[0]] = pair[1];
	});
	return obj;	
}

/**
 * @desc Object serialization.
 * 
 * The result of serialization followed by deserialization is the original object, whereas
 * a conversion is not reversible.
 *
 * @param {String} type Either ``base64`` or ``key-value``.
 * @param {Object} [options] Options, if applicable for the serialization type.
 *
 * @example
 *     > var obj = {'key1': 'value1', 'key2': 'value2'};
 *     > obj.serialize('key-value', {'separator': ': ', 'eol': '\n'});
 *     "key1: value1\nkey2: value2\n"
 */

Object.prototype.serialize = function (type, options) {
	var obj = this;
	var options = options || {};
	// type: json, keyvalue
	var serializations = {
		'xml': function () { throw new NotImplementedError(); },
		'json': function () { return JSON.stringify(obj); },
		'base64': function () { return base64.encode64(obj); },
		'key-value': function () { return keyvalue.encode(obj, options); }
	};

	if (serializations.hasOwnProperty(type)) {
		return serializations[type]();
	} else {
		throw RangeError("This method cannot convert from {} to {}".format(obj.prototype.name, type));
	}
}

/**
 * @desc Object deserialization.
 *
 * @param {String} type Either ``xml``, ``base64`` or ``key-value``.
 * @param {Object} [options] Options, if applicable for the deserialization type.
 */

Object.prototype.deserialize = function (type, options) {
	var obj = this;
	
	var deserializations = {
		'xml': function () { return new XML(obj); },
		'json': function () { return JSON.parse(obj); },
		'base64': function () { return base64.decode64(obj); },
		'key-value': function () { return keyvalue.decode(obj, options); }
	}

	if (deserializations.hasOwnProperty(type)) {
		return deserializations[type]();
	} else {
		throw RangeError("This method cannot convert from {} to {}".format(obj.prototype.name, type));
	}
}

/**
 * @desc Provides easy shortcuts to a number of common conversions, like lowercasing a string or 
 * converting the ``arguments`` object to an array.
 * 
 * All of these conversions return a new object, they do not modify the original.
 * 
 * A ``slug`` is a string that's usable as a filename or in an URL: it's
 * a lowercased string with all non-alphanumeric characters stripped out, and spaces replaced by
 * hyphens.
 *
 * Use this method instead of functions like ``parseInt`` and methods like ``str.toLowerCase()``.
 *
 * @param {String} type
 *     One of ``boolean``, ``number``, ``int``, ``float``, ``string``, ``array``, ``alphanumeric``, ``slug``, ``lower`` and ``upper``.
 *
 * @example
 *     > var list = [1.4, 2.2, 4.3];
 *     > function to_integers () {
 *     ... return arguments.to('array').map(function (item) { return item.to('int'); });
 *     ... }
 *     > to_integers(list);
 *     [1,2,3]
 */

Object.prototype.to = function (type) {
	// never, ever modify the original object
	var result = this.clone();
	
	var conversions = {
		/* types */
		// REFACTOR: 'int' should be 'number', to correspond to the class name!
		'boolean': function () { return !!result; },
		'number': function () { return new Number(result); },
		'int': function () { return parseInt(result); },
		'float': function () { return parseFloat(result); },
		'string': function () { return result.toString() },
		'array': function () { return Array.prototype.slice.call(result); },
		/* other conversions */
		'alphanumeric': function () { return result.replace(/[^a-zA-Z0-9 ]/g, ""); },
		'slug': function () { return result.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(" ", "-"); },
		'lower': function () { return result.toLowerCase(); },
		'upper': function () { return result.toUpperCase(); }
	};

	if (conversions.hasOwnProperty(type)) {
		return conversions[type]();
	} else {
		throw RangeError("This method cannot convert from {} to {}".format(this.prototype.name, type));
	}
}
﻿/**
 * @desc This method overloads :func:`Object#is` to combat a problem with some versions of ExtendScript
 * that leads to all error types being considered the base class Error. This problem makes it impossible to
 * do simple comparisons on errors, for example ``new EvalError() instanceof SyntaxError``. The previous 
 * expression should return false but will return true.
 *
 * When testing whether you're dealing with a specific kind of error, use this method, and refrain
 * from using ``instanceof``.
 *
 * @param {Constructor} type Use the constructor itself, not a string or an instance.
 *
 * @example
 *     try {
 *         raise new SyntaxError();
 *     } catch (error if error.is(TypeError)) {
 *         alert("This displays in case of a type error, but not in case of a syntax error.");
 *     }
 *
 * @see :ref:`error-handling` has some useful advice on how to handle errors in ExtendScript.
 *
 * @returns {Bool}
 *     True or false. Any error type matches the base class, so ``new SyntaxError().is(Error)`` would return ``true``.
 */

Error.prototype.is = function (type) {
	if (this instanceof type) {
		if ('_type' in this) {
			return type == Error || this._type == type;
		} else {
			throw new TypeError("This method only works on built-in error types \
				and those created using the Error.factory class method.");
		}
	} else {
		return false;
	}
}

/**
 * @desc Use this classmethod to make sure your custom error types work
 * just like the built-in ones.
 *
 * @param {String} name Preferably the same name as the variable you're associating the error with.
 *
 * @example var DatabaseError = Error.factory("DatabaseError");
 */

Error.factory = function (name) {
	var error = function (msg, file, line) {
		this.name = name;
		this.description = msg;
		this._type = error;
	}
	error.prototype = new Error();
	return error;
}

/**
 * @class
 * @name Error
 * @desc A general-purpose error
 */

Error.prototype._type = Error;

/**
 * @class
 * @name EvalError
 * @desc An error that occurs regarding the global function eval()
 */

EvalError.prototype._type = EvalError;

/**
 * @class
 * @name RangeError
 * @desc An error that occurs when a numeric variable or parameter is outside of its valid range
 */

RangeError.prototype._type = RangeError;

/**
 * @class
 * @name ReferenceError
 * @desc An error that occurs when de-referencing an invalid reference
 */

ReferenceError.prototype._type = ReferenceError;

/**
 * @class
 * @name SyntaxError
 * @desc An error that occurs regarding the global function eval()
 */

SyntaxError.prototype._type = SyntaxError;

/**
 * @class
 * @name TypeError
 * @desc An error that occurs when a variable or parameter is not of a valid type
 */

TypeError.prototype._type = TypeError;

/**
 * @class
 * @name IOError
 * @desc Use when an IO operation (loading a file, writing to a file, an internet connection) fails.
 */

IOError.prototype._type = IOError;

/**
 * @class
 * @name ArithmeticError
 * @desc Use when a calculation misbehaves.
 */

var ArithmeticError = Error.factory("ArithmeticError");

/**
 * @class
 * @name ImportError
 * @desc Use when an import fails. More specific than IOError.
 */

var ImportError = Error.factory("ImportError");

/**
 * @class
 * @name EnvironmentError
 * @desc Use for exceptions that have nothing to do with Extendables or ExtendScript.
 */

var EnvironmentError = Error.factory("EnvironmentError");

/**
 * @class
 * @name ParseError
 * @desc Much like EvalError, but for your own parsers.
 */

var ParseError = Error.factory("ParseError");

/**
 * @class
 * @name SystemError
 * @desc Use when the system (either the Creative Suite app or the operating system) malfunctions.
 */

var SystemError = Error.factory("SystemError");

/**
 * @class
 * @name NotImplementedError
 * @desc Use to warn people that a feature has not yet been implemented, as a placeholder
 * to remind yourself or to indicate that a subclass needs to overload the parent method.
 */

var NotImplementedError = Error.factory("NotImplementedError");

if (app.name.to('lower').contains("indesign")) {
	/**
	 * @class
	 * @name ValidationError
	 */
	ValidationError.prototype._type = ValidationError;
}
﻿/**
 * @class
 * @name Folder
 */

/**
 * @class
 * @name File
 */

/**
 * @desc The extendables base directory. Other notable class properties
 * include ``current``, ``desktop``, ``userData``, ``temp`` and ``trash``. 
 */
Folder.extendables = new File(new File($.fileName).parent + "/patches/file.jsx").parent.parent;

function from_basepath (folder) {
	if (folder.is(String)) folder = new Folder(folder);
	
	var path = [folder.relativeURI, this.relativeURI].join('/');
	return new this.constructor(path);
}

/**
 * @function
 * @desc Get a file or folder starting from an existing path.
 * A foolproof way to join paths together.
 *
 * Similar to ``File#getRelativeURI``, but returns a new File object
 * instead of a path.
 */

File.prototype.at = from_basepath;

/**
 * @function
 * @desc Get a file or folder starting from an existing path.
 * A foolproof way to join paths together.
 *
 * Similar to ``File#getRelativeURI``, but returns a new Folder object
 * instead of a path.
 */

Folder.prototype.at = from_basepath;

/**
 * @desc Easy extraction of path, name, basename and extension from a
 * :func:`File` object.
 * @param {String} type ``path``, ``name``, ``basename`` or ``extension``
 */

File.prototype.component = function (type) {
	switch (type) {
		case 'path':
			return this.path;
		break;
		case 'name':
			return this.name;
		break;
		case 'basename':
			var extlen = this.component('extension').length;
			if (extlen) {
				return this.name.slice(0, -1 * extlen).rtrim('.');
			} else {
				return this.name;
			}
		break;
		case 'extension':
			var name = this.name.split('.');
			if (name.length > 1) {
				return name.last();
			} else {
				return '';
			}
		break;
	}
}

/**
 * @desc Works just like ``Folder#getFiles``, but returns only files, not folders.
 * @param {String|Function} [mask]
 */

Folder.prototype.files = function (mask) {
	return this.getFiles(mask).reject(function (file_or_folder) {
		return file_or_folder.is(Folder);
	});
}

/**
 * @desc Works just like ``Folder#getFiles``, but returns only folders, not files.
 * @param {String|Function} [mask]
 */

Folder.prototype.folders = function (mask) {
	return this.getFiles(mask).reject(function (file_or_folder) {
		return file_or_folder.is(File);
	});
}
﻿/**
 * @desc A simple timer. Makes it easy to know how long it takes to execute something. 
 * Exists as both a static method on ``Date`` 
 * and a regular method on each ``Function`` object.
 * @param {String} format Choose whether the elapsed time should be formatted in 
 * milliseconds (``ms`` or no argument) or seconds, rounded to two decimals (``s``).
 * @default ``ms``
 */

Date.timer = {
	'set': function () {
		this.start = new Date();
	}, 
	'get': function (format) {
		var duration = new Date().getTime() - this.start.getTime();
		if (format == 's') {
			return (duration/1000).toFixed(2);
		} else {
			return duration;
		}
	}
}

Function.prototype.timer = Date.timer;
﻿Math.sum = function () {
	return arguments.to('array').sum();
}

/**
 * @desc A factory method that creates arithmetic progressions, similar to what you'll find in PHP and Python.
 * @returns {Array}
 * @example
 * > Number.range(10);
 * [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
 * > Number.range(1, 11);
 * [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
 * > Number.range(0, 30, 5);
 * [0, 5, 10, 15, 20, 25]
 * > Number.range(0, 10, 3);
 * [0, 3, 6, 9]
 * > Number.range(0, -10, -1);
 * [0, -1, -2, -3, -4, -5, -6, -7, -8, -9]
 * > Number.range(0);
 * []
 * > Number.range(1, 0);
 * []
 */

Number.range = function () {
	var step = arguments[2] || 1;
	if (arguments.length === 1) {
		var from = 0;
		var to = arguments[0];		
	} else {
		var from = arguments[0];
		var to = arguments[1];		
	}
	
	var range = [];
	for (var i = from; Math.abs(i) < Math.abs(to); i = i+step) {
		range.push(i);
	}
	return range;
}
﻿/**
 * @class
 * @name Application
 * @desc An instance of this class is available as ``app`` in every Adobe 
 * application with an ExtendScript engine.
 */

/**
 * @desc Check the host app.
 * @param {String} application The application name. Case-insensitive. 
 * @param {String|Number} [version] 
 *     The application version number. Add two to your CS version number.
 *     or pass in the version number as a string prefixed with 'CS', like ``app.is('indesign', 'CS5')``.
 *
 * @example
 *     alert(app.is('toolkit'));          // any version
 *     alert(app.is('indesign', 'CS2'));  // Creative Suite 2
 *     alert(app.is('indesign', 4));      // Creative Suite 2
 *     alert(app.is('indesign', '6.0'));  // Creative Suite 4.0
 */

Application.prototype.is = function (application, version) {
	if (version && version.to('lower').contains('cs')) {
		if (!application.contains('toolkit')) {
			version = version.replace(/cs/gi, "").to('int') + 2;
		}
	}
	var version = version || this.version;
	var is_app = this.name.to('lower').contains(application.to('lower'));
	var is_version = this.version.to('string').startswith(version);
	return is_app && is_version;
}
if (!app.is("toolkit")) {
	﻿if (typeof(Submenu) !== 'undefined') {
  Submenu.prototype.get_or_add = function (menu_title) {
    var item = this.menuItems.item(menu_title);
    
    // refactor: probably better, though untested: item == null
    if (!item.hasOwnProperty('title')) {
      var action = app.scriptMenuActions.add(menu_title);	
      item = this.menuItems.add(action);		
    }

    return item;
  }
}

/*
var actions = app.scriptMenuActions;
var menu = app.menus.item('$ID/RtMouseLayout');
var item = actions.add("Send feedback to editor");
var opt = menu.menuItems.add(item, LocationOptions.AT_BEGINNING);
var sep = menu.menuSeparators.add(LocationOptions.AFTER, opt);

var boo = function () {
	alert("harro");
}

item.eventListeners.add("onInvoke", boo);
*/

/*
	var main = app.menus.item("$ID/Main");
	var pubtalk       = main.submenus.add("something");
	// clear everything inside the Pubtalk menu, we want a fresh start
	pubtalk.menuElements.everyItem().remove();
	
	// submenus
	var configuration = pubtalk.submenus.add("something below something");	
	
	// actions
	var todo      = configuration.get_or_create("(not implemented yet)");	
	var run_script = pubtalk.get_or_create("Run a cool script");
	
	// event handlers
	run_script.associatedMenuAction.eventListeners.add("onInvoke", function () {
		app.doScript(new File("script.jsx").at("wherever));
	});
*/

/*
IDEAS / VAGUE THOUGHTS: 	
- Maybe we should probably wrap this stuff in a similar way to the UI framework. 
  That way, we can keep a registry of user-added menu items, in case we need 'em
  removed or need to change them later in the script.
  
*/

// note: this would probably work for xmlElement#children as well
// and maybe for other collections too
// perhaps a Collection wrapper class would be handy in that case, to homogenize
// how we handle collections and to be able to handle them in a more Array-like way?

/*
var menus = app.menus.item("Main").submenus;
var menus = app.menus;
var menus = app.menus.item("Main").submenus.item("Window").submenus;
for (var i = 0; i < menus.count(); i++) {
	$.writeln(menus.item(i).name);
}
*/

}
if (app.is("indesign")) {
	﻿/**
 * @class
 * @name Document
 */

// perhaps a getter/setter would be better, 
// which either returns the xml root or replaces it
// with the value of the argument (either a string, 
// using a temp file, or a file, using the native
// importXML directly.

Document.prototype.xml = function (name) {
	var i = name || 0;
	return this.xmlElements.item(i);
}

/**
 * @class
 * @name XMLElement
 */

/**
 * @desc This is equivalent to ``el.xmlElements.item(name)``
 */

XMLElement.prototype.find = function (name) {
	return this.xmlElements.item(name);
}

/**
 * @desc An attribute getter/setter.
 * @returns {undefined|String} Either nothing (when setting the attribute) or the attribute's value
 */

XMLElement.prototype.attr = function (name, value) {
	var attribute = this.xmlAttributes.item(name);
	if (!attribute.isValid) {
		return undefined;
	} else if (value) {
		attribute.value = value;
	} else {
		return attribute.value;
	}
}

/**
 * @desc An element's value getter/setter.
 * @returns {undefined|String} Either nothing (when setting the element's value) or the element's value
 */

XMLElement.prototype.val = function (value) {
	if (!this.isValid) {
		return undefined;
	} else if (value) {
		this.contents = value;
	} else {
		return this.contents;
	}
}

/**
 * @desc An element tag getter/setter.
 * @returns {undefined|String} Either nothing (when setting the tag) or the tag name
 */

XMLElement.prototype.tag = function (type) {
	if (type) {
		this.markupTag = type;
	} else {
		return this.markupTag.name;
	}
}

/**
 * @desc Returns the child xml elements as an array, instead of as an XMLElements collection.
 * If you prefer a collection, use the built-in ``xmlElements`` property instead of this function.
 *
 * Note that this should be equivalent to xml.xmlElements.everyItem() if the documentation to the
 * InDesign DOM were true, but everyItem() doesn't actually return a proper array.
 */
XMLElement.prototype.children = function() {
	var children = [];
	if (!this.has('xmlElements')) return children;
	for (var i = 0; i < this.xmlElements.length; i++) {
		children.push(this.xmlElements[i]);
	}
	return children;
}

/**
 * @desc ``el.repr()`` is a poor man's XML deserializer.
 * It recursively transforms an XML tree into a native
 * ExtendScript object.
 *
 * Known limitations: 
 * * Ignores attributes and comments.
 * * If an element has children, it processes those, but any surrounding 
 *   text content will be ignored. ``<el>this text will be ignored <sub>but this won't be</sub></el>``
 *
 * @example
 *     // <root>
 *     //     <story>
 *     //         A fun little story.
 *     //         <title>An evening in Bristol</title>
 *     //         <authors>
 *     //             <name>Joel</name>
 *     //             <name>Liza</name>
 *     //         </authors>
 *     //     </story>
 *     // </root>
 *     > var root = doc.xml().repr()
 *     > root.story.title
 *     'An evening in Bristol'
 *     > root.story.authors
 *     ['Joel', 'Liza']
 */

XMLElement.prototype.repr = function () {
	var repr = {};
	this.children().forEach(function (element) {
		var tag = element.tag();
		
		if (element.children().length) {
			repr[tag] = element.repr();
		} else {
			// don't replace existing values, but transform 'em
			// into an array instead, and push to that array
			if (tag in repr) {
				if (!repr[tag].is(Array)) repr[tag] = [].push(repr[tag]);
				repr[tag].push(element.val());
			} else {
				repr[tag] = element.val();
			}			
		}
	});
	return repr;
}

/**
 * @class
 * @name Page
 */

// -- untested -- //

/**
 * @desc n/a
 */

Page.prototype.master = function(name) {
	if (name) {
		var master = current.doc.masterSpreads.itemByName(master);
		this.appliedMaster = master;
	} else {
		return this.appliedMaster;
	}

}

/**
 * @class
 * @name LayoutWindow
 */

/**
 * @desc n/a
 */

if (typeof(LayoutWindow) !== 'undefined') {
  LayoutWindow.prototype.page = function(name) {
    if (name) {
      this.activePage = current.doc.pages.item(name);
    } else {
      return this.activePage;
    }
  }
}

/** getter/setter */
var tag = function(name) {
	if (this.has('associatedXMLElement')) {
		// assocXMLElement is read-only, dus weet niet of dit zal werken
		return this.associatedXMLElement.tag(name);		
	} else {
		return undefined;
	}
}

/**
 * @class
 * @name PageItem
 */

/**
 * @desc n/a
 */

PageItem.prototype.tag = tag;

/**
 * @class
 * @name TextFrame
 */

/**
 * @desc n/a
 */

TextFrame.prototype.tag = tag;

/**
 * @class
 * @name Asset
 */

/**
 * @desc the built-in ``asset.placeAsset()`` can only place on a document or on text
 * whereas, most often, you want to place it on specific coordinates on a specific
 * page. This method does that.
 *
 * Works on the active document.
 *
 * @param {Object} positioning A positioning object has three attributes: 
 * ``page`` (a string or number), ``x`` and ``y`` (both unitless numbers).
 * Optionally, you may define a ``layer`` attribute, containing either a
 * layer name or a layer object.
 *
 * @returns {Object[]}
 *     Returns an array with the page items that make up the library asset.
 *
 * @example
 *     var library = app.libraries.item('storylayouts.indl');
 *     var asset = library.assets.item('full-spread');
 *     var page_items = asset.place({
 *         'page': 5, 
 *         'x': 20, 
 *         'y': 50
 *     });
 */

Asset.prototype.place = function (positioning) {
	// we temporarily set unit origins to page, not spread, 
	// so we can treat lefthand and righthand pages the same
	var preferences = current('document').viewPreferences;
	function setup () {
		Asset.prototype.place.frozen = preferences.rulerOrigin;
		preferences.rulerOrigin = RulerOrigin.PAGE_ORIGIN;
	}
	function teardown () {
		preferences.rulerOrigin = Asset.prototype.place.frozen;
	}

	setup();
	
	function move (items, x, y) {
		var group = current('window').activePage.groups.add(items);
		group.move([x, y]);
		group.ungroup();
	}
	// gather parameters
	var doc = current('document');
	var page = doc.pages.item(positioning.page);
	var window = current('window');
	var margins = current('page').marginPreferences;
	var x = positioning.x || margins.left;
	var y = positioning.y || margins.top;
	if (positioning.has('layer')) {
		// positioning.layer can be both an actual layer or a layer name
		if (positioning.layer instanceof Layer) {
			var destination_layer = positioning.layer;
		} else {
			var destination_layer = current('document').layers.item(positioning.layer);
		}
		// can't place an asset on a layer that doesn't exist
		if (destination_layer == null) {
			teardown();
			throw new RangeError("Layer {layer} does not exist".format(positioning));
		}
	} else {
		var destination_layer = doc.activeLayer;
	}
	// put asset on the right page on a temporary layer
	window.activePage = page;
	var temporary_layer = doc.layers.add({'name': '__temp__'});
	this.placeAsset(doc);
	// page items become invalid and lose their ids when they get merged into
	// another layer, so we have to go through quite a bit of trickery
	// to keep track of which page items make up the asset we placed
	for (i = 0; i < temporary_layer.pageItems.count(); i++) {
		temporary_layer.pageItems.item(i).insertLabel('__temp__', '__temp__');
	}
	// move the page items that make up the asset to the given location
	move(temporary_layer.pageItems, x, y);
	// get rid of the temporary layer
	destination_layer.merge(temporary_layer);
	var items = [];
	for (i = 0; i < destination_layer.pageItems.count(); i++) {
		var item = destination_layer.pageItems.item(i);
		if (item.extractLabel('__temp__') == '__temp__') {
			item.insertLabel('__temp__', '');
			items.push(item);
		}
	}
	
	teardown();

	return items;
}

}
var default_settings = new File("settings.jsx").at(Folder.extendables);
var project_specific_settings = new File("settings.jsx").at(Folder.extendables.parent);
if (project_specific_settings.exists) {
	// allows for project-specific settings, so nobody
	// has to override anything within /extendables
	// (this feature is currently undocumented)
	log_buffer.push([4, "Loading Extendables with project-specific settings at {}", project_specific_settings]);
	$.evalFile(project_specific_settings);
} else {
	log_buffer.push([4, "Loading Extendables with default settings"]);
	$.evalFile(default_settings);
}
﻿/*
 * A more-or-less CommonJS-compliant module import system.
 * Namespaces for Javascript -- yay!
 */

var __modules__ = {};
function require (module_id) {
	// CommonJS: A module identifier is a String of "terms"
	var terms = module_id.split('/');
	var module = terms.shift();
	if (__modules__.hasOwnProperty(module)) {
		if (terms.length) {
			return __modules__[module].get_submodule(terms).load().exports;
		} else {
			return __modules__[module].load().exports;
		}
	} else {
		throw Error("No package named " + module_id);
	}
}

// extracts a module into the global namespace (like the eponymous PHP function);
// to be avoided, but sometimes convenience trumps stringency
function extract (module_id) {
	var module = require(module_id);
	for (var name in module) {
		$.global[name] = module[name];
	}
}

function _is_valid_module (file_or_folder) {
	return file_or_folder.is(Folder) || file_or_folder.name.endswith(".jsx");
}

function Module (file_or_folder, is_package) {	
	var self = this;
	
	this.eval = function (file) {
		var exports = {};
		var module = {
			'id': self.id,
			'uri': self.uri
			};

		try {
			$.evalFile(file);
		} catch (error) {
			log_buffer.push([3, "Could not fully load " + module.id + "\n" + error]);	
		}
		return exports;		
	};

	this.extract_submodules = function () {
		var base = file_or_folder;
		if (is_package) {
			base.changePath("./lib");
		}
		var submodule_files = base.getFiles(_is_valid_module);
		
		submodule_files.forEach(function(submodule) {
			var submodule = new Module(submodule);
			self.submodules[submodule.id] = submodule;
		});
	};

	this.get_submodule = function (terms) {
		var submodule = self.submodules[terms.shift()]
		if (terms.length) {
			return submodule.get_submodule(terms);
		} else {
			return submodule;
		}
	};

	this.get_subpackages = function () {
		return self.submodules.values().filter(function (submodule) {
			return submodule.packaged && submodule.id != 'tests';
		});
	}

	this.has_subpackages = function () {
		return !!self.get_subpackages().length;
	}

	this.get_tests = function () {
		var testfolder = new Folder("test").at(self.uri);
		if (testfolder.exists) {
			return testfolder.getFiles("*.specs");
		} else {
			return [];
		}
	}

	this.load = function () {
		if (self.packaged) {
			self.exports = self.submodules['index'].load().exports;
		} else {
			self.exports = self.eval(self.uri);
		}
		return self
	}
	
	/* init */
	this.id = file_or_folder.displayName.split('.')[0];
	this.uri = file_or_folder.absoluteURI;
	this.packaged = file_or_folder.is(Folder);
	this.submodules = {};
	if (this.packaged) {
		this.extract_submodules();
	}
}

function load_modules (packagefolders) {
	packagefolders.forEach(function(packagefolder) {
		if (typeof packagefolder === 'string') {
			var folder = new Folder(packagefolder).at(Folder.extendables);
		} else {
			var folder = packagefolder;
		}
		var packages = folder.getFiles(_is_valid_module);
		
		packages.forEach(function(file_or_folder) {
			// An alias regists as a file in ExtendScript, even if it refers to a folder.
			// Check if the file is an alias and, if so, resolve it.
			if (file_or_folder.alias) file_or_folder = file_or_folder.resolve();
			var module = new Module(file_or_folder, true);
			__modules__[module.id] = module;
		});	
	});
}
load_modules(settings.package_directories);
﻿/**
 * @param {String} item Can be any one of ``window``, ``doc``, ``page`` or ``spread``.
 */

// refactor: should pay mind to how InDesign-tied this implementation is,
// probably needs a variant for every CS application

function current (item) {
	var items = {
		'window': app.layoutWindows.item(0),
		'document': undefined,
		'page': undefined,
		'spread': undefined
	}

	if (app.documents.length) {
		items.merge({
			'document': app.documents.item(0),
			'page': app.documents.item(0).pages.item(0),
			'spread': app.documents.item(0).spreads.item(0)
		});
	}

	if (item in items) {
		return items[item];		
	} else {
		throw RangeError();
	}
}

// write away buffered log messages

var logging = undefined;
            var exports = {};
            #include "core-packages/logging/lib/__core__.jsx"
            var logging = exports;
            exports = undefined;
            
var syslog = new logging.Log("extendables.log");

log_buffer.forEach(function (message) {
	syslog.log.apply(null, message);
});
