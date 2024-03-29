<%doc>
This file defines map config for both the Simple and the
Extended APIs.
</%doc>

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
            serverResolutions: [4000,3750,3500,3250,3000,2750,2500,2250,2000,1750,
                                1500,1250,1000,750,650,500,250,100,50,20,10,5,2.5,
                                2,1.5,1,0.5,0.25,0.1,0.05],
            getMatrix: function() {
                return {
                    identifier: OpenLayers.Util.indexOf(
                                    this.serverResolutions,
                                    this.map.getResolution())
                };
            }
        };

        var INITIAL_EXTENT = [515000, 180000, 580000, 230000];
        var RESTRICTED_EXTENT = [515000, 180000, 580000, 230000];

        var mapConfig = {
            xtype: 'cgxp_mappanel',
            extent: INITIAL_EXTENT,
            maxExtent: RESTRICTED_EXTENT,
            restrictedExtent: RESTRICTED_EXTENT,
            stateId: "map",
            projection: new OpenLayers.Projection("EPSG:3857"),
            units: "m",
            resolutions: [4000,2000,1000,500,250,100,50,20,10,5,
                          2.5,1,0.5,0.25,0.1,0.05],
            controls: [
                new OpenLayers.Control.Navigation(),
                new OpenLayers.Control.PanZoomBar({panIcons: false}),
                new OpenLayers.Control.ArgParser(),
                new OpenLayers.Control.Attribution(),
                new OpenLayers.Control.ScaleLine({
                    geodesic: true,
                    bottomInUnits: false,
                    bottomOutUnits: false
                }),
                new OpenLayers.Control.LayerSwitcher(),
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
                }),
                */
                new OpenLayers.Control.MousePosition({numDigits: 0})
            ],
            layers: [{
                source: "olsource",
                type: "OpenLayers.Layer.WMTS",
                args: [OpenLayers.Util.applyDefaults({
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
                args: [OpenLayers.Util.applyDefaults({
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
        };
