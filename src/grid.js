c3_chart_internal_fn.initGrid = function () {
    var $$ = this, config = $$.config, CLASS = $$.CLASS, d3 = $$.d3;
    $$.grid = $$.main.append('g')
        .attr("clip-path", $$.clipPath)
        .attr('class', CLASS[_grid]);
    if (config[__grid_x_show]) {
        $$.grid.append("g").attr("class", CLASS[_xgrids]);
    }
    if (config[__grid_y_show]) {
        $$.grid.append('g').attr('class', CLASS[_ygrids]);
    }
    $$.grid.append('g').attr("class", CLASS[_xgridLines]);
    $$.grid.append('g').attr('class', CLASS[_ygridLines]);
    if (config[__grid_focus_show]) {
        $$.grid.append('g')
            .attr("class", CLASS[_xgridFocus])
            .append('line')
            .attr('class', CLASS[_xgridFocus]);
    }
    $$.xgrid = d3.selectAll([]);
    $$.xgridLines = d3.selectAll([]);
};

c3_chart_internal_fn.updateXGrid = function (withoutUpdate) {
    var $$ = this, config = $$.config, CLASS = $$.CLASS, d3 = $$.d3,
        xgridData = $$.generateGridData(config[__grid_x_type], $$.x),
        tickOffset = $$.isCategorized() ? $$.xAxis.tickOffset() : 0;

    $$.xgridAttr = config[__axis_rotated] ? {
        'x1': 0,
        'x2': $$.width,
        'y1': function (d) { return $$.x(d) - tickOffset; },
        'y2': function (d) { return $$.x(d) - tickOffset; }
    } : {
        'x1': function (d) { return $$.x(d) + tickOffset; },
        'x2': function (d) { return $$.x(d) + tickOffset; },
        'y1': 0,
        'y2': $$.height
    };

    $$.xgrid = $$.main.select('.' + CLASS[_xgrids]).selectAll('.' + CLASS[_xgrid])
        .data(xgridData);
    $$.xgrid.enter().append('line').attr("class", CLASS[_xgrid]);
    if (!withoutUpdate) {
        $$.xgrid.attr($$.xgridAttr)
            .style("opacity", function () { return +d3.select(this).attr(config[__axis_rotated] ? 'y1' : 'x1') === (config[__axis_rotated] ? $$.height : 0) ? 0 : 1; });
    }
    $$.xgrid.exit().remove();
};

c3_chart_internal_fn.updateYGrid = function () {
    var $$ = this, config = $$.config, CLASS = $$.CLASS;
    $$.ygrid = $$.main.select('.' + CLASS[_ygrids]).selectAll('.' + CLASS[_ygrid])
        .data($$.y.ticks(config[__grid_y_ticks]));
    $$.ygrid.enter().append('line')
        .attr('class', CLASS[_ygrid]);
    $$.ygrid.attr("x1", config[__axis_rotated] ? $$.y : 0)
        .attr("x2", config[__axis_rotated] ? $$.y : $$.width)
        .attr("y1", config[__axis_rotated] ? 0 : $$.y)
        .attr("y2", config[__axis_rotated] ? $$.height : $$.y);
    $$.ygrid.exit().remove();
    $$.smoothLines($$.ygrid, 'grid');
};


c3_chart_internal_fn.redrawGrid = function (duration, withY) {
    var $$ = this, main = $$.main, config = $$.config, CLASS = $$.CLASS,
        xgridLine, ygridLine, yv;
    main.select('line.' + CLASS[_xgridFocus]).style("visibility", "hidden");
    if (config[__grid_x_show]) {
        $$.updateXGrid();
    }
    $$.xgridLines = main.select('.' + CLASS[_xgridLines]).selectAll('.' + CLASS[_xgridLine])
        .data(config[__grid_x_lines]);
    // enter
    xgridLine = $$.xgridLines.enter().append('g')
        .attr("class", function (d) { return CLASS[_xgridLine] + (d.class ? ' ' + d.class : ''); });
    xgridLine.append('line')
        .style("opacity", 0);
    xgridLine.append('text')
        .attr("text-anchor", "end")
        .attr("transform", config[__axis_rotated] ? "" : "rotate(-90)")
        .attr('dx', config[__axis_rotated] ? 0 : -$$.margin.top)
        .attr('dy', -5)
        .style("opacity", 0);
    // udpate
    // done in d3.transition() of the end of this function
    // exit
    $$.xgridLines.exit().transition().duration(duration)
        .style("opacity", 0)
        .remove();

    // Y-Grid
    if (withY && config[__grid_y_show]) {
        $$.updateYGrid();
    }
    if (withY) {
        $$.ygridLines = main.select('.' + CLASS[_ygridLines]).selectAll('.' + CLASS[_ygridLine])
            .data(config[__grid_y_lines]);
        // enter
        ygridLine = $$.ygridLines.enter().append('g')
            .attr("class", function (d) { return CLASS[_ygridLine] + (d.class ? ' ' + d.class : ''); });
        ygridLine.append('line')
            .style("opacity", 0);
        ygridLine.append('text')
            .attr("text-anchor", "end")
            .attr("transform", config[__axis_rotated] ? "rotate(-90)" : "")
            .attr('dx', config[__axis_rotated] ? 0 : -$$.margin.top)
            .attr('dy', -5)
            .style("opacity", 0);
        // update
        yv = generateCall($$.yv, $$);
        $$.ygridLines.select('line')
          .transition().duration(duration)
            .attr("x1", config[__axis_rotated] ? yv : 0)
            .attr("x2", config[__axis_rotated] ? yv : $$.width)
            .attr("y1", config[__axis_rotated] ? 0 : yv)
            .attr("y2", config[__axis_rotated] ? $$.height : yv)
            .style("opacity", 1);
        $$.ygridLines.select('text')
          .transition().duration(duration)
            .attr("x", config[__axis_rotated] ? 0 : $$.width)
            .attr("y", yv)
            .text(function (d) { return d.text; })
            .style("opacity", 1);
        // exit
        $$.ygridLines.exit().transition().duration(duration)
            .style("opacity", 0)
            .remove();
    }
};
c3_chart_internal_fn.addTransitionForGrid = function (transitions) {
    var $$ = this, config = $$.config, xv = generateCall($$.xv, $$);
    transitions.push($$.xgridLines.select('line').transition()
                     .attr("x1", config[__axis_rotated] ? 0 : xv)
                     .attr("x2", config[__axis_rotated] ? $$.width : xv)
                     .attr("y1", config[__axis_rotated] ? xv : $$.margin.top)
                     .attr("y2", config[__axis_rotated] ? xv : $$.height)
                     .style("opacity", 1));
    transitions.push($$.xgridLines.select('text').transition()
                     .attr("x", config[__axis_rotated] ? $$.width : 0)
                     .attr("y", xv)
                     .text(function (d) { return d.text; })
                     .style("opacity", 1));
};
c3_chart_internal_fn.showXGridFocus = function (selectedData) {
    var $$ = this, config = $$.config,
        dataToShow = selectedData.filter(function (d) { return d && isValue(d.value); });
    if (! config[__tooltip_show]) { return; }
    // Hide when scatter plot exists
    if ($$.hasType('scatter') || $$.hasArcType()) { return; }
    var focusEl = $$.main.selectAll('line.' + CLASS[_xgridFocus]);
    focusEl
        .style("visibility", "visible")
        .data([dataToShow[0]])
        .attr(config[__axis_rotated] ? 'y1' : 'x1', generateCall($$.xx, $$))
        .attr(config[__axis_rotated] ? 'y2' : 'x2', generateCall($$.xx, $$));
    $$.smoothLines(focusEl, 'grid');
};
c3_chart_internal_fn.hideXGridFocus = function () {
    this.main.select('line.' + CLASS[_xgridFocus]).style("visibility", "hidden");
};
c3_chart_internal_fn.updateXgridFocus = function () {
    var $$ = this, config = $$.config;
    $$.main.select('line.' + CLASS[_xgridFocus])
        .attr("x1", config[__axis_rotated] ? 0 : -10)
        .attr("x2", config[__axis_rotated] ? $$.width : -10)
        .attr("y1", config[__axis_rotated] ? -10 : 0)
        .attr("y2", config[__axis_rotated] ? -10 : $$.height);
};
c3_chart_internal_fn.generateGridData = function (type, scale) {
    var $$ = this,
        gridData = [], xDomain, firstYear, lastYear, i,
        tickNum = $$.main.select("." + CLASS[_axisX]).selectAll('.tick').size();
    if (type === 'year') {
        xDomain = $$.getXDomain();
        firstYear = xDomain[0].getFullYear();
        lastYear = xDomain[1].getFullYear();
        for (i = firstYear; i <= lastYear; i++) {
            gridData.push(new Date(i + '-01-01 00:00:00'));
        }
    } else {
        gridData = scale.ticks(10);
        if (gridData.length > tickNum) { // use only int
            gridData = gridData.filter(function (d) { return ("" + d).indexOf('.') < 0; });
        }
    }
    return gridData;
};
c3_chart_internal_fn.getGridFilterToRemove = function (params) {
    return params ? function (line) {
        var found = false;
        [].concat(params).forEach(function (param) {
            if ((('value' in param && line.value === params.value) || ('class' in param && line.class === params.class))) {
                found = true;
            }
        });
        return found;
    } : function () { return true; };
};
c3_chart_internal_fn.removeGridLines = function (params, forX) {
    var $$ = this, config = $$.config,
        toRemove = $$.getGridFilterToRemove(params),
        toShow = function (line) { return !toRemove(line); },
        classLines = forX ? CLASS[_xgridLines] : CLASS[_ygridLines],
        classLine = forX ? CLASS[_xgridLine] : CLASS.ygridLine;
    $$.main.select('.' + classLines).selectAll('.' + classLine).filter(toRemove)
        .transition().duration(config[__transition_duration])
        .style('opacity', 0).remove();
    if (forX) {
        config[__grid_x_lines] = config[__grid_x_lines].filter(toShow);
    } else {
        config[__grid_y_lines] = config[__grid_y_lines].filter(toShow);
    }
};
