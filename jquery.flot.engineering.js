/*
Flot plugin for axis ticks with engineering units/prefixes

Copyright (c) 2014-2015  Rohde & Schwarz GmbH & Co. KG, Munich
Copyright (c) 2014-2015  Patrick Geltinger <patlkli@patlkli.org>

Licensed under the MIT license.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function ($) {
	"use strict";

	var options = {};

	function init(plot) {
		plot.hooks.draw.push(function(plot, canvascontext) {
			$.each(plot.getAxes(), function(axisName, axis) {
				var opts = axis.options;
				if (opts.mode === "engineering") {
					if (typeof axis.labelOriginal !== "undefined") {
						opts.label = axis.labelOriginal;
						delete axis.labelOriginal;
						return;
					}					
				}
			});
		});
		plot.hooks.processDatapoints.push(function (plot) {
			$.each(plot.getAxes(), function(axisName, axis) {
				var opts = axis.options;
				if (opts.mode === "engineering") {
					axis.tickGenerator = function (axis) {
						var delta     = axis.max - axis.min;
						var logTime   = Math.floor( Math.log( Math.abs(delta) ) / Math.LN10 );
                        var normTime  = delta / Math.pow( 10, logTime );
                        var tickSize  = 1.0;

                        if( normTime > 1.0 && normTime <= 2.0 ) {
                            tickSize    = 2.0 * Math.pow(10, logTime - 1);
                            axis.engExp = Math.floor( (logTime - 1) / 3 ) * 3;
                        } else if( normTime > 2.0 && normTime <= 5.0 ) {
                            tickSize = 5.0 * Math.pow(10, logTime - 1);
                            axis.engExp = Math.floor( (logTime - 1) / 3 ) * 3;
                        } else if( normTime <= 1.0 ) {
                            tickSize = 1.0 * Math.pow(10, logTime - 1);
                            axis.engExp = Math.floor( (logTime - 1) / 3 ) * 3;
                        } else {
                            tickSize = 1.0 * Math.pow(10, logTime);
                            axis.engExp = Math.floor( logTime / 3 ) * 3;
                        }
						 
						var engPrefix = "";
						switch( axis.engExp ) {
							case -24: engPrefix = "y"; break;
							case -21: engPrefix = "z"; break;
							case -18: engPrefix = "a"; break;
							case -15: engPrefix = "f"; break;
							case -12: engPrefix = "p"; break;
							case  -9: engPrefix = "n"; break;
							case  -6: engPrefix = "&micro;"; break;
							case  -3: engPrefix = "m"; break;
							case   0: engPrefix = "";  break;
							case   3: engPrefix = "K"; break;
							case   6: engPrefix = "M"; break;
							case   9: engPrefix = "G"; break;
							case  12: engPrefix = "T"; break;
							case  15: engPrefix = "P"; break;
							case  18: engPrefix = "E"; break;
							case  21: engPrefix = "Z"; break;
							case  24: engPrefix = "Y"; break;
							default:  engPrefix = "?"; break;
						}
						axis.engPrefix = engPrefix;
						
						if (typeof opts.label === "string") {
							axis.labelOriginal = opts.label;
							opts.label += " [" + engPrefix + opts.unit + "]";
						}

                        if (typeof opts.tickDecimals === "number") {
							axis.tickDecimals = opts.tickDecimals;
						} else {
							axis.tickDecimals = 0;
						}

						if (typeof opts.minTickSize !== "undefined" && tickSize < opts.minTickSize) {
							axis.tickSize = opts.minTickSize;
						} else {
							axis.tickSize = tickSize;
						}

						var newTicks = [];
						var firstTick = Math.ceil( axis.min / axis.tickSize ) * axis.tickSize;
						
						for( var tickVal = firstTick; tickVal < axis.max; tickVal += axis.tickSize ) {
							newTicks.push(tickVal);
						}

						return newTicks;
					};

					axis.tickFormatter = function(val, axis) {
						var valInUnit = val / Math.pow(10, axis.engExp);
						var resString = valInUnit.toFixed( axis.tickDecimals );
						
						if( typeof axis.options.label !== "string" )
							resString += " " + axis.engPrefix + axis.options.unit;

						return resString;
					};
				}
			});
		});
	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: "engineering",
		version: "1.0"
	});
})(jQuery);