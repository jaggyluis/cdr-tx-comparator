﻿(function () {

    d3.comparatorBox = function (config) {

        var __ = {
            data: [],
            width: null,
            height: null,
            color: null,
            ignore: [],
            margin: { top: 10, right: 5, bottom: 5, left: 5 },
            xScale: d3.scale.linear(),
            yScale: d3.scale.linear(),
        }

        extend(__, config);

        var lineFunc = d3.svg.line()
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
            .interpolate('linear');

        var cp = function (selection) {

            selection = cp.selection = d3.select(selection);

            __.data = selection[0][0][0][0].__data__;
            __.width = __.width ? __.width : selection[0][0][0][0].clientWidth;
            __.height = __.height ? __.height : 100;

            cp.div = selection[0][0]
                .append("div")
                .attr("class", "comparator-box");

            cp.svg = cp.div
                .append("svg")
                .attr("class", "comparator-svg")
                .attr("width", __.width)
                .attr("height", __.height);

            cp.build();

            return cp;
        }

        cp.build = function () {

            var xVals = [],
                yVals = [];

            var width = __.width / __.data[0].length;

            __.data.forEach(function (scheme, i) {

                scheme.forEach(function (key, j) {

                    key.forEach(function (item, k) {

                        xVals.push(j / __.width);
                        yVals.push(item);
                    });
                });
            })

            __.xScale.domain([0, d3.max(xVals)]).range([__.margin.left, __.width - __.margin.right]);
            __.yScale.domain([0, d3.max(yVals)]).range([0, __.height / 4]);

            if (!__.collapsed) {

                __.data.forEach(function (g, k) {

                    var g = cp.svg.append("g");

                    values = box(__.data[k]);

                    for (var j = 0; j < values.length; j++) {

                        if (__.ignore.includes(j)) continue;

                        var x = __.xScale(j / __.width) - (width / 2),
                            y = __.yScale(values[j].q[0]),
                            w = width,
                            h = __.yScale(values[j].q[2]) - __.yScale(values[j].q[0]);

                        if (k == 1) {
                            y = __.height / 2 + y;
                        }
                        else {
                            y = __.height / 2 - y - h;
                        }

                        g.append("rect")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("width", w)
                            .attr("height", h)
                            .attr("opacity", 0.5)
                            .attr("fill", function (d, i) {
                                return __.color(d, k);
                            })

                        var x = __.xScale(j / __.width) - (width / 2),
                            y = __.yScale(values[j].w[0]),
                            w = width,
                            h = __.yScale(values[j].w[1]) - __.yScale(values[j].w[0]);

                        if (k == 1) {
                            y = __.height / 2 + y;
                        }
                        else {
                            y = __.height / 2 - y - h;
                        }

                        g.append("rect")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("width", w)
                            .attr("height", h)
                            .attr("opacity", 0.2)
                            .attr("fill", function (d, i) {
                                return __.color(d, k);
                            })

                        var x = __.xScale(j / __.width) - (width / 2),
                            y = __.yScale(values[j].q[1]),
                            w = width,
                            h = 1;

                        if (k == 1) {
                            y = __.height / 2 + y;
                        }
                        else {
                            y = __.height / 2 - y - h;
                        }

                        g.append("rect")
                            .attr("x", x)
                            .attr("y", y)
                            .attr("width", w)
                            .attr("height", h)
                            .attr("opacity", 0.7)
                            .attr("fill", "Black")
                            .attr("stroke-opacity", "0.2");

                    }
                    
                })

                cp.buildLegend();
            }

            return cp;
        }

        cp.buildLegend = function () {

            cp.legendGroup = cp.svg.append("g");

            var opacity = 1,
                stroke = "black";

            // center line
            cp.legendGroup.append("path")
                .attr("d", lineFunc([
                    { x: __.margin.left, y: __.height / 2 },
                    { x: __.width - __.margin.right, y: __.height / 2 },
                ]))
                .attr("stroke", stroke)
                .attr("stroke-width", 0.3)
                .attr("opacity", opacity)
                .attr("fill", "none");

            // left vertical line
            cp.legendGroup.append("path")
                 .attr("d", lineFunc([
                    { x: __.margin.left, y: __.margin.top },
                    { x: __.margin.left, y: __.height - __.margin.bottom },
                 ]))
                .attr("stroke", stroke)
                .attr("stroke-width", 0.3)
                .attr("opacity", opacity)
                .attr("fill", "none");

            // top max line
            cp.legendGroup.append("path")
                 .attr("d", lineFunc([
                    {
                        x: __.margin.left,
                        y: __.height / 2 + __.yScale(cp.yMaxTop)
                    },
                    {
                        x: __.xScale(cp.xMaxTop),
                        y: __.height / 2 + __.yScale(cp.yMaxTop)
                    },
                 ]))
                .attr("stroke", stroke)
                .attr("stroke-width", 0.3)
                .style("stroke-dasharray", ("3, 3"))
                .attr("opacity", opacity)
                .attr("fill", "none");

            // bottom max line
            cp.legendGroup.append("path")
                 .attr("d", lineFunc([
                    {
                        x: __.margin.left,
                        y: __.height / 2 - __.yScale(cp.yMaxBottom)
                    },
                    {
                        x: __.xScale(cp.xMaxBottom),
                        y: __.height / 2 - __.yScale(cp.yMaxBottom)
                    },
                 ]))
                .attr("stroke", stroke)
                .attr("stroke-width", 0.3)
                .style("stroke-dasharray", ("3, 3"))
                .attr("opacity", opacity)
                .attr("fill", "none");

            // top text
            cp.legendGroup.append("text")
                .attr("x", __.margin.left + __.fontPadding)
                .attr("y", __.margin.top - __.yScale(cp.yMaxTop) + __.height / 2)
                .text(round(cp.yMaxTop, 2), 1)
                .style("font-size", __.fontSize + "px");

            // bottom text
            cp.legendGroup.append("text")
                .attr("x", __.margin.left + __.fontPadding)
                .attr("y", __.margin.top + __.yScale(cp.yMaxBottom) + __.height / 2)
                .text(round(cp.yMaxBottom, 2), 1)
                .style("font-size", __.fontSize + "px");

            return cp;
        }

        cp.width = function (val) {
            __.width = val;
            cp.svg.attr("width", __.width)
            return cp;
        }

        cp.height = function (val) {
            __.height = val;
            cp.svg.attr("height", __.height)
            return cp;
        }

        cp.title = function (title) {

            cp.titleGroup = cp.svg.append("g");

            if (!__.collapsed) {

                cp.titleGroup.append("text")
                    .attr("x", __.margin.left + __.fontPadding)
                    .attr("y", __.margin.top)
                    .text(title)
                    .style("font-weight", "bold")
                    .style("font-size", __.margin.top + "px");
            }
            else {

                cp.titleGroup.append("text")
                    .attr("x", __.margin.left + __.fontPadding)
                    .attr("y", 8)
                    .text(title)
                    .style("font-size", 8 + "px");
            }

            return cp;
        }

        cp.ignore = function (arr) {
            __.ignore = __.ignore.concat(arr);
            return cp;
        }

        cp.color = function (val) {
            __.color = val;
            return cp;
        }

        cp.onClick = function (func) {
            cp.svg[0][0].addEventListener("click", func);
            return cp;
        }

        return cp;
    }

    // Inspired by http://informationandvisualization.de/blog/box-plot
    function box (data) {

        var __ = [];

        data.forEach(function (d, i) {
            d = d.map(Number).sort(d3.ascending);
            var g = d3.select(this),
                n = d.length,
                min = d[0],
                max = d[n - 1];

            var quartileData = d.quartiles = quartiles(d);

            var whiskerIndices = whiskers && whiskers.call(this, d, i),
                whiskerData = whiskerIndices && whiskerIndices.map(function (i) { return d[i]; });

            __.push({
                q: quartileData,
                w: whiskerData
            })

        });

        return __;
    };

    function extend(target, source) {
        for (key in source) {
            target[key] = source[key];
        }
        return target;
    };

    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }

    function iqr(k) {
        return function (d, i) {
            var q1 = d.quartiles[0],
                q3 = d.quartiles[2],
                iqr = (q3 - q1) * k,
                i = -1,
                j = d.length;
            while (d[++i] < q1 - iqr);
            while (d[--j] > q3 + iqr);
            return [i, j];
        };
    }

    function whiskers(d) {
        return [0, d.length - 1];
    }

    function quartiles(d) {
        return [
          d3.quantile(d, .25),
          d3.quantile(d, .5),
          d3.quantile(d, .75)
        ];
    }

})();