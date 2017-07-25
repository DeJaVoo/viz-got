d3.json('db.json', function(data) {
  nv.addGraph(function() {
    
    var chart = nv.models.stackedAreaChart()
                  .width(1500).height(600)
                  .x(function(d) { return d[0]; })   //We can modify the data accessor functions...
                  .y(function(d) { return d[1]; })   //...in case your data is formatted differently.
                  .useInteractiveGuideline(true)    //Tooltips which show all data points. Very nice!
                  //.rightAlignYAxis(true)      //Let's move the y-axis to the right side.
                  .showControls(true)       //Allow user to choose 'Stacked', 'Stream', 'Expanded' mode.
                  .clipEdge(true);
    
    //Format x-axis labels with custom function.
    chart.xAxis
        .tickFormat(function(d) { 
          return d; });

    chart.yAxis
        .tickFormat(d3.format(',.2f'));
        
  chart._options.controlOptions = ['Stacked', 'Expanded'];
  
  d3.select('#chart svg')
    .datum(data)
      .transition().duration(500).call(chart);
      
    nv.utils.windowResize(chart.update);

    return chart;
  });
})
