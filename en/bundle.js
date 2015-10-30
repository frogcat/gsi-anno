(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var japanese = {};

require('./src/kana.js')(japanese);
require('./src/romanize.js')(japanese);
require('./src/numbers.js')(japanese);

module.exports = japanese;

},{"./src/kana.js":3,"./src/numbers.js":4,"./src/romanize.js":5}],2:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],3:[function(require,module,exports){
'use strict';

module.exports = function (japanese) {
	japanese.katakanaRegex = new RegExp(
		'(' +
			'[' +
				'\\u30a1-\\u30f4' + // ァ～ヴ
				'\\u30f7-\\u30fa' + // ヷ～ヺ
				'\\u30fd-\\u30ff' + // ヽ～ヿ
				'\\u31f0-\\u31ff' + // ㇰ～ㇿ
			']' +
		'|' +
			'\\ud869\\udf08\\u3099' + // 𪜈゙
		'|' +
			'\\ud869\\udf08' + // 𪜈
		'|' +
			'\\ud82c\\udc00' + // 𛀀
		')',
	'g');

	japanese.hiraganaRegex = new RegExp(
		'(' +
			'[' +
				'\\u3041-\\u3094' + // ぁ～ゔ
				'\\u309d-\\u309f' + // ゝ～ゟ
			']' +
		'|' +
			'\\ud82c\\udc01' + // 𛀁
		')',
	'g');

	japanese.specialHiraganizationTable = {
		'ヿ': 'こと',
		'𪜈': 'とも',
		'𪜈゙': 'ども',
		'ヷ': 'わ゙',
		'ヸ': 'ゐ゙',
		'ヹ': 'ゑ゙',
		'ヺ': 'を゙',
		'𛀀': 'え',
		'ㇰ': 'く',
		'ㇱ': 'し',
		'ㇲ': 'す',
		'ㇳ': 'と',
		'ㇴ': 'ぬ',
		'ㇵ': 'は',
		'ㇶ': 'ひ',
		'ㇷ': 'ふ',
		'ㇸ': 'へ',
		'ㇹ': 'ほ',
		'ㇺ': 'む',
		'ㇻ': 'ら',
		'ㇼ': 'り',
		'ㇽ': 'る',
		'ㇾ': 'れ',
		'ㇿ': 'ろ',
	};

	japanese.specialKatakanizationTable = {
		'ゟ': 'ヨリ',
		'𛀁': 'エ',
	};

	var chr = String.fromCharCode;
	var ord = function (char) {
		return char.charCodeAt(0);
	};

	japanese.hiraganize = function (string) {
		return string.replace(japanese.katakanaRegex, function (katakana) {
			if (katakana.match(/^[\u30a1-\u30f4\u30fd\u30fe]$/)) {
				return chr(ord(katakana) - ord('ァ') + ord('ぁ'));
			} else if (japanese.specialHiraganizationTable[katakana]) {
				return japanese.specialHiraganizationTable[katakana];
			}
		});
	};

	japanese.katakanize = function (string) {
		return string.replace(japanese.hiraganaRegex, function (hiragana) {
			if (hiragana.match(/^[\u3041-\u3094\u309d\u309e]$/)) {
				return chr(ord(hiragana) - ord('ぁ') + ord('ァ'));
			} else if (japanese.specialKatakanizationTable[hiragana]) {
				return japanese.specialKatakanizationTable[hiragana];
			}
		});
	};
};

},{}],4:[function(require,module,exports){
'use strict';

var extend = require('extend');

module.exports = function (japanese) {
	japanese.transcriptionConfigs = {
		'default': {
			minusSign: 'マイナス',
			decimalPoint: '・',
			digits: 'common',
			unitNames: 'jinkoki3',
			specialUnitNames: 'none',
			truncateOne: ['十', '百', '千', '拾', '佰', '阡', '仟'],
			smallUnitNames: 'none',
		},
		formal: {
			digits: 'formal',
			unitNames: 'formal',
			specialUnitNames: 'common',
			smallUnitNames: 'common',
		},
		traditional: {
			digits: 'traditional',
			specialUnitNames: 'full',
			smallUnitNames: 'full',
		},
	};

	japanese.predefineedTranscriptionConfigs = {
		digits: {
			arabic: {
				0: '0',
				1: '1',
				2: '2',
				3: '3',
				4: '4',
				5: '5',
				6: '6',
				7: '7',
				8: '8',
				9: '9',
			},
			common: {
				0: '〇',
				1: '一',
				2: '二',
				3: '三',
				4: '四',
				5: '五',
				6: '六',
				7: '七',
				8: '八',
				9: '九',
			},
			formal: {
				0: '〇',
				1: '壱',
				2: '弐',
				3: '参',
				4: '四',
				5: '五',
				6: '六',
				7: '七',
				8: '八',
				9: '九',
			},
			traditional: {
				0: '零',
				1: '壱',
				2: '弐',
				3: '参',
				4: '肆',
				5: '伍',
				6: '陸',
				7: '柒',
				8: '捌',
				9: '玖',
			},
			traditionalOld: {
				0: '零',
				1: '壹',
				2: '貳',
				3: '參',
				4: '肆',
				5: '伍',
				6: '陸',
				7: '柒',
				8: '捌',
				9: '玖',
			},
			simplified: {
				0: '零',
				1: '壹',
				2: '贰',
				3: '叁',
				4: '肆',
				5: '伍',
				6: '陆',
				7: '柒',
				8: '捌',
				9: '玖',
			},
			chineseMilitary: {
				0: '洞',
				1: '幺',
				2: '两',
				3: '三',
				4: '刀',
				5: '五',
				6: '六',
				7: '拐',
				8: '八',
				9: '勾',
			},
			vietnam: {
				0: '〇',
				1: '𠬠',
				2: '𠄩',
				3: '𠀧',
				4: '𦊚',
				5: '𠄼',
				6: '𦒹',
				7: '𦉱',
				8: '𠔭',
				9: '𠃩',
			},
		},
		unitNames: {
			jinkoki1: {
				1: '十',
				2: '百',
				3: '千',
				4: '万',
				5: '億',
				6: '兆',
				7: '京',
				8: '垓',
				9: '𥝱',
				10: '穣',
				11: '溝',
				12: '澗',
				13: '正',
				14: '載',
				15: '極',
				23: '恒河沙',
				31: '阿僧祇',
				39: '那由他',
				47: '不可思議',
				55: '無量大数',
				lit: 63,
			},
			jinkoki2: {
				1: '十',
				2: '百',
				3: '千',
				4: '万',
				8: '億',
				12: '兆',
				16: '京',
				20: '垓',
				24: '𥝱',
				28: '穣',
				32: '溝',
				36: '澗',
				40: '正',
				44: '載',
				48: '極',
				56: '恒河沙',
				64: '阿僧祇',
				72: '那由他',
				80: '不可思議',
				88: '無量大数',
				lit: 96,
			},
			jinkoki3: {
				1: '十',
				2: '百',
				3: '千',
				4: '万',
				8: '億',
				12: '兆',
				16: '京',
				20: '垓',
				24: '𥝱',
				28: '穣',
				32: '溝',
				36: '澗',
				40: '正',
				44: '載',
				48: '極',
				52: '恒河沙',
				56: '阿僧祇',
				60: '那由他',
				64: '不可思議',
				68: '無量大数',
				lit: 72,
			},
			josu: {
				1: '十',
				2: '百',
				3: '千',
				4: '万',
				8: '億',
				16: '兆',
				32: '京',
				64: '垓',
				128: '𥝱',
				256: '穣',
				512: '溝',
				1024: '澗',
				2048: '正',
				4096: '載',
				8192: '極',
				16384: '恒河沙',
				32768: '阿僧祇',
				65536: '那由他',
				131072: '不可思議',
				262144: '無量大数',
				lit: 524288,
			},
			formal: {
				1: '拾',
				2: '百',
				3: '千',
				4: '万',
				8: '億',
				12: '兆',
				16: '京',
				20: '垓',
				24: '𥝱',
				28: '穣',
				32: '溝',
				36: '澗',
				40: '正',
				44: '載',
				48: '極',
				52: '恒河沙',
				56: '阿僧祇',
				60: '那由他',
				64: '不可思議',
				68: '無量大数',
				lit: 72,
			},
		},
		specialUnitNames: {
			none: {},
			common: {
				20: '廿',
				30: '卅',
			},
			full: {
				20: '廿',
				30: '卅',
				40: '卌',
				200: '皕',
			},
		},
		smallUnitNames: {
			none: {},
			common: {
				1: '分',
				2: '厘',
				3: '毛',
				4: '糸',
			},
			wari: {
				1: '割',
				2: '分',
				3: '厘',
				4: '毛',
				5: '糸',
			},
			full: {
				1: '分',
				2: '厘',
				3: '毛',
				4: '糸',
				5: '忽',
				6: '微',
				7: '繊',
				8: '沙',
				9: '塵',
				10: '埃',
				11: '渺',
				12: '漠',
				13: '模糊',
				14: '逡巡',
				15: '須臾',
				16: '瞬息',
				17: '弾指',
				18: '刹那',
				19: '六徳',
				20: '虚空',
				21: '清浄',
			},
			wariFull: {
				1: '割',
				2: '分',
				3: '厘',
				4: '毛',
				5: '糸',
				6: '忽',
				7: '微',
				8: '繊',
				9: '沙',
				10: '塵',
				11: '埃',
				12: '渺',
				13: '漠',
				14: '模糊',
				15: '逡巡',
				16: '須臾',
				17: '瞬息',
				18: '弾指',
				19: '刹那',
				20: '六徳',
				21: '虚空',
				22: '清浄',
			},
		},
	};

	japanese.transcribeNumber = function (number, config) {
		if (typeof config === 'undefined') {
			// default config
			config = japanese.transcriptionConfigs['default'];
		}

		if (typeof config === 'string') {
			config = japanese.transcriptionConfigs[config];

			if (typeof config === 'undefined') {
				throw new ReferenceError('Transcription method "' + config + '" is undefined');
			}
		}

		if (typeof config === 'object') {
			config = extend({}, japanese.transcriptionConfigs['default'], config);
		} else {
			throw new Error('You specified unknown config to japanese.transcribeNumber');
		}

		if (typeof config.digits === 'string') {
			config.digits = japanese.predefineedTranscriptionConfigs.digits[config.digits];

			if (typeof config.digits === 'undefined') {
				throw new ReferenceError('Transcription method of digits "' + config.digits + '" is undefined');
			}
		}

		if (typeof config.unitNames === 'string') {
			config.unitNames = japanese.predefineedTranscriptionConfigs.unitNames[config.unitNames];

			if (typeof config.unitNames === 'undefined') {
				throw new ReferenceError('Transcription method of unitNames "' + config.unitNames + '" is undefined');
			}
		}

		if (typeof config.specialUnitNames === 'string') {
			config.specialUnitNames = japanese.predefineedTranscriptionConfigs.specialUnitNames[config.specialUnitNames];

			if (typeof config.specialUnitNames === 'undefined') {
				throw new ReferenceError('Transcription method of specialUnitNames "' + config.specialUnitNames + '" is undefined');
			}
		}

		if (typeof config.smallUnitNames === 'string') {
			config.smallUnitNames = japanese.predefineedTranscriptionConfigs.smallUnitNames[config.smallUnitNames];

			if (typeof config.smallUnitNames === 'undefined') {
				throw new ReferenceError('Transcription method of smallUnitNames "' + config.smallUnitNames + '" is undefined');
			}
		}

		// Unify input to string

		if (typeof number === 'number') {
			// TODO
			number = number.toString();
		} else if (typeof number !== 'string') {
			throw new ReferenceError('Type of `number` is unsupported');
		}

		var length = number.length;

		// Main convertion starts here

		// handle zero
		if (number === '0') {
			return config.digits[0];
		}

		var transcription = '';

		if (number.slice(-1) !== '0') {
			transcription += config.digits[number.slice(-1)]
		}

		// Get sanitized unit name keys
		var keysOfUnitNames = Object.keys(config.unitNames).map(function (key) {
			// convert to int
			return parseInt(key);
		}).filter(function (key, index, self) {
			// unique
			return self.indexOf(key) === index;
		}).filter(function (key) {
			// validate
			return isFinite(key) && key > 0;
		}).sort(function (a, b) {
			// asc sort
			return a - b;
		});

		keysOfUnitNames.forEach(function (key, index) {
			var nextKey = keysOfUnitNames[index + 1] || Infinity;
			// slice the digits spaned by the unit name
			var token = number.slice(Math.max(length - nextKey, 0), Math.max(length - key, 0));

			if (token.length > 0) {
				// check if every number in the token is zero
				if (!token.split('').every(function (digit) { return digit === '0' })) {
					// truncateOne
					if (config.truncateOne.indexOf(config.unitNames[key]) !== -1 && parseInt(token) === 1) {
						transcription = config.unitNames[key] + transcription;
					} else {
						transcription = japanese.transcribeNumber(token, config) + config.unitNames[key] + transcription;
					}
				}
			}
		});

		return transcription;
	};

	return japanese;
};

},{"extend":2}],5:[function(require,module,exports){
'use strict';

var extend = require('extend');

module.exports = function (japanese) {
	japanese.romanizationTable = {
		'あ': 'a',
		'い': 'i',
		'う': 'u',
		'え': 'e',
		'お': 'o',
		'か': 'ka',
		'き': 'ki',
		'く': 'ku',
		'け': 'ke',
		'こ': 'ko',
		'さ': 'sa',
		'し': 'si',
		'す': 'su',
		'せ': 'se',
		'そ': 'so',
		'た': 'ta',
		'ち': 'ti',
		'つ': 'tu',
		'て': 'te',
		'と': 'to',
		'な': 'na',
		'に': 'ni',
		'ぬ': 'nu',
		'ね': 'ne',
		'の': 'no',
		'は': 'ha',
		'ひ': 'hi',
		'ふ': 'hu',
		'へ': 'he',
		'ほ': 'ho',
		'ま': 'ma',
		'み': 'mi',
		'む': 'mu',
		'め': 'me',
		'も': 'mo',
		'や': 'ya',
		'ゆ': 'yu',
		'よ': 'yo',
		'ら': 'ra',
		'り': 'ri',
		'る': 'ru',
		'れ': 're',
		'ろ': 'ro',
		'わ': 'wa',
		'ゐ': 'wi',
		'ゑ': 'we',
		'を': 'wo',
		'ん': 'n',
		'が': 'ga',
		'ぎ': 'gi',
		'ぐ': 'gu',
		'げ': 'ge',
		'ご': 'go',
		'ざ': 'za',
		'じ': 'zi',
		'ず': 'zu',
		'ぜ': 'ze',
		'ぞ': 'zo',
		'だ': 'da',
		'ぢ': 'di',
		'づ': 'du',
		'で': 'de',
		'ど': 'do',
		'ば': 'ba',
		'び': 'bi',
		'ぶ': 'bu',
		'べ': 'be',
		'ぼ': 'bo',
		'ゔ': 'vu',
		'ぱ': 'pa',
		'ぴ': 'pi',
		'ぷ': 'pu',
		'ぺ': 'pe',
		'ぽ': 'po',
		'きゃ': 'kya',
		'きゅ': 'kyu',
		'きぇ': 'kye',
		'きょ': 'kyo',
		'しゃ': 'sya',
		'しゅ': 'syu',
		'しぇ': 'sye',
		'しょ': 'syo',
		'ちゃ': 'tya',
		'ちゅ': 'tyu',
		'ちぇ': 'tye',
		'ちょ': 'tyo',
		'にゃ': 'nya',
		'にゅ': 'nyu',
		'にぇ': 'nye',
		'にょ': 'nyo',
		'ひゃ': 'hya',
		'ひゅ': 'hyu',
		'ひぇ': 'hye',
		'ひょ': 'hyo',
		'みゃ': 'mya',
		'みゅ': 'my',
		'みぇ': 'mye',
		'みょ': 'myo',
		'りゃ': 'rya',
		'りゅ': 'ryu',
		'りぇ': 'rye',
		'りょ': 'ryo',
		'ぎゃ': 'gya',
		'ぎゅ': 'gyu',
		'ぎぇ': 'gye',
		'ぎょ': 'gyo',
		'じゃ': 'zya',
		'じゅ': 'zyu',
		'じぇ': 'zye',
		'じょ': 'zyo',
		'ぢゃ': 'dya',
		'ぢゅ': 'dyu',
		'ぢぇ': 'dye',
		'ぢょ': 'dyo',
		'びゃ': 'bya',
		'びゅ': 'byu',
		'びぇ': 'bye',
		'びょ': 'byo',
		'ゔぁ': 'va',
		'ゔぃ': 'vi',
		'ゔぇ': 've',
		'ゔぉ': 'vo',
		'ぴゃ': 'pya',
		'ぴゅ': 'pyu',
		'ぴぇ': 'pye',
		'ぴょ': 'pyo',
		/*
		 * Rarely used character combinations
		 *
		 * These romanizations are normally not defined in most specifications and
		 * very hard to verify therefore.
		 * In this library, most of the codes are derived from following Wikipedia article.
		 * http://en.wikipedia.org/wiki/Hepburn_romanization#For_extended_katakana
		 */
		'いぃ': 'yi',
		'いぇ': 'ye',
		'うぁ': 'wa',
		'うぃ': 'wi',
		'うぅ': 'wu',
		'うぇ': 'we',
		'うぉ': 'wo',
		'うゅ': 'wyu',
		'ゔゃ': 'vya',
		'ゔゅ': 'vyu',
		'ゔょ': 'vyo',
		'くぁ': 'kwa',
		'くぃ': 'kwi',
		'くぅ': 'kwu',
		'くぇ': 'kwe',
		'くぉ': 'kwo',
		'くゎ': 'kwa',
		'ぐぁ': 'gwa',
		'ぐぃ': 'gwi',
		'ぐぅ': 'gwu',
		'ぐぇ': 'gwe',
		'ぐぉ': 'gwo',
		'ぐゎ': 'gwa',
		'すぃ': 'si',
		'ずぃ': 'zi',
		'つぁ': 'tua',
		'つぃ': 'tui',
		'つぇ': 'tue',
		'つぉ': 'tuo',
		'つゅ': 'tuyu',
		'づぁ': 'dua',
		'づぃ': 'dui',
		'づぇ': 'due',
		'づぉ': 'duo',
		'てゃ': 'tea',
		'てぃ': 'tei',
		'てゅ': 'teu',
		'てぇ': 'tee',
		'てょ': 'teo',
		'とぅ': 'tou',
		'でゃ': 'dea',
		'でぃ': 'dei',
		'でゅ': 'deu',
		'でぇ': 'dee',
		'でょ': 'deo',
		'どぅ': 'dou',
		'ふぁ': 'hua',
		'ふぃ': 'hui',
		'ふぇ': 'hue',
		'ふぉ': 'huo',
		'ふゃ': 'huya',
		'ふゅ': 'huyu',
		'ふょ': 'huyo',
		'ほぅ': 'hu',
		'ら゚': 'la',
		'り゚': 'li',
		'る゚': 'lu',
		'れ゚': 'le',
		'ろ゚': 'lo',
		'わ゙': 'va',
		'ゐ゙': 'vi',
		'ゑ゙': 've',
		'を゙': 'vo',
		'ぁ': 'a',
		'ぃ': 'i',
		'ぅ': 'u',
		'ぇ': 'e',
		'ぉ': 'o',
		'ゃ': 'ya',
		'ゅ': 'yu',
		'ょ': 'yo',
		'っ': 'tu',
		'ゎ': 'wa',
		'ヵ': 'ka',
		'ヶ': 'ke',
	};

	japanese.romanizePuncutuationTable = {
		'。': '.',
		'、': ',',
		'・': '-',
		'－': '-',
		'「': '“',
		'」': '”',
		'（': '(',
		'）': ')',
		'　': ' ',
		' ': ' ',
	};

	japanese.defaultRomanizationConfig = {
		'し': 'shi',
		'ち': 'chi',
		'つ': 'tsu',
		'ふ': 'fu',
		'じ': 'ji',
		'ぢ': 'ji',
		'づ': 'zu',
		'ああ': 'aa',
		'いい': 'ii',
		'うう': 'ū',
		'ええ': 'ee',
		'おお': 'ō',
		'あー': 'ā',
		'えい': 'ei',
		'おう': 'ō',
		'んあ': 'n\'a',
		'んば': 'nba',
		'っち': 'tchi',
		'ゐ': 'i',
		'を': 'o',
		punctuation: true,
	};

	japanese.romanizationConfigs = {
		wikipedia: {},
		'traditional hepburn': {
			'を': 'wo',
			'んあ': 'n-a',
			'んば': 'mba',
		},
		'modified hepburn': {
			'ああ': 'ā',
			'いい': 'ii',
			'うう': 'ū',
			'ええ': 'ē',
			'おお': 'ō',
		},
		kunrei: {
			'し': 'si',
			'ち': 'ti',
			'つ': 'tu',
			'ふ': 'hu',
			'じ': 'zi',
			'ぢ': 'zi',
			'づ': 'zu',
			'ああ': 'â',
			'いい': 'î',
			'うう': 'û',
			'ええ': 'ê',
			'おお': 'ô',
			'あー': 'â',
			'おう': 'ô',
			'っち': 'tti',
		},
		nihon: {
			'し': 'si',
			'ち': 'ti',
			'つ': 'tu',
			'ふ': 'hu',
			'じ': 'zi',
			'ぢ': 'di',
			'づ': 'du',
			'ああ': 'ā',
			'いい': 'ī',
			'うう': 'ū',
			'ええ': 'ē',
			'おお': 'ō',
			'あー': 'ā',
			'おう': 'ō',
			'っち': 'tti',
			'ゐ': 'wi',
			'を': 'wo',
		},
	};



	japanese.romanize = function (string, config) {
		if (typeof config === 'undefined') {
			config = 'wikipedia';
		}

		if (typeof config === 'string') {
			config = japanese.romanizationConfigs[config];

			if (typeof config === 'undefined') {
				throw new ReferenceError('Romanization method "' + config + '" is undefined');
			}
		}

		if (typeof config === 'object') {
			config = extend({}, japanese.defaultRomanizationConfig, config);
		} else {
			throw new Error('You specified unknown config to japanese.romanize');
		}

		var table = extend({}, japanese.romanizationTable);

		if (config['し'] === 'shi') {
			extend(table, {
				'し': 'shi',
				'しゃ': 'sha',
				'しゅ': 'shu',
				'しぇ': 'she',
				'しょ': 'sho',
			});
		}

		if (config['ち'] === 'chi') {
			extend(table, {
				'ち': 'chi',
				'ちゃ': 'cha',
				'ちゅ': 'chu',
				'ちぇ': 'che',
				'ちょ': 'cho',
				'てぃ': 'ti',
				'てゅ': 'tyu',
			});
		}

		if (config['つ'] === 'tsu') {
			extend(table, {
				'つ': 'tsu',
				'つぁ': 'tsa',
				'つぃ': 'tsi',
				'つぇ': 'tse',
				'つぉ': 'tso',
				'つゅ': 'tsyu',
				'とぅ': 'tu',
			});
		}

		if (config['ふ'] === 'fu') {
			extend(table, {
				'ふ': 'fu',
				'ふぁ': 'fa',
				'ふぃ': 'fi',
				'ふぇ': 'fe',
				'ふぉ': 'fo',
				'ふゃ': 'fya',
				'ふゅ': 'fyu',
				'ふょ': 'fyo',
			});
		}

		if (config['じ'] === 'ji') {
			extend(table, {
				'じ': 'ji',
				'じゃ': 'ja',
				'じゅ': 'ju',
				'じぇ': 'je',
				'じょ': 'jo',
			});
		}

		if (config['ぢ'] === 'ji') {
			extend(table, {
				'ぢ': 'ji',
				'ぢゃ': 'ja',
				'ぢゅ': 'ju',
				'ぢぇ': 'je',
				'ぢょ': 'jo',
				'でぃ': 'di',
				'でゅ': 'dyu',
			});
		}

		if (config['ぢ'] === 'zi') {
			extend(table, {
				'ぢ': 'zi',
				'ぢゃ': 'zya',
				'ぢゅ': 'zyu',
				'ぢぇ': 'zye',
				'ぢょ': 'zyo',
				'でぃ': 'di',
				'でゅ': 'dyu',
			});
		}

		if (config['づ'] === 'zu') {
			extend(table, {
				'づ': 'zu',
				'づぁ': 'zua',
				'づぃ': 'zui',
				'づぇ': 'zue',
				'づぉ': 'zuo',
				'どぅ': 'du',
			});
		}

		if (config['ゐ'] === 'i') {
			extend(table, {
				'ゐ': 'i',
				'ゑ': 'e',
			});
		}

		if (config['を'] === 'o') {
			extend(table, {
				'を': 'o',
			});
		}

		string = japanese.hiraganize(string);

		var dest = '';
		var previousToken = '';

		while (string.length > 0) {
			var token = '';

			// assuming we have only one or two letter token in table
			if (table[string.slice(0, 2)]) {
				token = string.slice(0, 2);
				string = string.slice(2);
			} else {
				token = string[0];
				string = string.slice(1);
			}

			// handle small tsu
			if (token === 'っ') {
				previousToken = token;
				continue;
			}

			var tokenDest = table[token] || '';

			// small tsu
			if (previousToken === 'っ') {
				if (tokenDest.match(/^[^aiueo]/)) {
					if (token[0] === 'ち') {
						if (config['っち'] === 'tchi') {
							tokenDest = {
								'ち': 'tchi',
								'ちゃ': 'tcha',
								'ちゅ': 'tchu',
								'ちぇ': 'tche',
								'ちょ': 'tcho',
							}[token];
						} else if (config['っち'] === 'cchi') {
							tokenDest = {
								'ち': 'cchi',
								'ちゃ': 'ccha',
								'ちゅ': 'cchu',
								'ちぇ': 'cche',
								'ちょ': 'ccho',
							}[token];
						} else { // normally 'tti'
							tokenDest = {
								'ち': 'tti',
								'ちゃ': 'ttya',
								'ちゅ': 'ttyu',
								'ちぇ': 'ttye',
								'ちょ': 'ttyo',
							}[token];
						}
					} else {
						tokenDest = tokenDest[0] + tokenDest;
					}
				} else {
					/*
					 * Some article claims that "ローマ字教育の指針(文部科学省)" defines that
					 * strings ending with "っ" must be represented with trailing apostrophe
					 * though I couldn't confirm.
					 */
					dest += '\'';
				}
			}

			// long vowel
			if (token === 'ー') {
				if (dest.match(/[aiueo]$/)) {
					if (config['あー'] === 'a') {
						// nope
					} else if (config['あー'] === 'ah') {
						dest += 'h';
					} else if (config['あー'] === 'a-') {
						dest += '-';
					} else if (config['あー'] === 'aa') {
						dest = dest.slice(0, -1) + {
							'a': 'aa',
							'i': 'ii',
							'u': 'uu',
							'e': 'ee',
							'o': 'oo',
						}[dest.slice(-1)];
					} else if (config['あー'] === 'â') {
						dest = dest.slice(0, -1) + {
							'a': 'â',
							'i': 'î',
							'u': 'û',
							'e': 'ê',
							'o': 'ô',
						}[dest.slice(-1)];
					} else if (config['あー'] === 'ā') {
						dest = dest.slice(0, -1) + {
							'a': 'ā',
							'i': 'ī',
							'u': 'ū',
							'e': 'ē',
							'o': 'ō',
						}[dest.slice(-1)];
					}

					tokenDest = '';
				} else {
					tokenDest = '-';
				}
			} else if (dest.slice(-1) === 'e' && tokenDest[0] === 'i') {
				tokenDest = tokenDest.slice(1);

				if (config['えい'] === 'ei') {
					dest += 'i';
				} else if (config['えい'] === 'ee') {
					dest += 'e';
				} else if (config['えい'] === 'eh') {
					dest += 'h';
				} else if (config['えい'] === 'ê') {
					dest = dest.slice(0, -1) + 'ê';
				} else if (config['えい'] === 'ē') {
					dest = dest.slice(0, -1) + 'ē';
				} else if (config['えい'] === 'e') {
					// nope
				}
			} else if (dest.slice(-1) === 'o' && tokenDest[0] === 'u') {
				tokenDest = tokenDest.slice(1);

				if (config['おう'] === 'ou') {
					dest += 'u';
				} else if (config['おう'] === 'oo') {
					dest += 'o';
				} else if (config['おう'] === 'oh') {
					dest += 'h';
				} else if (config['おう'] === 'ô') {
					dest = dest.slice(0, -1) + 'ô';
				} else if (config['おう'] === 'ō') {
					dest = dest.slice(0, -1) + 'ō';
				} else if (config['おう'] === 'o') {
					// nope
				}
			} else if (dest.match(/[aiueo]$/) && dest.slice(-1) === tokenDest[0] && token !== 'を') {
				tokenDest = tokenDest.slice(1);

				dest = dest.slice(0, -1) + config[{
					'a': 'ああ',
					'i': 'いい',
					'u': 'うう',
					'e': 'ええ',
					'o': 'おお',
				}[dest.slice(-1)]];
			}

			// んば
			if (tokenDest.match(/^[bpm]/) && previousToken === 'ん') {
				if (config['んば'] === 'nba') {
					// nope
				} else if (config['んば'] === 'mba') {
					dest = dest.slice(0, -1) + 'm';
				}
			}

			// んあ
			if (tokenDest.match(/^[aiueoy]/) && previousToken === 'ん') {
				if (config['んあ'] === 'na') {
					// nope
				} else if (config['んあ'] === 'n\'a') {
					tokenDest = '\'' + tokenDest;
				} else if (config['んあ'] === 'n-a') {
					tokenDest = '-' + tokenDest;
				}
			}

			if (config.punctuation && japanese.romanizePuncutuationTable[token]) {
				tokenDest = japanese.romanizePuncutuationTable[token];
			}

			dest += tokenDest;

			previousToken = token;
		}

		if (previousToken === 'っ') {
			dest += '\'';
		}

		return dest;
	};
};

},{"extend":2}],6:[function(require,module,exports){
(function(window) {
	var HAS_HASHCHANGE = (function() {
		var doc_mode = window.documentMode;
		return ('onhashchange' in window) &&
			(doc_mode === undefined || doc_mode > 7);
	})();

	L.Hash = function(map) {
		this.onHashChange = L.Util.bind(this.onHashChange, this);

		if (map) {
			this.init(map);
		}
	};

	L.Hash.parseHash = function(hash) {
		if(hash.indexOf('#') === 0) {
			hash = hash.substr(1);
		}
		var args = hash.split("/");
		if (args.length == 3) {
			var zoom = parseInt(args[0], 10),
			lat = parseFloat(args[1]),
			lon = parseFloat(args[2]);
			if (isNaN(zoom) || isNaN(lat) || isNaN(lon)) {
				return false;
			} else {
				return {
					center: new L.LatLng(lat, lon),
					zoom: zoom
				};
			}
		} else {
			return false;
		}
	};

	L.Hash.formatHash = function(map) {
		var center = map.getCenter(),
		    zoom = map.getZoom(),
		    precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));

		return "#" + [zoom,
			center.lat.toFixed(precision),
			center.lng.toFixed(precision)
		].join("/");
	},

	L.Hash.prototype = {
		map: null,
		lastHash: null,

		parseHash: L.Hash.parseHash,
		formatHash: L.Hash.formatHash,

		init: function(map) {
			this.map = map;

			// reset the hash
			this.lastHash = null;
			this.onHashChange();

			if (!this.isListening) {
				this.startListening();
			}
		},

		removeFrom: function(map) {
			if (this.changeTimeout) {
				clearTimeout(this.changeTimeout);
			}

			if (this.isListening) {
				this.stopListening();
			}

			this.map = null;
		},

		onMapMove: function() {
			// bail if we're moving the map (updating from a hash),
			// or if the map is not yet loaded

			if (this.movingMap || !this.map._loaded) {
				return false;
			}

			var hash = this.formatHash(this.map);
			if (this.lastHash != hash) {
				location.replace(hash);
				this.lastHash = hash;
			}
		},

		movingMap: false,
		update: function() {
			var hash = location.hash;
			if (hash === this.lastHash) {
				return;
			}
			var parsed = this.parseHash(hash);
			if (parsed) {
				this.movingMap = true;

				this.map.setView(parsed.center, parsed.zoom);

				this.movingMap = false;
			} else {
				this.onMapMove(this.map);
			}
		},

		// defer hash change updates every 100ms
		changeDefer: 100,
		changeTimeout: null,
		onHashChange: function() {
			// throttle calls to update() so that they only happen every
			// `changeDefer` ms
			if (!this.changeTimeout) {
				var that = this;
				this.changeTimeout = setTimeout(function() {
					that.update();
					that.changeTimeout = null;
				}, this.changeDefer);
			}
		},

		isListening: false,
		hashChangeInterval: null,
		startListening: function() {
			this.map.on("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.addListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
				this.hashChangeInterval = setInterval(this.onHashChange, 50);
			}
			this.isListening = true;
		},

		stopListening: function() {
			this.map.off("moveend", this.onMapMove, this);

			if (HAS_HASHCHANGE) {
				L.DomEvent.removeListener(window, "hashchange", this.onHashChange);
			} else {
				clearInterval(this.hashChangeInterval);
			}
			this.isListening = false;
		}
	};
	L.hash = function(map) {
		return new L.Hash(map);
	};
	L.Map.prototype.addHash = function() {
		this._hash = L.hash(this);
	};
	L.Map.prototype.removeHash = function() {
		this._hash.removeFrom();
	};
})(window);

},{}],7:[function(require,module,exports){
'use strict';
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function ToObject(val) {
	if (val == null) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function ownEnumerableKeys(obj) {
	var keys = Object.getOwnPropertyNames(obj);

	if (Object.getOwnPropertySymbols) {
		keys = keys.concat(Object.getOwnPropertySymbols(obj));
	}

	return keys.filter(function (key) {
		return propIsEnumerable.call(obj, key);
	});
}

module.exports = Object.assign || function (target, source) {
	var from;
	var keys;
	var to = ToObject(target);

	for (var s = 1; s < arguments.length; s++) {
		from = arguments[s];
		keys = ownEnumerableKeys(Object(from));

		for (var i = 0; i < keys.length; i++) {
			to[keys[i]] = from[keys[i]];
		}
	}

	return to;
};

},{}],8:[function(require,module,exports){
"use strict";
module.exports = {
    'ZE': {start:0xff01, end:0xff5e}, // 全角英数
    'HE': {start:0x0021, end:0x007e}, // 半角英数
    'HG': {start:0x3041, end:0x3096}, // ひらがな
    'KK': {start:0x30a1, end:0x30f6}, // カタカナ

    'HS': {regexp: /(\s|\u00A0)/g, list:['\u0020', '\u00A0']}, // 半角スペース
    'ZS': {regexp: /(\u3000)/g, list:['　', '　']}, //全角スペース

    'HK': {regexp: /([\uff66-\uff9c]\uff9e)|([\uff8a-\uff8e]\uff9f)|([\uff61-\uff9f])/g, // 半角カナ
        list: ['｡', '｢', '｣', '､', '･', 'ｦ', 'ｧ', 'ｨ', 'ｩ', 'ｪ', 'ｫ', 'ｬ', 'ｭ', 'ｮ', 'ｯ', 'ｰ', 'ｱ', 'ｲ', 'ｳ', 'ｴ', 'ｵ', 'ｶ', 'ｷ', 'ｸ', 'ｹ', 'ｺ', 'ｻ', 'ｼ', 'ｽ', 'ｾ', 'ｿ', 'ﾀ', 'ﾁ', 'ﾂ', 'ﾃ', 'ﾄ', 'ﾅ', 'ﾆ', 'ﾇ', 'ﾈ', 'ﾉ', 'ﾊ', 'ﾋ', 'ﾌ', 'ﾍ', 'ﾎ', 'ﾏ', 'ﾐ', 'ﾑ', 'ﾒ', 'ﾓ', 'ﾔ', 'ﾕ', 'ﾖ', 'ﾗ', 'ﾘ', 'ﾙ', 'ﾚ', 'ﾛ', 'ﾜ', 'ﾝ', 'ﾞ', 'ﾟ', 'ｦﾞ', 'ｳﾞ', 'ｶﾞ', 'ｷﾞ', 'ｸﾞ', 'ｹﾞ', 'ｺﾞ', 'ｻﾞ', 'ｼﾞ', 'ｽﾞ', 'ｾﾞ', 'ｿﾞ', 'ﾀﾞ', 'ﾁﾞ', 'ﾂﾞ', 'ﾃﾞ', 'ﾄﾞ', 'ﾊﾞ', 'ﾊﾟ', 'ﾋﾞ', 'ﾋﾟ', 'ﾌﾞ', 'ﾌﾟ', 'ﾍﾞ', 'ﾍﾟ', 'ﾎﾞ', 'ﾎﾟ', 'ﾜﾞ']},
    'ZK': {regexp: /([\u3001-\u30fc])/g,  //全角カナ (半角カナ変換用)
        list: ['。', '「', '」', '、', '・', 'ヲ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ッ', 'ー', 'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ', 'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ', 'ル', 'レ', 'ロ', 'ワ', 'ン', '゛', '゜', 'ヺ', 'ヴ', 'ガ', 'ギ', 'グ', 'ゲ', 'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ', 'ド', 'バ', 'パ', 'ビ', 'ピ', 'ブ', 'プ', 'ベ', 'ペ', 'ボ', 'ポ', 'ヷ']}
};
},{}],9:[function(require,module,exports){
'use strict';


/**
 * @constructor
 * @param {object} mojisyu
 * @param {string} str
 */
function Moji(mojisyu, str) {
    this.origin = str;
    this._result = this.origin;
    this._mojisyu = mojisyu;
}

Moji.prototype.toString = function () {
    return this._result;
};


/**
 * convert
 * 変換の実行
 *
 * @param {string} from_syumei 変換前の文字種名
 * @param {string} to_syumei 変化後の文字種名
 * @returns {Moji}
 */
Moji.prototype.convert = function convert(from_syumei, to_syumei) {
    var from_mojisyu_body = this._mojisyu[from_syumei];
    var to_mojisyu_body = this._mojisyu[to_syumei];

    if (this._mojisyuType(from_mojisyu_body) === 'range' && this._mojisyuType(to_mojisyu_body) === 'range') {
        this._result = this._rangeConvert(from_mojisyu_body, to_mojisyu_body);
        return this;
    }

    if (this._mojisyuType(from_mojisyu_body) === 'regexp' && this._mojisyuType(to_mojisyu_body) === 'regexp') {
        this._result = this._regexpConvert(from_mojisyu_body, to_mojisyu_body);
        return this;
    }
};

/**
 * _rangeConvert
 * @param {object} from_syu
 * @param {object} to_syu
 * @return {string}
 * @private
 */
Moji.prototype._rangeConvert = function _rangeConvert(from_syu, to_syu) {
    var distance = to_syu.start - from_syu.start;
    return this._rangeMap(from_syu, function (moji, is_match, code) {
        if (is_match) {
            return String.fromCharCode(code + distance);
        }
        return moji;
    }).join('');
};

/**
 * _regexpConvert
 * @param from_syu
 * @param to_syu
 * @return {string}
 * @private
 */
Moji.prototype._regexpConvert = function _regexpConvert(from_syu, to_syu) {
    return this._regexpMap(from_syu, function (moji, is_match, index) {
        if (!is_match) {
            return moji;
        }
        return to_syu.list[index];
    });
};


/**
 *  filter
 *  文字種のみに絞込
 *  @param {string} mojisyu_name 絞り込まれる文字種
 *  @returns {Moji}
 */
Moji.prototype.filter = function filter(mojisyu_name) {
    var mojisyu_body = this._mojisyu[mojisyu_name];

    if (this._mojisyuType(mojisyu_body) === 'range') {
        this._result = this._rangeFilter(mojisyu_body);
        return this;
    }

    if (this._mojisyuType(mojisyu_body) === 'regexp') {
        this._result = this._regexpFilter(mojisyu_body);
        return this;
    }
};

/**
 * _rangeFilter
 * @param mojisyu
 * @return {string}
 * @private
 */
Moji.prototype._rangeFilter = function _rangeFilter(mojisyu) {
    return this._rangeMap(mojisyu, function (moji, is_range) {
        if (is_range) {
            return moji;
        }
        return '';
    }).join('');
};

/**
 * _regexpFilter
 * @param mojisyu
 * @return {string}
 * @private
 */
Moji.prototype._regexpFilter = function _regexpFilter(mojisyu) {
    var match_mojis = [];
    this._regexpMap(mojisyu, function (moji, is_match) {
        if (is_match) {
            match_mojis.push(moji);
        }
    });
    return match_mojis.join('');
};


/**
 * reject
 * 文字種は排除
 * @param {string} mojisyu_name 排除される文字種
 * @returns {Moji}
 */
Moji.prototype.reject = function reject(mojisyu_name) {
    var mojisyu_body = this._mojisyu[mojisyu_name];

    if (this._mojisyuType(mojisyu_body) === 'range') {
        this._result = this._rangeReject(mojisyu_body);
        return this;
    }

    if (this._mojisyuType(mojisyu_body) === 'regexp') {
        this._result = this._regexpReject(mojisyu_body);
        return this;
    }
};

/**
 * _rangeReject
 * @param mojisyu
 * @return {string}
 * @private
 */
Moji.prototype._rangeReject = function _rangeReject(mojisyu) {
    return this._rangeMap(mojisyu, function (moji, is_range) {
        if (!is_range) {
            return moji;
        }
        return '';
    }).join('');
};

/**
 * _regexpReject
 * @param mojisyu
 * @return {string}
 * @private
 */
Moji.prototype._regexpReject = function _regexpReject(mojisyu) {
    var reject_moji = this._regexpFilter(mojisyu);
    return this._result.replace(reject_moji, '');
};


/**
 * _mojisyuType
 * 文字種のタイプを判別
 * range || regexp
 * @param {mojisyu} mojisyu 文字種
 * @return {string}
 */
Moji.prototype._mojisyuType = function _mojisyuType(mojisyu) {
    if (mojisyu.start && mojisyu.end) {
        return 'range';
    }
    if (mojisyu.regexp && mojisyu.list) {
        return 'regexp';
    }

    return '';
};

/**
 * _rangeMap
 * @param {object} mojisyu - 文字種オブジェクト
 * @param {function} callback
 * @return {Array}
 * @private
 */
Moji.prototype._rangeMap = function _rangeMap(mojisyu, callback) {
    return this._result.split('').map(function (moji) {
        var code = moji.charCodeAt(0);
        var is_match = (code >= mojisyu.start && code <= mojisyu.end);
        return callback.call(this, moji, is_match, code);
    });
};

/**
 * _regexpMap
 * @param {object} mojisyu - 文字種オブジェクト
 * @param callback
 * @return {string}
 * @private
 */
Moji.prototype._regexpMap = function _regexpMap(mojisyu, callback) {
    return this._result.replace(mojisyu.regexp, function (moji) {
        var index = mojisyu.list.indexOf(moji);
        var is_match = index >= 0;
        return callback.call(this, moji, is_match, index);
    });
};

module.exports = Moji;
},{}],10:[function(require,module,exports){
"use strict";
var Moji = require("./moji.core");
var mojiStr = require("./moji.string");
var _mojisyu = require("./default_mojisyu");
var assign = require("object-assign");
var mojisyu = assign({}, _mojisyu);

mojiStr.call(Moji.prototype);

var moji = function (str) {
    return new Moji(mojisyu, str);
};

moji.addMojisyu = function (syu) {
    mojisyu = assign(mojisyu, syu);
};

module.exports = moji;

},{"./default_mojisyu":8,"./moji.core":9,"./moji.string":11,"object-assign":7}],11:[function(require,module,exports){
function mojiStr() {
    /**
     * trim
     * 行頭、行末の空白を削除
     */
    this.trim = function () {
        this._result = this._result.trim();
        return this;
    };

    /**
     * match
     * matchした文字列に変更
     * matchしなければなにもしない
     * @param {RegExp} regexp
     */
    this.match = function(regexp) {
        var result = this._result.match(regexp);

        if (!result || !regexp) return this;

        this._result = result.toString();
        return this;
    };


    this.replace = function(regexp, new_str) {
        this._result = this._result.replace(regexp, new_str);
        return this;
    };

    return this;
}

module.exports = mojiStr;

// slice
//substr
//toLocaleLowerCase
//toLocaleUpperCase
//toLowerCase
//toUpperCase
//trim
//trimLeft
//trimRight
//encodeURIComponent
//decodeURIComponent
},{}],12:[function(require,module,exports){
var japanese = require("japanese");
var moji = require("moji");
require("leaflet-hash");

L.AnnoLayer = L.GridLayer.extend({
	options : {
		pane : 'overlayPane',
		maxNativeZoom : null,
		onEachFeature : function(feature) {
			return null;
		}
	},
	initialize : function(url, options) {
		this._url = url;
		L.setOptions(this, options);
	},
	_getTileURL : function(coords) {
		var z = this.options.maxNativeZoom;
		if (!z || z >= coords.z) {
			return L.Util.template(this._url, coords);
		}
		var f = coords.z - z;
		return L.Util.template(this._url, {
			x : Math.floor(coords.x / Math.pow(2, f)),
			y : Math.floor(coords.y / Math.pow(2, f)),
			z : coords.z - f
		});
	},
	createTile : function(coords, done) {
		var tile = document.createElement('div');
		tile.setAttribute("data-zoom", coords.z);
		var url = this._getTileURL(coords);
		var that = this;
		var x = new XMLHttpRequest();
		x.open("GET", url, true);
		x.onreadystatechange = function() {
			if (done)
				done(null, tile);
			if (x.readyState == 4 && x.status == 200)
				that._onLoadJSON(JSON.parse(x.responseText), tile, coords);
		};
		x.send();
		return tile;
	},
	_onLoadJSON : function(json, tile, coords) {
		if (!json || !json.features)
			return;
		var opt = this.options;
		var map = this._map;
		json.features.forEach(function(feature) {
			var node = opt.onEachFeature(feature);
			if (!node)
				return;
			var p1 = L.GeoJSON.coordsToLatLng(feature.geometry.coordinates);
			var p2 = map.project(p1, coords.z);
			if (p2.x < coords.x * opt.tileSize || p2.x > (1 + coords.x) * opt.tileSize)
				return;
			if (p2.y < coords.y * opt.tileSize || p2.y > (1 + coords.y) * opt.tileSize)
				return;
			var p3 = L.point(p2.x % opt.tileSize, p2.y % opt.tileSize);
			var div = L.DomUtil.create('div', 'leaflet-tile-anno', tile);
			div.appendChild(node);
			L.DomUtil.setPosition(div, p3);
		});
	}
});

addEventListener("load", function() {

	var romanize = function(a) {
		if (a.match(/^\W+$/))
			return japanese.romanize(a);
		else if (a.match(/^\w+$/))
			return a;
		else if (a.match(/^(\W+)(\w.*)$/)) {
			var v1 = RegExp.$1;
			var v2 = RegExp.$2;
			return japanese.romanize(v1) + " " + romanize(v2);
		} else if (a.match(/^(\w+)(\W.*)$/)) {
			var v1 = RegExp.$1;
			var v2 = RegExp.$2;
			return v1 + " " + romanize(v2);
		}
		return "";
	};

	var map = L.map("map", {
		zoom : 16,
		center : [ 35.676542, 139.71764115 ]
	});

	map.zoomControl.setPosition("bottomright");

	L.hash(map);

	L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
		attribution : "<a href='http://maps.gsi.go.jp/development/'>GSI Ortho</a>",
		minZoom : 8,
		maxZoom : 17
	}).addTo(map);

	(new L.AnnoLayer('http://cyberjapandata.gsi.go.jp/xyz/experimental_anno/{z}/{x}/{y}.geojson', {
		attribution : "<a href='https://github.com/gsi-cyberjapan/experimental_anno'>GSI Anno</a>",
		minZoom : 15,
		maxZoom : 17,
		maxNativeZoom : 15,
		onEachFeature : function(feature) {
			var knj = feature.properties.knj;
			var kana = feature.properties.kana;
			var ctg = feature.properties.annoCtg;
			if (kana.length == 0 || ctg.length == 0 || knj.length == 0)
				return null;

			var span = document.createElement('span');
			span.setAttribute("title", ctg + "\n" + knj + "\n" + kana);
			span.setAttribute("data-ctg", ctg);

			var rome = romanize(moji(kana).convert('ZE', 'HE').toString());
			rome = rome.charAt(0).toUpperCase() + rome.slice(1);

			if (ctg == '陸上交通施設（鉄道駅名）') {
				rome = rome.replace(/eki$/, "-station");
			} else if (ctg == '居住地名（町字名）') {
				rome = rome.replace(/chōme$/, "");
			} else if (ctg == '行政区画（市区町村）') {
				// rome = rome.replace(/ku$/, "_ku");
			}

			span.appendChild(document.createTextNode(rome));

			return span;
		}
	})).addTo(map);

});

},{"japanese":1,"leaflet-hash":6,"moji":10}]},{},[12]);
