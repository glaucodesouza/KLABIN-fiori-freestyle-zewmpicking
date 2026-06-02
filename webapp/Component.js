/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "br/com/klabin/zewmpicking2/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
    "sap/f/FlexibleColumnLayoutSemanticHelper"
],
    function (UIComponent, Device, models, JSONModel, library, FlexibleColumnLayoutSemanticHelper) {
        "use strict";
        var LayoutType = library.LayoutType;

        return UIComponent.extend("br.com.klabin.zewmpicking2.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            },
            getHelper: function () {
                
                var oFCL = this.getRootControl().byId("fcl"),
                    oParams = new URLSearchParams(window.location.search),
                    oSettings = {
                        defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
                        defaultThreeColumnLayoutType: LayoutType.ThreeColumnsEndExpanded,
                        initialColumnsCount: oParams.get("initial"),
                        maxColumnsCount: oParams.get("max")
                    };
                window.location.reload();
                return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
            }
        });
    }
);