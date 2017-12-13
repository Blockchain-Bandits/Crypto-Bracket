/*global $, document, LINECHARTEXMPLE*/
$(document).ready(function() {

    'use strict';
    var exchangesList = {
        info: [
            "acx", "allcoin", "bitfinex", "bitfinex2",
            "bitmarket", "bitmex", "bittrex",
            "btcexchange", "gdax", "hitbtc2", "huobi", "kraken",
            "okcoincny", "okcoinusd", "okex", "poloniex"
        ]
    };

    //render initial chart based on the last 30 days
    $.get("/api/ccxt/bittrex/BTC%2FUSDT/1h/" + moment().subtract(30, 'days').unix() + "000/400", function(data) {
        var openPrice = data.openPrice.map(item => {
            return { x: new Date(item.x), y: item.y };
        });

        var closingPrice = data.closingPrice.map(item => {
            return { x: new Date(item.x), y: item.y };
        });
        financeChart(openPrice, closingPrice);
    });

    updateSelection("#select-exchange", exchangesList);

    $.get("/api/ccxt-info/bittrex").then(function(data) {

        updateSelection("#select-symbol", { info: data.info.symbols });
        updateSelection("#select-timeframe", { info: data.info.timeframes });
        $("#select-symbol").val('BTC/USDT');
        $("#select-timeframe").val('1h');
        $("#select-exchange").val('bittrex');

    });


    function updateExchangeMenu(exchange, data) {
        $.get("/api/ccxt-info/" + exchange).then(function(data) {

            if (data.info) {
                updateSelection("#select-symbol", { info: data.info.symbols });
                updateSelection("#select-timeframe", { info: data.info.timeframes });
            } else {
                $('#exampleModal').modal('show');
            }
        });
    }

    function updateSelection(selection, data) {

        var currentSelection = $(selection);
        var newOption;

        currentSelection.empty();

        for (var i = 0; i < data.info.length; i++) {
            newOption = $('<option>');
            newOption.text(data.info[i]);
            currentSelection.append(newOption);
        }
    }

    $('#submit-chart-request').on('click', function(event) {

        event.preventDefault();

        var selectedExchange = $("#select-exchange").val().trim();
        var selectedSymbol = $("#select-symbol").val().trim();
        var selectedTimeframe = $("#select-timeframe").val().trim();
        var selectedDate = $("#select-date").val().trim();
        var selectedLimit = $("#select-limit").val();

        selectedDate = moment(new Date(selectedDate)).unix() * 1000;
        selectedSymbol = selectedSymbol.replace('/', '%2F');
        selectedLimit = 1000;

        var chartRequest = {
            exchange: selectedExchange,
            symbol: selectedSymbol,
            timeframe: selectedTimeframe,
            date: selectedDate,
            limit: selectedLimit
        };


        var requestString = '/' + selectedExchange + '/' +
            selectedSymbol + '/' +
            selectedTimeframe + '/' +
            selectedDate + '/' +
            selectedLimit;


        $.get("/api/ccxt" + requestString, function(data) {
            var openPrice = data.openPrice.map(item => {
                return { x: new Date(item.x), y: item.y };
            });

            var closingPrice = data.closingPrice.map(item => {
                return { x: new Date(item.x), y: item.y };
            });
            $("#financeChartExample").empty();
            financeChart(openPrice, closingPrice);
        });


    });

    $("#select-exchange").change(function(event) {
        updateExchangeMenu($("#select-exchange").val());
    });


    $(function() {
        $("#select-date").datepicker();
    });

    function financeChart(data1, data2) {


        var xScale = new Plottable.Scales.Time();
        var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");
        xAxis.formatter(Plottable.Formatters.multiTime());
        var yScale = new Plottable.Scales.Linear();
        var yAxis = new Plottable.Axes.Numeric(yScale, "left");
        var colorScale = new Plottable.Scales.Color();

        var series1 = new Plottable.Dataset(data1, { name: "Opening Price" });
        var series2 = new Plottable.Dataset(data2, { name: "Closing Price" });


        var legend = new Plottable.Components.Legend(colorScale);
        // colorScale.domain(["Opening Price", "Closing Price"]);
        legend.xAlignment("center");
        legend.yAlignment("center");
    


        var plot = new Plottable.Plots.Line();
        plot.x(function(d) {
            return d.x;
        }, xScale).y(function(d) {
            return d.y;
        }, yScale);
        plot.attr("stroke", function(d, i, dataset) {
            return dataset.metadata().name;
        }, colorScale);
        plot.addDataset(series1).addDataset(series2);
        plot.autorangeMode("y");

        var sparklineXScale = new Plottable.Scales.Time();
        var sparklineXAxis = new Plottable.Axes.Time(sparklineXScale, "bottom");
        var sparklineYScale = new Plottable.Scales.Linear();
        var sparkline = new Plottable.Plots.Line();
        sparkline.x(function(d) {
            return d.x;
        }, sparklineXScale).y(function(d) {
            return d.y;
        }, sparklineYScale);
        sparkline.attr("stroke", function(d, i, dataset) {
            return dataset.metadata().name;
        }, colorScale);
        sparkline.addDataset(series1).addDataset(series2);

        var dragBox = new Plottable.Components.XDragBoxLayer();
        dragBox.resizable(true);
        dragBox.onDrag(function(bounds) {
            var min = sparklineXScale.invert(bounds.topLeft.x);
            var max = sparklineXScale.invert(bounds.bottomRight.x);
            xScale.domain([min, max]);
        });
        dragBox.onDragEnd(function(bounds) {
            if (bounds.topLeft.x === bounds.bottomRight.x) {
                xScale.domain(sparklineXScale.domain());
            }
        });
        xScale.onUpdate(function() {
            dragBox.boxVisible(true);
            var xDomain = xScale.domain();
            dragBox.bounds({
                topLeft: { x: sparklineXScale.scale(xDomain[0]), y: null },
                bottomRight: { x: sparklineXScale.scale(xDomain[1]), y: null }
            });
        });
        var miniChart = new Plottable.Components.Group([sparkline, dragBox]);

        var pzi = new Plottable.Interactions.PanZoom(xScale, null);
        pzi.attachTo(plot);

        var output = d3.select("#hoverFeedback");
        var outputDefaultText = "Closest:";
        output.text(outputDefaultText);

        var chart = new Plottable.Components.Table([
            [yAxis, plot],
            [null, xAxis],
            [null, miniChart],
            [null, sparklineXAxis],
            [null,  legend],
        ]);
        chart.rowWeight(2, 0.2);
        chart.renderTo("#financeChartExample");

        var crosshair = createCrosshair(plot);
        var pointer = new Plottable.Interactions.Pointer();
        pointer.onPointerMove(function(p) {
            var nearestEntity = plot.entityNearest(p);
            if (nearestEntity.datum == null) {
                return;
            }
            crosshair.drawAt(nearestEntity.position);
            var datum = nearestEntity.datum;
            output.text("Closest: (" + datum.x.toLocaleString() + ", " + datum.y.toFixed(2) + ")");
        });
        pointer.onPointerExit(function() {
            crosshair.hide();
            output.text(outputDefaultText);
        });
        pointer.attachTo(plot);
    }

    function makeSeriesData(n, startDate) {
        startDate = startDate || new Date();
        var startYear = startDate.getUTCFullYear();
        var startMonth = startDate.getUTCMonth();
        var startDay = startDate.getUTCDate();
        var toReturn = new Array(n);
        for (var i = 0; i < n; i++) {
            toReturn[i] = {
                x: new Date(Date.UTC(startYear, startMonth, startDay + i)),
                y: i > 0 ? toReturn[i - 1].y + Math.random() * 2 - 1 : Math.random() * 5
            };
        };
        return toReturn;
    }

    function createCrosshair(plot) {
        var crosshair = {};
        var crosshairContainer = plot.foreground().append("g").style("visibility", "hidden");
        crosshair.vLine = crosshairContainer.append("line").attr("stroke", "black").attr("y1", 0).attr("y2", plot.height());
        crosshair.circle = crosshairContainer.append("circle").attr("stroke", "black").attr("fill", "white").attr("r", 3);
        crosshair.drawAt = function(p) {
            crosshair.vLine.attr({
                x1: p.x,
                x2: p.x
            });
            crosshair.circle.attr({
                cx: p.x,
                cy: p.y
            });
            crosshairContainer.style("visibility", "visible");
        };
        crosshair.hide = function() {
            crosshairContainer.style("visibility", "hidden");
        };
        return crosshair;
    }
});