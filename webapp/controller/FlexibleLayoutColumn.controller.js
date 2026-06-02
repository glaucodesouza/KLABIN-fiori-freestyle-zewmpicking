sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/f/FlexibleColumnLayout",
	"sap/m/SplitContainer",
	"sap/ui/core/mvc/XMLView",
	"sap/f/library",
], function (JSONModel, Controller, FlexibleColumnLayout, SplitContainer, XMLView, fioriLibrary) {
	"use strict";

	var LayoutType = fioriLibrary.LayoutType;

	return Controller.extend("br.com.klabin.zewmpicking2.controller.FlexibleLayoutColumn", {
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.attachRouteMatched(this.onRouteMatched, this);
			this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
			this.bus = this.getOwnerComponent().getEventBus();
			this.bus.subscribe("flexible", "setDetailPage", this.setDetailPage, this);
			this.bus.subscribe("flexible", "setDetailDetailPage", this.setDetailDetailPage, this);
			this.oFlexibleColumnLayout = this.byId("fcl");
		},

		onBeforeRouteMatched: function (oEvent) {

			var oModel = this.getOwnerComponent().getModel(),
				sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Optional UX improvement:
			// The app may want to hide the old view early (before the routing hides it)
			// to prevent the view being temporarily shown aside the next view (during the transition to the next route)
			// if the views for both routes do not match semantically
			if (this.currentRouteName === "list") { // last viewed route was list
				var oListView = this.oRouter.getView("br.com.klabin.zewmpicking2.view.Main");
				this.getView().byId("fcl").removeBeginColumnPage(oListView);
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},

		_updateLayout: function (sLayout) {
			var oModel = this.getOwnerComponent().getModel();

			// If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
			if (!sLayout) {
				var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
				sLayout = oNextUIState.layout;
			}

			// Update the layout of the FlexibleColumnLayout
			if (sLayout) {
				oModel.setProperty("/layout", sLayout);
			}
		},

		onRouteMatched: function (oEvent) {
			var sRouteName = oEvent.getParameter("name"),
				oArguments = oEvent.getParameter("arguments");

			// Save the current route name
			this.currentRouteName = sRouteName;
			this.currentProduct = oArguments.product;
			this.currentSupplier = oArguments.supplier;
			this.currentCategory = oArguments.category;
		},

		onStateChanged: function (oEvent) {
			var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
				sLayout = oEvent.getParameter("layout");

			// Replace the URL with the new layout if a navigation arrow was used
			if (bIsNavigationArrow) {
				this.oRouter.navTo(this.currentRouteName,
					{ layout: sLayout, category: this.currentCategory, product: this.currentProduct, supplier: this.currentSupplier }, true);
			}
		},

		// Update the close/fullscreen buttons visibility
		_updateUIElements: function () {
			var oModel = this.getOwnerComponent().getModel(),
				oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
		},

		onExit: function () {
			this.oRouter.detachRouteMatched(this.onRouteMatched, this);
			this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
		},
		setDetailPage: function (oEvent) {
			sap.ui.controller("br.com.klabin.zewmpicking2.controller.Main").onRouterDetailAfterExitButton(oEvent);
		},
		setDetailDetailPage: function (oEvent) {
			this._loadView({
				id: "midView",
				viewName: "br.com.klabin.zewmpicking2.view.DetailDetail"
			}).then(function (detailDetailView) {
				var Model = sap.ui.getCore().getModel('MDL_TwoScreen');
				var oModelControleTela = new sap.ui.model.json.JSONModel({
					screen: '',
				});
				sap.ui.controller("br.com.klabin.zewmpicking2.controller.Details").onSetModelChange(oEvent);
				this.oFlexibleColumnLayout.addMidColumnPage(detailDetailView);
				this.oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsBeginExpanded);
			}.bind(this));
		},
		_loadView: function (options) {
			var mViews = this._mViews = this._mViews || Object.create(null);
			if (!mViews[options.id]) {
				mViews[options.id] = this.getOwnerComponent().runAsOwner(function () {
					return XMLView.create(options);
				});
			}
			return mViews[options.id];
		}
	});
});
