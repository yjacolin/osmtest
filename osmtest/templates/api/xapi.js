% if debug:
    <%!
    from jstools.merge import Merger
    %>
    <%
    jsbuild_cfg = request.registry.settings.get('jsbuild_cfg')
    jsbuild_root_dir = request.registry.settings.get('jsbuild_root_dir')
    %>
    % for script in Merger.from_fn(jsbuild_cfg.split(), root_dir=jsbuild_root_dir).list_run(['xapi.js', 'lang-%s.js' % lang]):
document.write('<script type="text/javascript" src="'
        + "${request.static_url(script.replace('/', ':', 1))}" + '"></script>');
    % endfor

document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/ext/Ext/resources/css/ext-all.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/ext/Ext/resources/css/xtheme-gray.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/openlayers/theme/default/style.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/geoext/resources/css/gxtheme-gray.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/geoext.ux/ux/Measure/resources/css/measure.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/gxp/src/theme/all.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/lib/cgxp/core/src/theme/all.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/css/proj-map.css')}" + '" />');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/css/proj-widgets.css')}" + '" />');
% else:
document.write('<scr' + 'ipt type="text/javascript" src="'
        + "${request.static_url('osmtest:static/build/xapi.js')}" + '"></scr' + 'ipt>');
document.write('<scr' + 'ipt type="text/javascript" src="'
        + "${request.static_url('osmtest:static/build/lang-%s.js' % lang)}" + '"></scr' + 'ipt>');
document.write('<link rel="stylesheet" type="text/css" href="'
        + "${request.static_url('osmtest:static/build/xapi.css')}" + '" />');
% endif

osmtest = {};
osmtest.Map = function(config) {
    if (!this.initMap) {

        /*
         * Initialize the API.
         * - Set globals
         * - Create child class
         */

        Ext.QuickTips.init();
        Ext.BLANK_IMAGE_URL = "${request.static_url('osmtest:static/lib/cgxp/ext/Ext/resources/images/default/s.gif')}";
        OpenLayers.Number.thousandsSeparator = ' ';
        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;
        OpenLayers.DOTS_PER_INCH = 72;
        OpenLayers.ImgPath = "${request.static_url('osmtest:static/lib/cgxp/core/src/theme/img/ol/')}";
        OpenLayers.Lang.setCode("${lang}");
        GeoExt.Lang.set("${lang}");

        OpenLayers.inherit(osmtest.Map, cgxp.api.Map);

        osmtest.Map.prototype.initMap = function() {
            <%include file="mapconfig.js"/>
            var config = this.adaptConfigForViewer(mapConfig);
            <%include file="viewer.js"/>
            viewer.on('ready', this.onViewerReady.createDelegate(this, [viewer]));
        };

        return new osmtest.Map(config);
    }

    this.wmsURL = "${request.route_url('mapserverproxy')}";
    this.queryableLayers = ${queryable_layers|n};
    return cgxp.api.Map.call(this, config);
};
