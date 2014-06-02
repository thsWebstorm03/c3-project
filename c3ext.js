﻿var c3ext = {};
c3ext.generate = function (options) {

    if (options.zoom2 != null) {
        zoom2_reducers = options.zoom2.reducers || {};
        zoom2_enabled = options.zoom2.enabled;
        _zoom2_factor = options.zoom2.factor || 1;
        _zoom2_maxItems = options.zoom2.maxItems;
    }

    if (!zoom2_enabled) {
        return c3.generate(options);
    }


    var originalData = Q.copy(options.data);
    var zoom2_reducers;
    var zoom2_enabled;
    var _zoom2_maxItems;

    if (_zoom2_maxItems == null) {
        var el = d3.select(options.bindto)[0][0];
        if (el != null) {
            var availWidth = el.clientWidth;

            var pointSize = 20;
            _zoom2_maxItems = Math.ceil(availWidth / pointSize);
        }
        if (_zoom2_maxItems == null || _zoom2_maxItems < 10) {
            _zoom2_maxItems = 10;
        }
    }

    function onZoomChanged(e) {
        refresh();
    }

    var zoom2 = ZoomBehavior.create({ changed: onZoomChanged });

    zoom2.enhance = function () {
        _zoom2_maxItems *= 2;
        var totalItems = zoom2.getZoom().totalItems;
        if (_zoom2_maxItems > totalItems)
            _zoom2_maxItems = totalItems;
        refresh();
    }
    zoom2.dehance = function () {
        _zoom2_maxItems = Math.ceil(_zoom2_maxItems / 2) + 1;
        refresh();
    }

    zoom2.maxItems = function(){return _zoom2_maxItems;};
    function zoomAndReduceData(list, zoomRange, func, maxItems) {
        //var maxItems = 10;//Math.ceil(10 * zoomFactor);
        var list2 = list.slice(zoomRange[0], zoomRange[1]);
        var chunkSize = 1;
        var list3 = list2;
        if (list3.length > maxItems) {
            var chunkSize = Math.ceil(list2.length / maxItems);
            list3 = list3.splitIntoChunksOf(chunkSize).select(func);
        }
        //console.log("x" + getCurrentZoomLevel() + ", maxItems=" + maxItems + " chunkSize=" + chunkSize + " totalBefore=" + list2.length + ", totalAfter=" + list3.length);
        return list3;
    }

    var getDataForZoom = function (data) {
        if (data.columns == null || data.columns.length == 0)
            return;

        var zoomInfo = zoom2.getZoom();
        if (zoomInfo.totalItems != data.columns[0].length - 1) {
            zoom2.setOptions({ totalItems: data.columns[0].length - 1 });
            zoomInfo = zoom2.getZoom();
        }
        data.columns = originalData.columns.select(function (column) {
            var name = column[0];
            var reducer = zoom2_reducers[name] || "t=>t[0]".toLambda(); //by default take the first

            var values = column.slice(1);
            var newValues = zoomAndReduceData(values, zoomInfo.currentZoom, reducer, _zoom2_maxItems);
            return [name].concat(newValues);
        });
        return data;
    };

    getDataForZoom(options.data);
    var chart = c3.generate(options);
    var _chart_load_org = chart.load.bind(chart);
    chart.zoom2 = zoom2;
    chart.load = function (data) {
        if (data.unload) {
            unload(data.unload);
            delete data.unload;
        }
        Q.copy(data, originalData);
        refresh();
    }
    chart.unload = function (names) {
        unload(names);
        refresh();
    }

    function unload(names) {
        originalData.columns.removeAll(function (t) { names.contains(t); });
    }


    function refresh() {
        var data = Q.copy(originalData)
        getDataForZoom(data);
        _chart_load_org(data);
    };


    return chart;
}


var ZoomBehavior = {};
ZoomBehavior.create = function (options) {
    var zoom = { __type: "ZoomBehavior" };

    var _zoom2_factor;
    var _left;
    var totalItems;
    var currentZoom;
    var _zoomChanged = options.changed || function () { };

    zoom.setOptions = function (options) {
        if (options == null)
            options = {};
        _zoom2_factor = options.factor || 1;
        _left = 0;
        totalItems = options.totalItems || 0;
        currentZoom = [0, totalItems];
        _zoomChanged = options.changed || _zoomChanged;
    }

    zoom.setOptions(options);


    function verifyZoom(newZoom) {
        //newZoom.sort();
        if (newZoom[1] > totalItems) {
            var diff = newZoom[1] - totalItems;
            newZoom[0] -= diff;
            newZoom[1] -= diff;
        }
        if (newZoom[0] < 0) {
            var diff = newZoom[0] * -1;
            newZoom[0] += diff;
            newZoom[1] += diff;
        }
        if (newZoom[1] > totalItems)
            newZoom[1] = totalItems;
        if (newZoom[0] < 0)
            newZoom[0] = 0;
    }

    function zoomAndPan(zoomFactor, left) {
        var itemsToShow = Math.ceil(totalItems / zoomFactor);
        var newZoom = [left, left + itemsToShow];
        verifyZoom(newZoom);
        currentZoom = newZoom;
        onZoomChanged();
    }

    function onZoomChanged() {
        if (_zoomChanged != null)
            _zoomChanged(zoom.getZoom());
    }
    function applyZoomAndPan() {
        zoomAndPan(_zoom2_factor, _left);
    }
    function getItemsToShow() {
        var itemsToShow = Math.ceil(totalItems / _zoom2_factor);
        return itemsToShow;
    }


    zoom.getZoom = function () {
        return { totalItems: totalItems, currentZoom: currentZoom.toArray() };
    }

    zoom.factor = function (factor, skipDraw) {
        if (arguments.length == 0)
            return _zoom2_factor;
        _zoom2_factor = factor;
        if (_zoom2_factor < 1)
            _zoom2_factor = 1;
        if(skipDraw)
            return;
        applyZoomAndPan();
    }
    zoom.left = function (left, skipDraw) {
        if (arguments.length == 0)
            return _left;
        _left = left;
        if (_left < 0)
            _left = 0;
        var pageSize = getItemsToShow();
        //_left += pageSize;
        if (_left + pageSize > totalItems)
            _left = totalItems - pageSize;
        console.log({left:_left, pageSize:pageSize});
        if(skipDraw)
            return;
        applyZoomAndPan();
    }

    zoom.zoomAndPanByRatio = function (zoomRatio, panRatio) {

        var pageSize = getItemsToShow();
        var leftOffset = Math.round(pageSize*panRatio);
        var mouseLeft = _left+leftOffset;
        zoom.factor(zoom.factor()*zoomRatio, true);

        var finalLeft = mouseLeft;
        if(zoomRatio!=1){
            var pageSize2 = getItemsToShow();
            var leftOffset2 = Math.round(pageSize2*panRatio);
            var finalLeft = mouseLeft-leftOffset2;
        }
        zoom.left(finalLeft, true);
        applyZoomAndPan();
    }

    zoom.zoomIn = function () {
        zoom.zoomAndPanByRatio(2,0);
    }

    zoom.zoomOut = function () {
        zoom.zoomAndPanByRatio(0.5, 0);
    }

    zoom.panLeft = function () {
        zoom.zoomAndPanByRatio(1, -1);
    }
    zoom.panRight = function () {
        zoom.zoomAndPanByRatio(1, 1);
    }

    zoom.reset = function () {
        _left = 0;
        _zoom2_factor = 1;
        applyZoomAndPan();
    }
    return zoom;

}