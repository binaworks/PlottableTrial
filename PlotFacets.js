function PlotFacets() {var colorScale = new Plottable.Scales.Color();
    var xScale = new Plottable.Scales.Linear();
    var xAxis = new Plottable.Axes.Numeric(xScale, "bottom");

    var yScale_senate = new Plottable.Scales.Linear();
    var yAxis_senate = new Plottable.Axes.Numeric(yScale_senate, "left");
    var plot_senate = new Plottable.Plots.Bar()
        .x(function(d) { return d.start_year; }, xScale)
        .y(function(d) { return d.democrats - d.republicans; }, yScale_senate)
        .attr("fill", function(d) { return d.democrats - d.republicans > 0 ? "#0000FF" : "#FF0000" }, colorScale);
    var label_senate = new Plottable.Components.AxisLabel("Senate", -90);

    var yScale_house = new Plottable.Scales.Linear();
    var yAxis_house = new Plottable.Axes.Numeric(yScale_house, "left");
    var plot_house = new Plottable.Plots.Bar()
        .x(function(d) { return d.start_year; }, xScale)
        .y(function(d) { return d.democrats - d.republicans; }, yScale_house)
        .attr("fill", function(d) { return d.democrats - d.republicans > 0 ? "#0000FF" : "#FF0000" }, colorScale);
    var label_house = new Plottable.Components.AxisLabel("House", -90);

    var chart = new Plottable.Components.Table([
        [label_senate, yAxis_senate, plot_senate],
        [label_house, yAxis_house, plot_house],
        [null, null, xAxis]
    ]);

    function loadData(url, plot) {
        d3.json(url, function(error, json) {
            if (error) return console.warn(error);
            plot.addDataset(new Plottable.Dataset(json));
        });
    }

    chart.renderTo("#chart");

    loadData("http://plottablejs.org/tutorials/layouts/senate.json", plot_senate);
    loadData("http://plottablejs.org/tutorials/layouts/house.json", plot_house);

}
