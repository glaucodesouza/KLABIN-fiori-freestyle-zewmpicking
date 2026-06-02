sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/f/library"
], function (JSONModel, Controller, fioriLibrary) {
    "use strict";
    var oThis = this;

    var LayoutType = fioriLibrary.LayoutType;
    var oModelPopoverTxt = new sap.ui.model.json.JSONModel({
        FornecimentoItemT: '',
        PedidoT: '',
        ClienteT: '',
        MaterialT: '',
        PesoT: '',
        QtdLotesT: '',
    });

    return Controller.extend("br.com.klabin.zewmpicking2.controller.DetailDetail", {
        onInit: function () {
            var oExitButton = this.getView().byId("exitFullScreenBtn"),
                oEnterButton = this.getView().byId("enterFullScreenBtn");

            this.oRouter = this.getOwnerComponent().getRouter();
            this.oModel = this.getOwnerComponent().getModel();
            this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
            this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onProductMatched, this);

            if (sap.ui.getCore().getModel("MDL_Lotes") !== undefined) {
                var oData = sap.ui.getCore().getModel("MDL_Lotes").getData(),
                    oDataList = sap.ui.getCore().getModel("MDL_NewLotes").getData(),
                    oDataHeader = sap.ui.getCore().getModel("MDL_HeaderDetailDetail").getData(),
                    oModelLotes = new JSONModel(),
                    oModelHeaderDetailDetail = new JSONModel();

                oModelLotes.setData(oDataList);
                this.getView().setModel(oModelLotes, 'MDL_NewLotes');
                oModelLotes.refresh();
                oModelHeaderDetailDetail.setData(oDataHeader);
                this.getView().setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetailDetailSub');
                oModelHeaderDetailDetail.refresh();
                oThis = this;

                var oModelThis = new JSONModel();

                oModelThis.setData(oThis);
                sap.ui.getCore().setModel(oModelThis, 'MDL_ThisDetailsDetails');
                this.bus = this.getOwnerComponent().getEventBus();

                var oDataHeaderT = sap.ui.getCore().getModel("MDL_PopoverTxt");

                oModelPopoverTxt.setData(oDataHeaderT);
                this.getView().setModel(oModelPopoverTxt, 'MDL_PopoverTxt');
                oModelPopoverTxt.refresh();
            }
        },
        onSetModelChange: function (oEvent) {
        },
        handleItemPress: function (oEvent) {
        },
        handleFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
            this.navigateToView(sNextLayout, "detailDetail");
        },
        handleExitFullScreen: function () {
            this.bFocusFullScreenButton = true;
            var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
            this.navigateToView(sNextLayout, "detail");
        },
        handleClose: function () {
            this.bus = this.getOwnerComponent().getEventBus();
            this.bus.publish("flexible", "setDetailPage");
            var oModelControleTela = new sap.ui.model.json.JSONModel({
                screen: '',
            });
            oModelControleTela.oData.screen = 'DetailDetailDetail';
            oModelControleTela.setData(oModelControleTela.oData);
            sap.ui.getCore().setModel(oModelControleTela, 'MDL_TwoScreen');
        },
        navigateToView: function (sNextLayout, sNextView) {
            this.oRouter.navTo("detail", { layout: LayoutType.OneColumn, category: 'DetailDetail', one: '2', payload: '23', placaCC: '4' });
        },
        _onProductMatched: function (oEvent) {
            this._product = oEvent.getParameter("arguments").product || this._product || "0";
            this._category = oEvent.getParameter("arguments").category || this._category;
        },
        onbeforeRebindTable: function (oEvent) {
        },
        onAfterRendering: function (oEvent) {
        }
    });
});
