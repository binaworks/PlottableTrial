function PlotLcia() {

    var lciaResults = [];
    var lciaResultMap;
    var lciaMethodMap;
    var scenarioMap;
    var processMap;

    var axisFormatter = d3.format("^.2g");
    var scenarioIDs = [1016, 1017, 1018, 1019];
    var processIDs = [115, 150, 111];
    var lciaMethodIDs = [1,2,3];
    var yScale = new Plottable.Scales.Category();
    var yAxisScale = new Plottable.Scales.Category();
    var xScales = d3.map();
    var colorScale = new Plottable.Scales.Color();

    loadData();

    function displayResults(results) {
        lciaResults = d3.merge(results);
        lciaResultMap = d3.nest()
            .key(function(d) { return d.lciaMethodID; })
            .key(function(d) { return d.scenarioID; })
            .map(lciaResults, d3.map);

        plotData()
    }

    function loadResults() {
        var q = queue();
        scenarioIDs.forEach( function (s) {
            processIDs.forEach( function (p) {
                var url = "http://kbcalr.isber.ucsb.edu/api/scenarios/" + s
                        + "/processes/" + p + "/lciaresults";
                q.defer(d3.json,url);
            });
        });
        q.awaitAll(function(error, results) {
            if (error) return console.error(error);
            displayResults(results);
        });
    }

    function filter(data, idName, idValues) {
        var ids = d3.set(idValues);
        return data.filter( function (d) {
            return ids.has(d[idName]);
        });
    }

    function processScales() {
        var processNames;
        yScale.domain(processIDs);
        processNames = processIDs.map( function (p) {
            return processMap.get(p).name;
        });
        yAxisScale.domain(processNames);
    }

    function loadData() {
        queue()
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/lciamethods")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/processes")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/scenarios")
            .await(function(error, m, p, s) {
                if (error) return console.error(error);
                lciaMethodMap = d3.map(m, function(d) { return d.lciaMethodID; });
                processMap = d3.map(p, function(d) { return d.processID; });
                scenarioMap = d3.map(s, function(d) { return d.scenarioID; });
                processScales();
                loadResults();
            });
    }


    function createMethodLabelRow() {
        var row = [null];
        lciaMethodIDs.forEach( function(d) {
            row.push( new Plottable.Components.AxisLabel(lciaMethodMap.get(d).name));
        });
        row.push(null);
        return row;
    }

    function createScenarioRows(s) {
        var row1, row2;

        row1 = [new Plottable.Components.AxisLabel(scenarioMap.get(s).name).yAlignment("center")];
        lciaMethodIDs.forEach( function(m) {
            row1.push( plotResults(s, m));
        });
        row1.push(createYAxis());

        row2 = [null];
        //lciaMethodIDs.forEach( function(m) {
        //    var xAxis = new Plottable.Axes.Numeric(xScales.get(m), "bottom").formatter(axisFormatter);
        //    row2.push( xAxis);
        //});
        //row2.push(null);

        return [row1, row2];
    }

    function createYAxis() {
        return new Plottable.Axes.Category(yAxisScale, "right");
    }

    function getProcessID(r) {
        return r.lciaScore[0].processID;
    }

    function getResult(r) {
        return r["total"];
    }

    function getMethodDomain(data) {
        var extent = [0,0];
        data.forEach( function(d) {
            d.forEach( function (r) {
                var val = getResult(r);
                if (val < extent[0]) {
                    extent[0] = val;
                } else if (val > extent[1]) {
                    extent[1] = val;
                }
            });
        });
        return extent;
    }

    function plotResults(s, m) {
        var plot = new Plottable.Plots.Bar("horizontal"),
            data = lciaResultMap.get(m).get(s);

        plot.x(getResult, xScales.get(m))
            .y(getProcessID, yScale)
            .attr("fill", colorScale.scale(m))
            .labelsEnabled(true)
            .labelFormatter(axisFormatter);

        plot.addDataset(new Plottable.Dataset(data));
        return plot;
    }

    function createXScales() {
        lciaMethodIDs.forEach( function (d) {
            var m = lciaResultMap.get(d.toString()).values();
            var dom = getMethodDomain(m);
            var scale = new Plottable.Scales.Linear();
            scale.domain(dom);
            xScales.set(d, scale);
        });
    }

    function plotData() {
        var chart;
        var innerTable = [];

        colorScale.domain(lciaMethodIDs);
        createXScales();
        innerTable.push(createMethodLabelRow());
        scenarioIDs.forEach( function (s) {
            innerTable = innerTable.concat(createScenarioRows(s));
        });
        chart = new Plottable.Components.Table( innerTable);
        d3.select("#chart")
            .attr("height", scenarioIDs.length * 150)
            .attr("width", 900);
        chart.renderTo("#chart");
    }

}
