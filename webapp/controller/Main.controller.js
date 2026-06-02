sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/odata/ODataModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/ui/comp/smartvariants/PersonalizableInfo',
    'sap/ui/model/json/JSONModel',
    'sap/m/Label',
    "sap/f/library",
    "sap/ui/table/RowAction",
    "sap/ui/table/RowActionItem",
],
    function (Controller, ODataModel, Filter, FilterOperator, PersonalizableInfo, JSONModel, Label, fioriLibrary,RowAction,RowActionItem) {
        "use strict";
        var oModelTicketsGlobal = { myList: [{}] },
            oModelTransporteGlobal = { myList: [{}] };
        let aSelectedCriteria = [];
        var LayoutType = fioriLibrary.LayoutType;

        return Controller.extend("br.com.klabin.zewmpicking2.controller.Main", {
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();

                var oModelDataTransitMain = new sap.ui.model.json.JSONModel({
                    router: '',
                });
                oModelDataTransitMain.oData.router = this.oRouter;
                oModelDataTransitMain.setData(oModelDataTransitMain.oData);
                sap.ui.getCore().setModel(oModelDataTransitMain, 'MDL_RouterMainController');

                this._bDescendingSort = false;
                this.applyData = this.applyData.bind(this);
                this.fetchData = this.fetchData.bind(this);
                this.getFiltersWithValues = this.getFiltersWithValues.bind(this);

                this.oSmartVariantManagement = this.getView().byId("svm");
                this.oExpandedLabel = this.getView().byId("expandedLabel");
                this.oSnappedLabel = this.getView().byId("snappedLabel");
                this.oFilterBar = this.getView().byId("filterbar");
            },

            onListItemPress: function (oEvent) {
                var sCategory = "Picking",
                    bPhone = this.getOwnerComponent().getModel().getProperty(),
                    aProducts = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
                var oProduct = aProducts;
                var productPath = oEvent.getSource().getSelectedItem().getBindingContext().getPath(),
                    product = productPath.split("/").slice(-1).pop();

                var oModelDataTransitMain = new sap.ui.model.json.JSONModel({
                    layout: '',
                    category: '',
                    one: '',
                    payload: '',
                    placaCC: '',
                    vstel: '',
                    bukrs: '',
                });
                oModelDataTransitMain.oData.vstel = oProduct.vstel;
                oModelDataTransitMain.oData.layout = LayoutType.OneColumn;
                oModelDataTransitMain.oData.category = sCategory;
                oModelDataTransitMain.oData.one = product
                oModelDataTransitMain.oData.payload = oProduct.payload;
                oModelDataTransitMain.oData.placaCC = oProduct.placa02;
                oModelDataTransitMain.oData.bukrs = oProduct.bukrs;
                if (oProduct.StatusCarregamento === "") {
                    oProduct.StatusCarregamento = 'Inicial';
                }
                if (oProduct.codStatus === '0') {
                    oProduct.codStatus = '1';
                    oModelDataTransitMain.oData.codStatus = '1';
                } else {
                    oModelDataTransitMain.oData.codStatus = oProduct.codStatus;
                }
                oModelDataTransitMain.setData(oModelDataTransitMain.oData);
                sap.ui.getCore().setModel(oModelDataTransitMain, 'ModelDataTransitMain');
                this.oRouter.navTo("detail", { layout: LayoutType.OneColumn, category: sCategory, one: product, payload: oProduct.payload, placaCC: oProduct.placa02, status: oProduct.StatusCarregamento, vstel: oProduct.vstel, ticket: oProduct.ticket, bukrs: oProduct.bukrs, cstatus: oProduct.codStatus });

            },
            
            onRouterDetailAfterExitButton: function (oEvent) {
                var oModel = sap.ui.getCore().getModel('ModelDataTransitMain'),
                    oRouter = sap.ui.getCore().getModel('MDL_RouterMainController');
                oRouter.oData.router.navTo("detail", { layout: oModel.oData.layout, category: oModel.oData.category, one: oModel.oData.one, payload: oModel.oData.payload, placaCC: oModel.oData.placaCC, status: oProduct.StatusCarregamento, codStatus: oProduct.codStatus });
            },
            onExit: function () {
                this.oModel = null;
                this.oSmartVariantManagement = null;
                this.oExpandedLabel = null;
                this.oSnappedLabel = null;
                this.oFilterBar = null;
                this.oTable = null;
            },
            fetchData: function () {
                var aData = this.oFilterBar.getAllFilterItems().reduce(function (aResult, oFilterItem) {
                    aResult.push({
                        groupName: oFilterItem.getGroupName(),
                        fieldName: oFilterItem.getName(),
                        fieldData: oFilterItem.getControl().getSelectedKeys()
                    });
                    return aResult;
                }, []);
                return aData;
            },
            applyData: function (aData) {
                aData.forEach(function (oDataObject) {
                    var oControl = this.oFilterBar.determineControlByName(oDataObject.fieldName, oDataObject.groupName);
                    oControl.setSelectedKeys(oDataObject.fieldData);
                }, this);
            },
            getFiltersWithValues: function () {
                var aFiltersWithValue = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var oControl = oFilterGroupItem.getControl();
                    if (oControl && oControl.getSelectedKeys && oControl.getSelectedKeys().length > 0) {
                        aResult.push(oFilterGroupItem);
                    }
                    return aResult;
                }, []);
                return aFiltersWithValue;
            },
            onSelectionChange: function (oEvent) {
                this.oSmartVariantManagement.currentVariantSetModified(true);
                this.oFilterBar.fireFilterChange(oEvent);
            },
            onSearch: function () {
               
                var aTableFilters = this.oFilterBar.getFilterGroupItems().reduce(function (aResult, oFilterGroupItem) {
                    var aSelectedKeys = [],
                        aFilters = [],
                     oControl = oFilterGroupItem.getControl();

                    if (oControl.getName() === "Nuofe"
                        || oControl.getName() === "ticket"
                        || oControl.getName() === "placa"
                        || oControl.getName() === "placa02"
                        || oControl.getName() === "lifnr"
                        || oControl.getName() === "tara"
                        || oControl.getName() === "cntai"
                        || oControl.getName() === "nlacr"
                        || oControl.getName() === "payload"
                    ) {
                        aSelectedKeys = oControl.getSelectedKeys();
                        aFilters = aSelectedKeys.map(function (sSelectedKey) {
                            return new Filter({
                                path: oFilterGroupItem.getName(),
                                operator: FilterOperator.EQ,
                                value1: sSelectedKey
                            });
                        });
                    }
                    if (aSelectedKeys.length > 0) {
                        aResult.push(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    }
                    return aResult;
                }, []);
                this.oTable.getBinding("items").filter(aTableFilters);
                this.oTable.setShowOverlay(false);
            },
            onFilterChange: function () {
                this._updateLabelsAndTable();
            },
            onAfterVariantLoad: function () {
                this._updateLabelsAndTable();
            },
            getFormattedSummaryText: function () {
                var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();
                if (aFiltersWithValues.length === 0) {
                    return "No filters active";
                }
                if (aFiltersWithValues.length === 1) {
                    return aFiltersWithValues.length + " filter active: " + aFiltersWithValues.join(", ");
                }
                return aFiltersWithValues.length + " filters active: " + aFiltersWithValues.join(", ");
            },
            getFormattedSummaryTextExpanded: function () {
                var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();

                if (aFiltersWithValues.length === 0) {
                    return "No filters active";
                }
                var sText = aFiltersWithValues.length + " filters active",
                    aNonVisibleFiltersWithValues = this.oFilterBar.retrieveNonVisibleFiltersWithValues();
                if (aFiltersWithValues.length === 1) {
                    sText = aFiltersWithValues.length + " filter active";
                }
                if (aNonVisibleFiltersWithValues && aNonVisibleFiltersWithValues.length > 0) {
                    sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
                }
                return sText;
            },
            _updateLabelsAndTable: function () {
                this.oExpandedLabel.setText(this.getFormattedSummaryTextExpanded());
                this.oSnappedLabel.setText(this.getFormattedSummaryText());
                this.oTable.setShowOverlay(true);
            }
        });
    });
