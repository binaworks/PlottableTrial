function PlotLcia() {
    var xScale = new Plottable.Scales.Category();
    var lciaResults = [];
    var lciaMethods = [];
    var scenarios = [];
    var processes = [];
    var tableComponents = [];
    var yAxisFormatter = d3.format("^.2g");

    loadData();

    function displayResults(results) {
        lciaResults = d3.merge(results);
        plotData()
    }

    function loadResults() {

        queue()
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/scenarios/1/processes/115/lciaresults")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/scenarios/1/processes/150/lciaresults")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/scenarios/2/processes/115/lciaresults")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/scenarios/2/processes/150/lciaresults")
            .awaitAll(function(error, results) {
                if (error) return console.error(error);
                displayResults(results);
            });
    }

    function loadData() {
        queue()
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/lciamethods")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/processes")
            .defer(d3.json,"http://kbcalr.isber.ucsb.edu/api/scenarios")
            .await(function(error, m, p, s) {
                if (error) return console.error(error);
                lciaMethods = m;
                processes = p;
                scenarios = s;
                loadResults();
            });
    }

    function getProcessCategory(r) {
        return r.lciaScore[0].processID.toString();
    }

    function getResult(r) {
        return r["total"];
    }

    function getDomain(ds) {
        var extent = [0,0];
        ds.forEach( function(r) {
            var val = getResult(r);
            if (val < extent[0]) {
                extent[0] = val;
            } else if (val > extent[1]) {
                extent[1] = val;
            }
        });
        return extent;
    }

    function plotScenarioResults(mds, domain, s, tableRows) {
        var xAxis = new Plottable.Axes.Category(xScale, "bottom");
        var yScale = new Plottable.Scales.Linear().domain(domain);
        var yAxis = new Plottable.Axes.Numeric(yScale, "left").formatter(yAxisFormatter).showEndTickLabels(true);
        var ds =  mds.filter( function(d) {
            return d["scenarioID"] === s.scenarioID;
        });
        var plot = new Plottable.Plots.Bar();

        yScale.tickGenerator( function () {
            return ds.map(getResult);
        });

        plot.x(getProcessCategory, xScale)
            .y(getResult, yScale);

        plot.addDataset(new Plottable.Dataset(ds));
        tableRows[0].push(yAxis, plot);
        tableRows[1].push(null, xAxis);
    }

    function plotMethodResults(m) {

        var ds =  lciaResults.filter( function(d) {
            return d["lciaMethodID"] === m.lciaMethodID;
        });
        var domain = getDomain(ds);
        var tableRows = [[],[]];

        scenarios.forEach( function(s) {
            plotScenarioResults(ds, domain, s, tableRows);
        });
        tableComponents.push(tableRows[0], tableRows[1]);

    }

    function plotData() {
        var chart;

        lciaMethods.forEach(plotMethodResults);
        chart = new Plottable.Components.Table( tableComponents);
        d3.select("#chart")
            .attr("height", lciaMethods.length * 200)
            .attr("width", scenarios.length * 200);
        chart.renderTo("#chart");
        d3.selectAll(".tick-label").style("visibility", "visible");
    }

}
