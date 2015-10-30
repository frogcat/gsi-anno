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
