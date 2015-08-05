function PlotLcia() {
    var colorScale = new Plottable.Scales.Color();
    var xScale = new Plottable.Scales.Category();
    var yScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Category(xScale, "bottom");
    var yAxis = new Plottable.Axes.Numeric(yScale, "left");
    var plot = new Plottable.Plots.Bar()
        .x(function(d) { return d.lciaScore[0].processID.toString(); }, xScale)
        .y(function(d) { return d["total"]; }, yScale);
    var dataSet = null;


    var chart = new Plottable.Components.Table([
        [yAxis, plot],
        [null, xAxis]
    ]);


    function loadData() {
        var urlPath = "http://kbcalr.isber.ucsb.edu/api/scenarios/1/processes/",
            processID = ["115", "150"],
            url = urlPath + processID[0] + "/lciaresults";

        d3.json(url, function(error, json) {
            if (error) return console.warn(error);
            dataSet = json;
            url = urlPath + processID[1] + "/lciaresults";
            d3.json(url, function(error, json) {
                if (error) return console.warn(error);
                dataSet = dataSet.concat(json);
                plotData();
            });
        });
    }

    loadData();

    function plotData() {
        var lciaMethodID = 1,
            mds = dataSet.filter( function(d) {
                return d["lciaMethodID"] === lciaMethodID;
            });

        yAxis.formatter(d3.format("^.2g"));
        plot.addDataset(new Plottable.Dataset(mds))
            ;

        chart.renderTo("#chart");
    }

}
