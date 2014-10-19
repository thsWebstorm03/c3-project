c3_chart_fn.zoom = function (domain) {
    var $$ = this.internal;
    $$.brush.extent(domain);
    $$.redraw({withUpdateXDomain: true});
};
c3_chart_fn.zoom.enable = function (enabled) {
    var $$ = this.internal;
    $$.config.zoom_enabled = enabled;
    $$.updateAndRedraw();
};
c3_chart_fn.unzoom = function () {
    var $$ = this.internal;
    $$.brush.clear().update();
    $$.redraw({withUpdateXDomain: true});
};
