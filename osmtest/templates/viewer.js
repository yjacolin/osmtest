Ext.onReady(function() {
    // Ext global settings
    Ext.BLANK_IMAGE_URL = "${request.static_url('osmtest:static/lib/cgxp/ext/Ext/resources/images/default/s.gif')}";
    Ext.QuickTips.init();

    // OpenLayers global settings
    OpenLayers.Number.thousandsSeparator = ' ';
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 5;
    OpenLayers.DOTS_PER_INCH = 72;
    OpenLayers.ProxyHost = "${request.route_url('ogcproxy')}?url=";
    OpenLayers.ImgPath = "${request.static_url('osmtest:static/lib/cgxp/core/src/theme/img/ol/')}";
    OpenLayers.Lang.setCode("${lang}");

    // GeoExt global settings
    GeoExt.Lang.set("${lang}");

    <% json_extent = user.role.json_extent if user else None %>
    % if json_extent:
    var INITIAL_EXTENT = ${json_extent};
    % else:
    var INITIAL_EXTENT = [420000, 30000, 900000, 350000];
    % endif
    var RESTRICTED_EXTENT = [420000, 30000, 900000, 350000];

    // Themes definitions
    var THEMES = {
        "local": ${themes | n}
    % if external_themes:
        , "external": ${external_themes | n}
    % endif
    };

    // Server errors (if any)
    var serverError = ${serverError | n};

    // Used to transmit event throw the application
    var EVENTS = new Ext.util.Observable();

    var WMTS_OPTIONS = {
    % if not tilecache_url:
        url: "${request.route_url('tilecache', path='')}",
    % else:
        url: '${tilecache_url}',
    % endif
        displayInLayerSwitcher: false,
        requestEncoding: 'REST',
        buffer: 0,
        transitionEffect: "resize",
        visibility: false,
        style: 'default',
        dimensions: ['TIME'],
        params: {
            'time': '2011'
        },
        matrixSet: 'swissgrid',
        maxExtent: new OpenLayers.Bounds(420000, 30000, 900000, 350000),
        projection: new OpenLayers.Projection("EPSG:3857"),
        units: "m",
        formatSuffix: 'png',
        serverResolutions: [4000,3750,3500,3250,3000,2750,2500,2250,2000,1750,1500,1250,1000,750,650,500,250,100,50,20,10,5,2.5,2,1.5,1,0.5,0.25,0.1,0.05],
        getMatrix: function() {
            return { identifier: OpenLayers.Util.indexOf(this.serverResolutions, this.map.getResolution()) };
        }
    };

    app = new gxp.Viewer({
        portalConfig: {
            layout: "border",
            // by configuring items here, we don't need to configure portalItems
            // and save a wrapping container
            items: [{
                region: "north",
                contentEl: 'header-out'
            },
            {
                region: 'center',
                layout: 'border',
                id: 'center',
                tbar: [],
                bbar: [],
                items: [
                    "app-map"
                ]
            },
            {
                id: "featuregrid-container",
                xtype: "panel",
                layout: "fit",
                region: "south",
                height: 160,
                split: true,
                collapseMode: "mini",
                hidden: true,
                bodyStyle: 'background-color: transparent;'
            },
            {
                layout: "accordion",
                id: "left-panel",
                region: "west",
                width: 300,
                minWidth: 300,
                split: true,
                collapseMode: "mini",
                border: false,
                defaults: {width: 300},
                items: [{
                    xtype: "panel",
                    title: OpenLayers.i18n("layertree"),
                    id: 'layerpanel',
                    layout: "vbox",
                    layoutConfig: {
                        align: "stretch"
                    }
                }]
            }]
        },

        // configuration of all tool plugins for this application
        tools: [
        {
            ptype: "cgxp_disclaimer",
            outputTarget: "map"
        },
        {
            ptype: "cgxp_themeselector",
            outputTarget: "layerpanel",
            layerTreeId: "layertree",
            themes: THEMES,
            outputConfig: {
                layout: "fit",
                style: "padding: 3px 0 3px 3px;"
            }
        },
        {
            ptype: "cgxp_layertree",
            id: "layertree",
            outputConfig: {
                header: false,
                flex: 1,
                layout: "fit",
                autoScroll: true,
                themes: THEMES,
                % if permalink_themes:
                  defaultThemes: ${permalink_themes | n},
                % else:
                  defaultThemes: ["lieu_interet_thm"],
                % endif
                wmsURL: "${request.route_url('mapserverproxy', path='')}"
            },
            outputTarget: "layerpanel"
        },
    % if user:
        {
            ptype: "cgxp_querier",
            outputTarget: "left-panel",
            events: EVENTS,
            mapserverproxyURL: "${request.route_url('mapserverproxy', path='')}",
            // don't work with actual version of mapserver, the proxy will limit to 200
            // it is intended to be reactivated this once mapserver is fixed
            //maxFeatures: 200,
            srsName: 'EPSG:3857',
            featureTypes: ["query_layer"],
        },
    % endif
        {
            ptype: "cgxp_print",
            legendPanelId: "legendPanel",
            featureProvider: "featureGrid",
            outputTarget: "left-panel",
            printURL: "${request.route_url('printproxy', path='')}",
            mapserverURL: "${request.route_url('mapserverproxy', path='')}",
            options: {
                labelAlign: 'top',
                defaults: {
                    anchor:'100%'
                },
                autoFit: true
            }
        },
        {
            ptype: "cgxp_featuregrid",
            id: "featureGrid",
            csvURL: "${request.route_url('csvecho')}",
            maxFeatures: 200,
            outputTarget: "featuregrid-container",
            events: EVENTS
        },
        {
            ptype: "cgxp_mapopacityslider",
            defaultBaseLayerRef: "${functionality['default_basemap'][0] | n}"
        },
        {
            ptype: "gxp_zoomtoextent",
            actionTarget: "center.tbar",
            closest: true,
            extent: INITIAL_EXTENT
        },
        {
            ptype: "cgxp_zoom",
            actionTarget: "center.tbar",
            toggleGroup: "maptools"
        },
        {
            ptype: "gxp_navigationhistory",
            actionTarget: "center.tbar"
        },
        {
            ptype: "cgxp_permalink",
            actionTarget: "center.tbar"
        },
        {
            ptype: "cgxp_measure",
            actionTarget: "center.tbar",
            toggleGroup: "maptools"
        },
        {
            ptype: "cgxp_wmsgetfeatureinfo",
            actionTarget: "center.tbar",
            toggleGroup: "maptools",
            events: EVENTS
        },
        {
            ptype: "cgxp_fulltextsearch",
            url: "${request.route_url('fulltextsearch', path='')}",
            layerTreeId: "layertree",
            actionTarget: "center.tbar"
        },
        {
            ptype: "cgxp_contextualdata",
            actionTarget: "center.tbar",
            toggleGroup: "maptools"
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '->'
        },
        {
            ptype: "cgxp_redlining",
            toggleGroup: "maptools",
            actionTarget: "center.tbar",
            layerManagerUrl: "${request.static_url('osmtest:static/lib/cgxp/sandbox/LayerManager/ux/')}"
        },
        {
            ptype: "cgxp_legend",
            id: "legendPanel",
            toggleGroup: "maptools",
            actionTarget: "center.tbar"
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '-'
        },
        {
            ptype: "cgxp_login",
            actionTarget: "center.tbar",
            toggleGroup: "maptools",
    % if user:
            username: "${user.username}",
    % endif
            loginURL: "${request.route_url('login', path='')}",
            logoutURL: "${request.route_url('logout', path='')}"
        },
        {
            ptype: "cgxp_menushortcut",
            actionTarget: "center.tbar",
            type: '-'
        },
        {
            ptype: "cgxp_help",
            url: "#help-url",
            actionTarget: "center.tbar"
        }
        ],

        // layer sources
        sources: {
            "olsource": {
                ptype: "gxp_olsource"
            }
        },

        // map and layers
        map: {
            id: "app-map", // id needed to reference map in portalConfig above
            xtype: 'cgxp_mappanel',
            extent: INITIAL_EXTENT,
            maxExtent: RESTRICTED_EXTENT,
            restrictedExtent: RESTRICTED_EXTENT,
            stateId: "map",
            projection: new OpenLayers.Projection("EPSG:3857"),
            units: "m",
            resolutions: [4000,2000,1000,500,250,100,50,20,10,5,2.5,1,0.5,0.25,0.1,0.05],
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.KeyboardDefaults(),
                new OpenLayers.Control.PanZoomBar({panIcons: false}),
                new OpenLayers.Control.ArgParser(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine({
                    geodesic: true,
                    bottomInUnits: false,
                    bottomOutUnits: false
                }),
                new OpenLayers.Control.MousePosition({numDigits: 0}),
                // Static image version
                /*
                new OpenLayers.Control.OverviewMap({
                    size: new OpenLayers.Size(200, 100),
                    layers: [new OpenLayers.Layer.Image(
                        "Overview Map",
                        "${request.static_url('osmtest:static/images/overviewmap.png')}",
                        OpenLayers.Bounds.fromArray([420000, 30000, 900000, 350000]),
                        new OpenLayers.Size(200, 100),
                        {isBaseLayer: true}
                    )],
                    mapOptions: {
                        theme: null,
                        projection: new OpenLayers.Projection("EPSG:3857"),
                        restrictedExtent: OpenLayers.Bounds.fromArray([420000, 30000, 900000, 350000]),
                        units: "m",
                        numZoomLevels: 1
                    }
                })*/
                // OSM version
                new OpenLayers.Control.OverviewMap({
                    size: new OpenLayers.Size(200, 100),
                    mapOptions: {
                        theme: null
                    },
                    minRatio: 64,
                    maxRatio: 64,
                    layers: [new OpenLayers.Layer.OSM("OSM", [
                            'http://a.tile.openstreetmap.org/${"${z}/${x}/${y}"}.png',
                            'http://b.tile.openstreetmap.org/${"${z}/${x}/${y}"}.png',
                            'http://c.tile.openstreetmap.org/${"${z}/${x}/${y}"}.png'
                        ], {
                            transitionEffect: 'resize',
                            attribution: [
                                "(c) <a href='http://openstreetmap.org/'>OSM</a>",
                                "<a href='http://creativecommons.org/licenses/by-sa/2.0/'>by-sa</a>"
                            ].join(' ')
                        }
                    )]
                })
            ],
            layers: [{
                source: "olsource",
                type: "OpenLayers.Layer.WMTS",
                args: [Ext.applyIf({
                    name: OpenLayers.i18n('ortho'),
                    mapserverLayers: 'ortho',
                    ref: 'ortho',
                    layer: 'ortho',
                    formatSuffix: 'jpeg',
                    opacity: 0
                }, WMTS_OPTIONS)]
            },
            {
                source: "olsource",
                type: "OpenLayers.Layer.WMTS",
                group: 'background',
                args: [Ext.applyIf({
                    name: OpenLayers.i18n('plan'),
                    mapserverLayers: 'plan',
                    ref: 'plan',
                    layer: 'plan',
                    group: 'background'
                }, WMTS_OPTIONS)]
            },
            {
                source: "olsource",
                type: "OpenLayers.Layer",
                group: 'background',
                args: [OpenLayers.i18n('blank'), {
                    displayInLayerSwitcher: false,
                    ref: 'blank',
                    group: 'background'
                }]
            }],
            items: []
        }
    });

    app.on('ready', function() {
        // remove loading message
        Ext.get('loading').remove();
        Ext.fly('loading-mask').fadeOut({
            remove: true
        });

        if (serverError.length > 0) {
            cgxp.tools.openWindow({
                html: serverError.join('<br />')
            },OpenLayers.i18n("Error notice"),600, 500);
        }
    }, app);
});
