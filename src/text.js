c3_chart_internal_fn.initText = function () {
    var $$ = this, CLASS = $$.CLASS;
    $$.main.select('.' + CLASS[_chart]).append("g")
        .attr("class", CLASS[_chartTexts]);
    $$.mainText = $$.d3.selectAll([]);
};
c3_chart_internal_fn.updateTargetsForText = function (targets) {
    var $$ = this, CLASS = $$.CLASS, mainTextUpdate, mainTextEnter,
        classChartText = $$.classChartText.bind($$),
        classTexts = $$.classTexts.bind($$);
    mainTextUpdate = $$.main.select('.' + CLASS[_chartTexts]).selectAll('.' + CLASS[_chartText])
        .data(targets)
        .attr('class', classChartText);
    mainTextEnter = mainTextUpdate.enter().append('g')
        .attr('class', classChartText)
        .style('opacity', 0)
        .style("pointer-events", "none");
    mainTextEnter.append('g')
        .attr('class', classTexts);
};
c3_chart_internal_fn.redrawText = function (durationForExit) {
    var $$ = this, config = $$.config, CLASS = $$.CLASS;
    $$.mainText = $$.main.selectAll('.' + CLASS[_texts]).selectAll('.' + CLASS[_text])
        .data(generateCall($$.barOrLineData, $$));
    $$.mainText.enter().append('text')
        .attr("class", generateCall($$.classText, $$))
        .attr('text-anchor', function (d) { return config[__axis_rotated] ? (d.value < 0 ? 'end' : 'start') : 'middle'; })
        .style("stroke", 'none')
        .style("fill", function (d) { return $$.color(d); })
        .style("fill-opacity", 0);
    $$.mainText
        .text(function (d) { return $$.formatByAxisId($$.getAxisId(d.id))(d.value, d.id); });
    $$.mainText.exit()
        .transition().duration(durationForExit)
        .style('fill-opacity', 0)
        .remove();
};
c3_chart_internal_fn.addTransitionForText = function (transitions, xForText, yForText, forFlow) {
    var $$ = this;
    transitions.push($$.mainText.transition()
                     .attr('x', xForText)
                     .attr('y', yForText)
                     .style("fill", $$.color)
                     .style("fill-opacity", forFlow ? 0 : generateCall($$.opacityForText, $$)));
};
c3_chart_internal_fn.getTextRect = function (text, cls) {
    var rect;
    this.d3.select('body').selectAll('.dummy')
        .data([text])
      .enter().append('text')
        .classed(cls ? cls : "", true)
        .text(text)
      .each(function () { rect = this.getBoundingClientRect(); })
        .remove();
    return rect;
};
c3_chart_internal_fn.generateXYForText = function (barIndices, forX) {
    var $$ = this,
        getPoints = $$.generateGetBarPoints(barIndices, false),
        getter = forX ? $$.getXForText : $$.getYForText;
    return function (d, i) {
        return getter.call($$, getPoints(d, i), d, this);
    };
};
c3_chart_internal_fn.getXForText = function (points, d, textElement) {
    var $$ = this,
        box = textElement.getBoundingClientRect(), xPos, padding;
    if ($$.config[__axis_rotated]) {
        padding = $$.isBarType(d) ? 4 : 6;
        xPos = points[2][1] + padding * (d.value < 0 ? -1 : 1);
    } else {
        xPos = $$.hasType('bar') ? (points[2][0] + points[0][0]) / 2 : points[0][0];
    }
    return xPos > $$.width ? $$.width - box.width : xPos;
};
c3_chart_internal_fn.getYForText = function (points, d, textElement) {
    var $$ = this,
        box = textElement.getBoundingClientRect(), yPos;
    if ($$.config[__axis_rotated]) {
        yPos = (points[0][0] + points[2][0] + box.height * 0.6) / 2;
    } else {
        yPos = points[2][1] + (d.value < 0 ? box.height : $$.isBarType(d) ? -3 : -6);
    }
    return yPos < box.height ? box.height : yPos;
};
