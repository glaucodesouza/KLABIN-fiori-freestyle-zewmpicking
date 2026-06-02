sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'sap/m/MessageBox',
	'sap/f/library',
	'sap/ui/model/odata/ODataModel',
	'sap/ui/core/Fragment',
	"sap/ui/core/syncStyleClass",
	'sap/m/MessageToast'
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary, ODataModel, Fragment, syncStyleClass, MessageToast) {
	"use strict";
	var LayoutType = fioriLibrary.LayoutType;
	const oGCMchb = 'MCHB',
		oGCMska = 'MSKA';
	var iTimeoutId;
	let oGInputAlturaPalete;
	var oModelBarcode2Edit = new sap.ui.model.json.JSONModel({
		flag: 'false',
	});
	var oModelSecondScreenHeader = new sap.ui.model.json.JSONModel({
		payload: '',
		payloadT: '',
		placaCC: '',
		placaCCT: '',
		sNumber: '',
		sNumberT: '',
		PesoLeituraT: '',
		PesoBrutoT: '',
		QtdT: '',
	});
	var oModelVeriPesoReq = new sap.ui.model.json.JSONModel({
		VeriPeso: 0.00,
	});

	var oModelStatus = new sap.ui.model.json.JSONModel({
		flag: 'true',
	});

	var oModelSetEnableLoteFinalizarPicking = new sap.ui.model.json.JSONModel({
		flag: '',
	});
	var oModelQtdBobinasHeader = new sap.ui.model.json.JSONModel({
		Qtd: '',
		QtdT: '',
	});

	var oModelPesoBrutoHeader = new sap.ui.model.json.JSONModel({
		PesoBruto: '',
		PesoBrutoT: '',
	});

	var oModelPesoLeituraHeader = new sap.ui.model.json.JSONModel({
		PesoLeitura: '',
		PesoLeituraT: '',
	});
	var oModelLoteHeaderT = new sap.ui.model.json.JSONModel({
		LoteT: '',
	});
	var oModelPopoverTxt = new sap.ui.model.json.JSONModel({
		FornecimentoItemT: '',
		PedidoT: '',
		ClienteT: '',
		MaterialT: '',
		PesoT: '',
		QtdLotesT: '',
	});
	var oModelHeaderDetailDetail = new sap.ui.model.json.JSONModel({
		Pedido: '',
		PedidoItem: '',
		Cliente: '',
		Material: '',
		Fornecimento: '',
		FornecimentoItem: '',
		Qtd: '',
		s: '',
	});
	var oModelCarregamento = new sap.ui.model.json.JSONModel({
		Carregamento: '',
	});
	var oModelStatusHeader = new sap.ui.model.json.JSONModel({
		Visible: '',
		Icon: '',
		Status: '',
		Text: '',
	});
	let currentDate = new Date();
	let oGCurrentYear = "" + currentDate.getFullYear() + "";
	var filterString = '';
	var oGLgpla = '';
	var oGMTO = '';
	var oGThis;
	var oGLastLote;
	let oGComprimento;
	var oGCheckErrorValidacaoLote = false;
	var oGAlturaPalete;
	var oGCodigoBarras;
	var oGPesoRequerido;
	var oGVstel;
	var oGTicket;
	var oGNuofe;
	var oGAlturaPaleteCheck,
		oGCodigoBarrasCheck;
	var oGInsertInPalete = false,
		oGInsertinBar = false;
	var PesoTotalRequerido = 0.000;
	var oGBukrs = '';
	var oGMatnr = '';

	return Controller.extend("br.com.klabin.zewmpicking2.controller.Details", {
		onInit: function () {

			oGThis = this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.bus = this.getOwnerComponent().getEventBus();
			this._bDescendingSort = false;

			this.oRouter.getRoute("detail").attachPatternMatched(this._onCategoryMatched, this);
			var oModel = this.getOwnerComponent().getModel("Lotes");
			this.oRouter = this.getOwnerComponent().getRouter();
			this._bDescendingSort = false;

			this.oRouter.getRoute("detail").attachPatternMatched(this._onCategoryMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onCategoryMatched, this);
			this.oRouter.getRoute("detailDetailDetail").attachPatternMatched(this._onCategoryMatched, this);

			oModelPesoLeituraHeader.setData(oModelPesoLeituraHeader.oData);
			this.getView().setModel(oModelPesoLeituraHeader, 'MDL_PesoLeitura');
			oModelPesoLeituraHeader.refresh();

			oModelLoteHeaderT.setData(oModelLoteHeaderT.oData);
			this.getView().setModel(oModelLoteHeaderT, 'MDL_LoteTxt');
			oModelLoteHeaderT.refresh();

			const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			const sCarregamentoTxt = oResourceBundle.getText("carregamento");

			oModelPopoverTxt.setData(oModelPopoverTxt.oData);
			this.getView().setModel(oModelPopoverTxt, 'MDL_PopoverTxt');
			sap.ui.getCore().setModel(oModelPopoverTxt, 'MDL_PopoverTxt');

			oModelPopoverTxt.refresh();

		},
		onListItemPress: function (oEvent) {

			var oButton = oEvent.getSource(),
				oView = this.getView(),
				oModel = this.getView().getModel('MDL_Posicoes'),
				oLinhaIndex = oButton.oParent.sId.split('_IDTabPositions-rows-row'),
				oLinhaIndex = oLinhaIndex[1],
				sNuofe = oModel.oData[oLinhaIndex].Nuofe,
				sLgpla = oModel.oData[oLinhaIndex].Lgpla,
				sVbelnR = oModel.oData[oLinhaIndex].VbelnR,
				sOvItem = oModel.oData[oLinhaIndex].OvItem,
				sOv = oModel.oData[oLinhaIndex].Ov,
				t = this,
				strEntity = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
				sUrl = "/Lotes?$filter=Nuofe eq '" + sNuofe + "' and Lgpla eq '" + sLgpla + "' and VbelnR eq '" + sVbelnR + "' and Ov eq '" + sOv + "' and OvItem eq '" + sOvItem + "'",
				oModelSend = new ODataModel(strEntity, true);

			oGLgpla = sLgpla;

			oModelSend.read(sUrl, {

				success: function (oData, results) {
					if (results.statusCode === 200) { //Sucesso do Get


						var oModelLotes = new JSONModel();

						oModelLotes.setData(oData.results);
						sap.ui.getCore().setModel(oModelLotes, 'MDL_Lotes');
						t.getView().setModel(oModelLotes, 'MDL_Lotes');
						oModelLotes.refresh();

						if (oData.results.length > 0) {
							if (oData.results[0].Barcode !== "") {

								oModelBarcode2Edit.oData.flag = 'true';
								oModelBarcode2Edit.setData(oModelBarcode2Edit.oData);
								t.getView().setModel(oModelBarcode2Edit, 'MDL_BarCode2Edit');
								oModelBarcode2Edit.refresh();
							}
							oModelHeaderDetailDetail.oData.Pedido = oData.results[0].Ov,
								oModelHeaderDetailDetail.oData.PedidoItem = oData.results[0].OvItem.trim(),
								oModelHeaderDetailDetail.oData.Cliente = oData.results[0].kunnr,
								oModelHeaderDetailDetail.oData.Material = oData.results[0].Matnr,
								oModelHeaderDetailDetail.oData.Fornecimento = oData.results[0].VbelnR,
								oModelHeaderDetailDetail.oData.FornecimentoItem = oData.results[0].PosnnR,
								oModelHeaderDetailDetail.oData.Qtd = "" + oData.results.length + "";
						}

						if (oData.results.length > 1) {
							oModelHeaderDetailDetail.oData.s = 's:';
						} else {
							oModelHeaderDetailDetail.oData.s = ':'
						}

						oModelHeaderDetailDetail.setData(oModelHeaderDetailDetail.oData);
						sap.ui.getCore().setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetailDetail');
						t.getView().setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetailDetail');
						oModelHeaderDetailDetail.refresh();

						var Model = sap.ui.getCore().getModel('MDL_TwoScreen'),
							oModelControleTela = new sap.ui.model.json.JSONModel({
								screen: '',
							});
						if (Model === undefined) {
							oModelControleTela.oData.screen = 'DetailDetail';
							oModelControleTela.setData(oModelControleTela.oData);
							sap.ui.getCore().setModel(oModelControleTela, 'MDL_TwoScreen');
						} else {
							if (Model.oData === 'DetailDetail') {
								oModelControleTela.oData.screen = 'DetailDetail';
								oModelControleTela.setData(oModelControleTela.oData);
								sap.ui.getCore().setModel(oModelControleTela, 'MDL_ThreeScreen');
								oModelControleTela.refresh();
							} else {
								oModelControleTela.oData.screen = 'DetailDetail';
								oModelControleTela.setData(oModelControleTela.oData);
								sap.ui.getCore().setModel(oModelControleTela, 'MDL_TwoScreen');
							}
						}
						if (!t._pPopover) {
							t._pPopover = Fragment.load({
								id: oView.getId(),
								name: "br.com.klabin.zewmpicking2.frags.Popover2",
								controller: t
							}).then(function (oPopover) {
								oView.addDependent(oPopover);
								return oPopover
							});
						}
						t._pPopover.then(function (oPopover) {
							oPopover.open();
						});
					}
				},
				error: function (e) {
					var oRet = JSON.parse(e.response.body);
					MessageBox.show(oRet.error.message.value, {
						duration: 4000
					});
				}
			});
		},
		onSearch: function (oEvent) {

		},
		onClosePopover: function (oEvent) {

			this.byId("DialogPopoverID").close();
		},

		onAdd: function (oEvent) {
			MessageBox.show("This functionality is not ready yet.", {
				icon: MessageBox.Icon.INFORMATION,
				title: "Aw, Snap!",
				actions: [MessageBox.Action.OK]
			});
		},

		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("table"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("Name", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

		onSetStatus: function (sCStatus, sStatus) {
			switch (sCStatus) {
				case '003':
					oModelStatusHeader.oData.Visible = 'true',
						oModelStatusHeader.oData.Icon = "sap-icon://information",
						oModelStatusHeader.oData.Status = "Success",
						oModelStatusHeader.oData.Text = '' + sStatus + '';
					break;
				case '001':
					oModelStatusHeader.oData.Visible = 'true',
						oModelStatusHeader.oData.Icon = "sap-icon://document",
						oModelStatusHeader.oData.Status = "None",
						oModelStatusHeader.oData.Text = '' + sStatus + '';
					break;
				case '002':
					oModelStatusHeader.oData.Visible = 'true',
						oModelStatusHeader.oData.Icon = "sap-icon://alert",
						oModelStatusHeader.oData.Status = "Warning",
						oModelStatusHeader.oData.Text = '' + sStatus + '';
					break;
				case '004':
					oModelStatusHeader.oData.Visible = 'true',
						oModelStatusHeader.oData.Icon = "sap-icon://lateness",
						oModelStatusHeader.oData.Status = "None",
						oModelStatusHeader.oData.Text = '' + sStatus + '';
					break;
				default:
					oModelStatusHeader.oData.Visible = 'true',
						oModelStatusHeader.oData.Icon = "sap-icon://vehicle-repair",
						oModelStatusHeader.oData.Status = "Error",
						oModelStatusHeader.oData.Text = '' + sStatus + '';
					break;
			}

			oModelStatusHeader.setData(oModelStatusHeader.oData);
			this.getView().setModel(oModelStatusHeader, 'MDL_Status');
			sap.ui.getCore().setModel(oModelStatusHeader, 'MDL_Status');
			oModelStatusHeader.refresh();
		},

		_onCategoryMatched: function (oEvent) {

			var oArguments = oEvent.getParameter("arguments");
			if (oArguments.category === 'DetailDetail') {
				var oModelH = sap.ui.getCore().getModel('MDL_HeaderControl');
				sNumber = oModelH.oData.sNumber;
			} else {
				var sNumber = oArguments.one;
				var sPayload = oArguments.payload;
				var sPlacaCC = oArguments.placaCC;
				var sStatus = oArguments.status;
				var sCStatus = oArguments.cstatus.padStart(3, '0');
				oGVstel = oArguments.vstel;
				oGTicket = oArguments.ticket;
				oGBukrs = oArguments.bukrs
				oGNuofe = sNumber.split("nuofe")[1].replace("='","").replace("')","")

				if (sCStatus === '002') {
					oModelSetEnableLoteFinalizarPicking.oData.flag = 'true'
					oModelSetEnableLoteFinalizarPicking.setData(oModelSetEnableLoteFinalizarPicking.oData);
					this.getView().setModel(oModelSetEnableLoteFinalizarPicking, 'MDL_SetEnableLoteFinalizarPicking');
					sap.ui.getCore().setModel(oModelSetEnableLoteFinalizarPicking, 'MDL_SetEnableLoteFinalizarPicking');
					oModelSetEnableLoteFinalizarPicking.refresh();
				} else {
					oModelSetEnableLoteFinalizarPicking.oData.flag = 'false'
					oModelSetEnableLoteFinalizarPicking.setData(oModelSetEnableLoteFinalizarPicking.oData);
					this.getView().setModel(oModelSetEnableLoteFinalizarPicking, 'MDL_SetEnableLoteFinalizarPicking');
					sap.ui.getCore().setModel(oModelSetEnableLoteFinalizarPicking, 'MDL_SetEnableLoteFinalizarPicking');
					oModelSetEnableLoteFinalizarPicking.refresh();
				}

				this.onSetStatus(sCStatus, sStatus);

				if (sStatus === 'Finalizado') {
					oModelStatus.oData.flag = 'false';
				} else {
					oModelStatus.oData.flag = 'true';
				}

				oModelStatus.setData(oModelStatus.oData);
				this.getView().setModel(oModelStatus, 'MDL_SetEnableLote');
				oModelStatus.refresh();

				oModelSecondScreenHeader.oData.payload = sPayload;
				oModelSecondScreenHeader.oData.placaCC = sPlacaCC;
				oModelSecondScreenHeader.oData.sNumber = sNumber;
				oModelSecondScreenHeader.setData(oModelSecondScreenHeader.oData);
				this.getView().setModel(oModelSecondScreenHeader, 'MDL_Header2');
				sap.ui.getCore().setModel(oModelSecondScreenHeader, 'MDL_HeaderControl');
				oModelSecondScreenHeader.refresh();

				/**INICIALIZAR - INI*/
				/**PESO LEITURA - INI*/

				oModelPesoLeituraHeader.oData.PesoLeitura = '0.000';
				oModelPesoLeituraHeader.setData(oModelPesoLeituraHeader.oData);
				this.getView().setModel(oModelPesoLeituraHeader, 'MDL_PesoLeitura');
				sap.ui.getCore().setModel(oModelPesoBrutoHeader, 'MDL_PesoLeitura');
				oModelPesoLeituraHeader.refresh();

				/**PESO LEITURA - FIM*/

				/**PESO BRUTO - INI */

				oModelPesoBrutoHeader.oData.PesoBruto = '0.000';
				oModelPesoBrutoHeader.setData(oModelPesoBrutoHeader.oData);
				this.getView().setModel(oModelPesoBrutoHeader, 'MDL_PesoBruto');
				sap.ui.getCore().setModel(oModelPesoBrutoHeader, 'MDL_PesoBruto');
				oModelPesoBrutoHeader.refresh();

				/**PESO BRUTO - FIM */

				/**Quantidade de Bobinas - INI*/

				oModelQtdBobinasHeader.oData.Qtd = "0";
				oModelQtdBobinasHeader.setData(oModelQtdBobinasHeader.oData);
				this.getView().setModel(oModelQtdBobinasHeader, 'MDL_QtdBobinas');
				sap.ui.getCore().setModel(oModelQtdBobinasHeader, 'MDL_QtdBobinas');
				oModelQtdBobinasHeader.refresh();

				/**Quantidade de Bobinas - FIM*/
				/**INICIALIZAR - FIM */
			}
			var sTicket = oGTicket;
			var sNumber = oGNuofe

			var sUrl = "/Posicoes?$filter=Nuofe eq '" + sNumber + "' and Ticket eq '" + sTicket + "'";

			var t = this;
			var strEntity = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP";

			//Realizar a chamada para o SAP
			var oModelSend = new ODataModel(strEntity, true)

			var oDados = {
				Ov: '',
				Lote: '',
				Id: '',
				Name: '',
				Act: '',
				ItemsSet: [{
					Ov: '',
					Lote: '',
					Id: '',
					Name: '',
					Act: '',
					ResultPck: '',
					Ov2: '',
				}],
				ResultSet: [{
					Ov: '',
					Lote: '',
					Nuofe: '',
					Lgpla: '',
					Charg: '',
					VbelnR: '',
					lfimg: '',
					TipoOv: '',
					ResultPck: '',

				}]
			};

			let oNuofe = parseInt(sNumber, 10);
			oDados.Ov = '' + oNuofe + '';
			oDados.Act = 'GET_TEXT';
			oDados.Lote = sTicket;
			oDados.Id = '9997';

			oDados.ResultSet[0].Ov = "" + oNuofe + "";
			oDados.ResultSet[0].Lote = '1';
			oDados.ResultSet[0].ResultPck = '';

			oDados.ItemsSet[0].Ov = "" + oNuofe + "";
			oDados.ItemsSet[0].Ov2 = "" + sTicket + "";
			oDados.ItemsSet[0].Lote = '1';
			oDados.ItemsSet[0].ResultPck = '';

			var vUrl = '/sap/opu/odata/sap/ZEWM_PICKINGS_SRV/';
			var oData = new sap.ui.model.odata.v2.ODataModel(vUrl);

			oData.create("/PickingSet", oDados, {
				success: function (oData, response) {


					var oModel = t.getView().getModel('MDL_Posicoes'),
						oModelPosicoes = new JSONModel();

					var oModelUnidadePesoBruto = new sap.ui.model.json.JSONModel({
						Und: '',
					});

					//ajuste
					try {
						oModelUnidadePesoBruto.oData.Und = oData.ResultSet.results[0].vrkme;
						oModelUnidadePesoBruto.setData(oModelUnidadePesoBruto.oData);
						t.getView().setModel(oModelUnidadePesoBruto, 'MDL_UnidadePesoBruto');
						sap.ui.getCore().setModel(oModelUnidadePesoBruto, 'MDL_UnidadePesoBruto');
						oModelUnidadePesoBruto.refresh();

						oModelPosicoes.setData(oData.ResultSet.results);
						t.getView().setModel(oModelPosicoes, 'MDL_Posicoes');
						sap.ui.getCore().setModel(oModelPosicoes, 'MDL_Posicoes');

						oModelBarcode2Edit.oData.flag = 'false';
						oModelBarcode2Edit.setData(oModelBarcode2Edit.oData);
						t.getView().setModel(oModelBarcode2Edit, 'MDL_BarCode2Edit');
						oModelBarcode2Edit.refresh();
					} catch (error) {

					}
					// oModelUnidadePesoBruto.oData.Und = oData.ResultSet.results[0].vrkme;
					// oModelUnidadePesoBruto.setData(oModelUnidadePesoBruto.oData);
					// t.getView().setModel(oModelUnidadePesoBruto, 'MDL_UnidadePesoBruto');
					// sap.ui.getCore().setModel(oModelUnidadePesoBruto, 'MDL_UnidadePesoBruto');
					// oModelUnidadePesoBruto.refresh();

					// oModelPosicoes.setData(oData.ResultSet.results);
					// t.getView().setModel(oModelPosicoes, 'MDL_Posicoes');
					// sap.ui.getCore().setModel(oModelPosicoes, 'MDL_Posicoes');

					// oModelBarcode2Edit.oData.flag = 'false';
					// oModelBarcode2Edit.setData(oModelBarcode2Edit.oData);
					// t.getView().setModel(oModelBarcode2Edit, 'MDL_BarCode2Edit');
					// oModelBarcode2Edit.refresh();

					t.onGetNewLote();

				},
				error: function (err) {
					var oMessage = JSON.parse(err.responseText);
					sap.m.MessageBox.error(oMessage.error.innererror.errordetails[0].message);
				}
			});

			var oModelPosicoes = new JSONModel();
			oModelPosicoes.setData(oData.results);
			t.getView().setModel(oModelPosicoes, 'MDL_Posicoes');
			sap.ui.getCore().setModel(oModelPosicoes, 'MDL_Posicoes');
		},
		onLiveChange: function (oEvent) {
			oGInsertInPalete = false;
			oGInsertinBar = false;
			oGCheckErrorValidacaoLote = false
			/**pega inserção no campo de lote */

			var t = this;
			var oLength = oEvent.mParameters.newValue.length,
				oView = this.getView();

			if (oLength === 10) {

				PesoTotalRequerido = 0;

				if (this.getView().getModel('MDL_Posicoes').oData === undefined) {
					const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
					const sMsgErroSemPosicao = oResourceBundle.getText("msgErroSemPosicao");
					MessageBox.error("" + sMsgErroSemPosicao + "");
					return;
				}

				try {
					for (let i = 0; this.getView().getModel('MDL_Posicoes').oData.length > i; i++) {
						PesoTotalRequerido += parseFloat(this.getView().getModel('MDL_Posicoes').oData[i].lfimg);
					}
				} catch (error) {

				}
				//original
				// for (let i = 0; this.getView().getModel('MDL_Posicoes').oData.length > i; i++) {
				// 	PesoTotalRequerido += parseFloat(this.getView().getModel('MDL_Posicoes').oData[i].lfimg);
				// }

				oGLastLote = oEvent.mParameters.newValue;

				//ajuste
				var Nuofe = '',
					oLgplaS = [],
					oOvs = [],
					oOvsItem = [];

				try {
					Nuofe = this.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
				} catch (error) {
					Nuofe = this.getView().getModel('MDL_Header2').oData.sNumber.match(/Nuofe='(.*?)'/)[1];
				}

				//original
				// var Nuofe = this.getView().getModel('MDL_Posicoes').oData[0].Nuofe,
				// 	oLgpla = this.getView().getModel('MDL_Posicoes').oData[0].Lgpla,
				// 	oLgplaS = [],
				// 	oOvs = [],
				// 	oOvsItem = [];

				for (let i = 0; this.getView().getModel('MDL_Posicoes').oData.length > i; i++) {
					oLgplaS.push(this.getView().getModel('MDL_Posicoes').oData[i].Lgpla);
					if (oVAnt === undefined || oVAnt != this.getView().getModel('MDL_Posicoes').oData[i].Ov) {
						var oVAnt = this.getView().getModel('MDL_Posicoes').oData[i].Ov;
						oOvs.push(this.getView().getModel('MDL_Posicoes').oData[i].Ov);
						oOvsItem.push(this.getView().getModel('MDL_Posicoes').oData[i].OvItem);
					}
				}

				const lgplaFilter = oLgplaS.map(value => ` Lgpla eq '${value}' `).join('or');
				const oVFilter = oOvs.map(value => ` Ov eq '${value}' `).join('or');
				const oVItemFilter = oOvsItem.map(value => ` OvItem eq '${value}' `).join('or');

				filterString = `(${lgplaFilter}) and (${oVFilter}) and (${oVItemFilter}) and Nuofe eq '${Nuofe}' and Charg eq '${oEvent.mParameters.newValue}'`;
				var oPicking = '002';
				var strEntityCheck = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
					sUrlCheck = "/CheckLotes?$filter=Lote eq '" + oGLastLote + "' and status eq '" + oPicking + "'",
					oModelSendCheck = new ODataModel(strEntityCheck, true),
					strEntity = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
					sUrl = `/Lotes?$filter=${filterString}`,
					oModelSend = new ODataModel(strEntity, true);

				var oData;

				oModelSendCheck.read(sUrlCheck, {
					success: function (oData, results) {
						if (oData.results.length != 0) {
							const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
							const sMsgLoteUtlORem = oResourceBundle.getText("msgLoteUtlORem");
							MessageBox.error("" + sMsgLoteUtlORem + "");
						} else {
							oModelSend.read(sUrl, {
								success: function (oData, results) {
									if (results.statusCode === 200) { //Sucesso do Get
										if (oData.results.length === 0) {
											const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
											const sMsgLoteInvalid = oResourceBundle.getText("msgLoteInvalid");
											MessageBox.error("" + sMsgLoteInvalid + "");

										} else if (oData.results.length > 0) {
											oData = oData;
											oGComprimento = oData.results[0].Comprimento;

											var oModelPesoBruto = t.getView().getModel('MDL_PesoBruto');
											var SumTotal = 0.000;

											if (oModelPesoBruto === undefined) {
												var oClabs = parseFloat(oData.results[0].clabs);
												SumTotal += oClabs;
												SumTotal.toFixed(3);
											} else {
												oClabs = parseFloat(oModelPesoBruto.oData.PesoBruto) + parseFloat(oData.results[0].clabs);
												SumTotal += oClabs;
												SumTotal.toFixed(3);
											}

											/**PESO LEITURA - INI*/

											var oPesoLeitura = parseFloat(oData.results[0].clabs);

											oModelPesoLeituraHeader.oData.PesoLeitura = oPesoLeitura.toFixed(3);
											oModelPesoLeituraHeader.setData(oModelPesoLeituraHeader.oData);
											t.getView().setModel(oModelPesoLeituraHeader, 'MDL_PesoLeitura');
											oModelPesoLeituraHeader.refresh();

											/**PESO LEITURA - FIM*/

											/**PESO BRUTO - INI */
											if (PesoTotalRequerido < SumTotal && PesoTotalRequerido > 0) {
												let oPeso = t.getView().getModel('MDL_PesoBruto');
												var oModelPesoBrutoHeaderBack = new sap.ui.model.json.JSONModel({
													PesoBruto: '',
													PesoBrutoT: '',
												});

												oModelPesoBrutoHeaderBack.oData.PesoBruto = SumTotal;
												oModelPesoBrutoHeaderBack.setData(oModelPesoBrutoHeaderBack.oData);
												t.getView().setModel(oModelPesoBrutoHeaderBack, 'MDL_PesoBrutoBack');
												oModelPesoBrutoHeaderBack.refresh();
											} else if (PesoTotalRequerido > SumTotal && PesoTotalRequerido > 0) {

												oModelPesoBrutoHeader.oData.PesoBruto = SumTotal.toFixed(3);
												oModelPesoBrutoHeader.setData(oModelPesoBrutoHeader.oData);
												t.getView().setModel(oModelPesoBrutoHeader, 'MDL_PesoBruto');
												oModelPesoBrutoHeader.refresh();

											}

											/**PESO BRUTO - FIM */

											var Model = sap.ui.getCore().getModel('MDL_TwoScreen');
											var oModelControleTela = new sap.ui.model.json.JSONModel({
												screen: '',
											});

											var oQtdReal = 0.000;
											var oModelSUMQtd = oView.getModel('MDL_QtdReal');

											if (oModelSUMQtd !== undefined) {
												var oQtdReal = oModelSUMQtd.oData.QtdReal + parseFloat(oData.results.QtdReal);
											} else {
												if (oData.results.QtdReal === undefined) {
													oQtdReal = 0.000;
												} else {
													oQtdReal = oData.results.QtdReal;
												}
											}

											if (oModelSecondScreenHeader.oData.payload < oQtdReal) {
												const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
												const sMsgPayloadAtingido = oResourceBundle.getText("msgPayloadAtingido");
												MessageBox.error("" + sMsgPayloadAtingido + "");
												oGCheckErrorValidacaoLote = true;
											}

											var oModelQtdReal = new sap.ui.model.json.JSONModel();
											oModelQtdReal.oData.QtdReal = oQtdReal;
											oModelQtdReal.setData(oModelQtdReal);
											sap.ui.getCore().setModel(oModelQtdReal, 'MDL_QtdReal');

											oModelHeaderDetailDetail.oData.Pedido = oData.results[0].Ov,
												oModelHeaderDetailDetail.oData.PedidoItem = oData.results[0].OvItem.trim(),
												oModelHeaderDetailDetail.oData.Cliente = oData.results[0].kunnr,
												oModelHeaderDetailDetail.oData.Material = oData.results[0].Matnr,
												oModelHeaderDetailDetail.oData.Fornecimento = oData.results[0].VbelnR,
												oModelHeaderDetailDetail.oData.FornecimentoItem = oData.results[0].PosnnR,
												oModelHeaderDetailDetail.oData.Qtd = "" + oData.results.length + "";
											if (oData.results.length > 1) {
												oModelHeaderDetailDetail.oData.s = 's:';
											} else {
												oModelHeaderDetailDetail.oData.s = ':'
											}
											oModelHeaderDetailDetail.setData(oModelHeaderDetailDetail.oData);

											sap.ui.getCore().setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetail');
											oView.setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetail');
											oModelHeaderDetailDetail.refresh();

											var oModelLotes = new sap.ui.model.json.JSONModel();
											oModelLotes.setData(oData.results);
											sap.ui.getCore().setModel(oModelLotes, 'MDL_LotesG');

											var oModelSUM = t.getView().getModel('MDL_QtdBobinas');
											if (oModelSUM !== undefined) {
												var oSumQtdBobinas = oModelSUM.oData.Qtd;
											} else {
												oSumQtdBobinas = 0;
											}

											var SumTotal = 0.000;
											oSumQtdBobinas++;

											oModelQtdBobinasHeader.oData.Qtd = oSumQtdBobinas;

											oModelQtdBobinasHeader.setData(oModelQtdBobinasHeader.oData);
											oView.setModel(oModelQtdBobinasHeader, 'MDL_QtdBobinas');
											sap.ui.getCore().setModel(oModelQtdBobinasHeader, 'MDL_QtdBobinas');
											oModelQtdBobinasHeader.refresh();

											/*ajuste MDL_NewLotes, Lote_Count*/
											let aDadosNewLotes = [];
											let oDadosNewLotes = {};
											let oModelNewLotes = '';
											try {
												oModelNewLotes = t.getView().getModel('MDL_NewLotes');
												if (!!oModelNewLotes && !!oModelNewLotes.oData) {
													const index = oModelNewLotes.oData.findIndex(item => item.Vbeln === oData.results[0].VbelnR);
													oModelNewLotes.oData[index].Lote_Count = oSumQtdBobinas;
													oModelNewLotes.setData(oModelNewLotes.oData);
												} else {
													oModelNewLotes = new sap.ui.model.json.JSONModel();
													oDadosNewLotes.Lote_Count = oSumQtdBobinas;
													aDadosNewLotes.push(oDadosNewLotes);
													oModelNewLotes.setData(aDadosNewLotes);
												}
												t.getView().setModel(oModelNewLotes, 'MDL_NewLotes');
												sap.ui.getCore().setModel(oModelNewLotes, 'MDL_NewLotes');
												oModelNewLotes.refresh();
											} catch (error) {
												const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
												const sMsgErroTecnicoAoInserirLote = oResourceBundle.getText("msgErroTecnicoAoInserirLote");
												MessageBox.error("" + sMsgErroTecnicoAoInserirLote + "");
											}

											let sOModelData = new sap.ui.model.json.JSONModel({});
											sOModelData.oData.Lote_Count = oSumQtdBobinas;
											sOModelData.setData(sOModelData.oData);
											t.getView().setModel(sOModelData, 'MDL_LotesFornList');
											sOModelData.refresh();

											if (Model === undefined) {
												oModelControleTela.oData.screen = 'DetailDetail';
												oModelControleTela.setData(oModelControleTela.oData);
												sap.ui.getCore().setModel(oModelControleTela, 'MDL_TwoScreen');
											} else {
												if (Model.oData === 'DetailDetail') {
													oModelControleTela.oData.screen = 'DetailDetail';
													oModelControleTela.setData(oModelControleTela.oData);
													sap.ui.getCore().setModel(oModelControleTela, 'MDL_ThreeScreen');
													oModelControleTela.refresh();
												} else {
													oModelControleTela.oData.screen = 'DetailDetail';
													oModelControleTela.setData(oModelControleTela.oData);
													sap.ui.getCore().setModel(oModelControleTela, 'MDL_TwoScreen');
												}
											}
											var oGFirstPopup = '';

											if (oGCheckErrorValidacaoLote === false) {
												if (oData.results[0].Barcode !== "" && (oData.results[0].CheckPlant === oData.results[0].Plant)) {
													oGInsertInPalete = true;
													oGInsertinBar = true;
												}
												if (oData.results[0].Barcode !== "" && (oData.results[0].CheckPlant != oData.results[0].Plant)) {
													oGInsertinBar = true;
												}
												if (oData.results[0].Barcode === "" && (oData.results[0].CheckPlant === oData.results[0].Plant)) {
													oGInsertInPalete = true;
												}
												if (oGInsertInPalete === false && oGInsertinBar === false) {
													if (oGCheckErrorValidacaoLote === false) {
														/**Verificar Peso requerido */
														var oModelVeriPesoReqLocal = t.getView().getModel('MDL_VeriPesoReq');
														var oVeriPesoReq = 0.00;

														if (oModelVeriPesoReqLocal === undefined) {
															oVeriPesoReq += parseFloat(oData.results[0].clabs);
														} else {
															oVeriPesoReq = parseFloat(oModelVeriPesoReqLocal.oData.VeriPeso) + parseFloat(oData.results[0].clabs);
														}

														if (PesoTotalRequerido < oVeriPesoReq) {
															oGCheckErrorValidacaoLote = true;
															const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
															const sMsgQtdReqAtingida = oResourceBundle.getText("msgQtdReqAtingida");
															MessageBox.error("" + sMsgQtdReqAtingida + "");
														} else {
															oModelVeriPesoReq.oData.VeriPeso = oVeriPesoReq;
															oModelVeriPesoReq.setData(oModelVeriPesoReq.oData);
															t.getView().setModel(oModelVeriPesoReq, 'MDL_VeriPesoReq');
														}
														/**Carregamento - INI*/

														var oPesoReal = 0.000;
														oPesoReal = parseFloat(oData.results[0].clabs);

														if (isNaN(oPesoReal) || isNaN(PesoTotalRequerido)) {
															var oCarregamento = 0;
														} else {
															if (oPesoReal === 0 || PesoTotalRequerido === 0) {
																oCarregamento = 0;
															} else {
																oCarregamento = (oPesoReal / PesoTotalRequerido) * 100;
															}
														}

														var sCarregamento = oCarregamento.toFixed(2);
														oModelCarregamento.oData.Carregamento = parseInt(sCarregamento);
														oModelCarregamento.setData(oModelCarregamento.oData);
														sap.ui.getCore().setModel(oModelCarregamento, 'MDL_Carregamento');
														t.getView().setModel(oModelCarregamento, 'MDL_Carregamento');

														/**Gravar dados nas tabelas Z's via SEGW */
														var oDados = {
															Bukrs: '',
															Transporte: '',
															Ticket: '',
															Ano: '',
															Vstel: '',
															Status: '',
															FinCarrUser: '',
															FinCarrData: '',
															PesoUltLido: '',
															ItemsSet: [{
																Bukrs: '',
																Transporte: '',
																Ticket: '',
																Ano: '',
																Vstel: '',
																Vbeln: '',
																Posnv: '',
																Lote: '',
																//PesoReq: '',

																UserPicking: '',
																Matnr: '',
																DataPicking: '',
																AlturaPalete: '',
																OriEstoque: '',
															}],
															ResultSet: [{
																Bukrs: '',
																Transporte: '',
																Ticket: '',
																Ano: '',
																Vstel: '',
																return: '',
															}]
														};

														var oModelMain = sap.ui.getCore().getModel('ModelDataTransitMain');

														let currentDate = new Date();
														let currentYear = "" + currentDate.getFullYear() + "";

														oDados.Bukrs = oGBukrs;
														oDados.Transporte = t.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
														oDados.Ticket = oGTicket;
														oDados.Ano = currentYear;
														oDados.Vstel = oGVstel;
														oDados.Status = '002'; //Em Picking
														oDados.FinCarrUser = '';
														oDados.FinCarrData = '';
														oDados.PesoUltLido = oData.results[0].clabs;
														oDados.PesoUltLido = oData.results[0].meins;

														oDados.ItemsSet[0].Bukrs = oGBukrs;
														oDados.ItemsSet[0].Transporte = t.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
														oDados.ItemsSet[0].Ticket = oGTicket;
														oDados.ItemsSet[0].Ano = currentYear;
														oDados.ItemsSet[0].Vstel = oGVstel;
														oDados.ItemsSet[0].Vbeln = oData.results[0].VbelnR;
														oDados.ItemsSet[0].Posnv = oData.results[0].PosnnR;
														oDados.ItemsSet[0].Matnr = oData.results[0].Matnr;
														oDados.ItemsSet[0].Lote = oEvent.mParameters.newValue;

														if (oData.results[0].TipoOV === 'MTS') {
															oDados.ItemsSet[0].OriEstoque = oGCMchb;
														} else if (oData.results[0].TipoOV === 'MTO') {
															oDados.ItemsSet[0].OriEstoque = oGCMska;
														}

														oDados.ItemsSet[0].UserPicking = '';
														oDados.ItemsSet[0].DataPicking = '';
														oDados.ItemsSet[0].AlturaPalete = oGInputAlturaPalete;

														oDados.ResultSet[0].Bukrs = oGBukrs;
														oDados.ResultSet[0].Transporte = t.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
														oDados.ResultSet[0].Ticket = t.getView().getModel('MDL_Posicoes').oData[0].Ticket;
														oDados.ResultSet[0].Ano = currentYear;
														oDados.ResultSet[0].Vstel = oGVstel;
														oDados.ResultSet[0].return = '';

														t.onInsertNewLote(oEvent);

														/*
														var vUrl = '/sap/opu/odata/sap/ZGWEWM_PICKINGS_INSERTS_SRV/';
														var oData = new sap.ui.model.odata.v2.ODataModel(vUrl);

														oData.create("/HeaderSet", oDados, {
															success: function (oData, response) {
															},
															error: function (err) {
																var oMessage = JSON.parse(err.responseText);
																sap.m.MessageBox.error(oMessage.error.innererror.errordetails[0].message);
															}
														});
														*/
														if (oGCodigoBarrasCheck === false) {
															t.bus = t.getOwnerComponent().getEventBus();
															t.bus.publish("flexible", "setDetailDetailPage");
														}
													}
												}
												/**Abrir BarCode 2*/
												if (results.data.results[0].Barcode !== "" && oGCheckErrorValidacaoLote === false) {
													if (!t._pCodBarras) {
														oGFirstPopup = 'Barras';
														t._pCodBarras = Fragment.load({
															id: oView.getId(),
															name: "br.com.klabin.zewmpicking2.frags.CodigoBarras",
															controller: t
														}).then(function (oCodBarras) {
															oView.addDependent(oCodBarras);
															return oCodBarras
														});
													} else {
														oGFirstPopup = 'Barras';
													}
													t._pCodBarras.then(function (oCodBarras) {
														oGFirstPopup = 'Barras';
														oCodBarras.open();
													});
												}
												// 10/09/2024 Foi solicitada a retirada do popup do preenchimento da altura do palete
												// /**Abrir Altura do Palete Popup*/
												if (results.data.results[0].CheckPlant === results.data.results[0].Plant && oGCheckErrorValidacaoLote === false && (oGFirstPopup != 'Barras')) {
													if (!t._pAltPalete) {
														t._pAltPalete = Fragment.load({
															id: oView.getId(),
															name: "br.com.klabin.zewmpicking2.frags.AlturaPalete",
															controller: t
														}).then(function (oAltPalete) {
															oView.addDependent(oAltPalete);
															return oAltPalete
														});
													}
													t._pAltPalete.then(function (oAltPalete) {
														oAltPalete.open();
													});
												}
											}
										}
									}
								},
								error: function (e) {
									var oRet = JSON.parse(e.response.body);
									MessageBox.show(oRet.error.message.value, {
										duration: 4000
									});
								}
							});
						}
					},
					error: function (e) {
						var oRet = JSON.parse(e.response.body);
						MessageBox.show(oRet.error.message.value, {
							duration: 4000
						});
					}
				});
			} else if (oLength > 10) {
				const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
				const sMsgLoteNExist = oResourceBundle.getText("msgLoteNExistEste");
				MessageBox.error("" + sMsgLoteNExist + "");
			}
		},
		onbeforeRebindTable: function (oEvent) {
		},
		onAfterRendering: function () {
		},
		onSetModelChange: function (oEvent) {

			var t = oGThis;
			var oModel = sap.ui.getCore().getModel("MDL_HeaderDetail");
			var oModelHeaderDetailDetail2 = new sap.ui.model.json.JSONModel({});

			if (oModel === undefined) {
				oModel = new sap.ui.model.json.JSONModel({});
				oModel.oData.Pedido = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].Ov;
				oModel.oData.PedidoItem = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].OvItem.trim();
				oModel.oData.Cliente = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].Kunnr;
				oModel.oData.Material = oGMatnr;
				oModel.oData.Fornecimento = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].VbelnR;
				oModel.oData.FornecimentoItem = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].PosnnR;
				oModel.oData.Qtd = sap.ui.getCore().getModel("MDL_NewLotes").getData()[0].Lote_Count;
				oModelHeaderDetailDetail.setData(oModelHeaderDetailDetail.oData),
					t.getView().setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetailDetail'),
					oModelHeaderDetailDetail.refresh();
			}

			oModelHeaderDetailDetail.oData.Pedido = oModel.oData.Pedido,
				oModelHeaderDetailDetail.oData.PedidoItem = oModel.oData.PedidoItem.trim(),
				oModelHeaderDetailDetail.oData.Cliente = oModel.oData.Cliente,
				oModelHeaderDetailDetail.oData.Material = oModel.oData.Material,
				oModelHeaderDetailDetail.oData.Fornecimento = oModel.oData.Fornecimento,
				oModelHeaderDetailDetail.oData.FornecimentoItem = oModel.oData.FornecimentoItem,
				oModelHeaderDetailDetail.oData.Qtd = oModel.oData.Qtd,
				oModelHeaderDetailDetail.setData(oModelHeaderDetailDetail.oData),
				t.getView().setModel(oModelHeaderDetailDetail, 'MDL_HeaderDetailDetail'),
				oModelHeaderDetailDetail.refresh();

			let checkModelRight = t.getView().getModel('MDL_HeaderDetailDetailRight');

			if (checkModelRight === undefined) {

				oModelHeaderDetailDetail2.oData.Pedido = oModel.oData.Pedido,
					oModelHeaderDetailDetail2.oData.PedidoItem = oModel.oData.PedidoItem.trim(),
					oModelHeaderDetailDetail2.oData.Cliente = oModel.oData.Cliente,
					oModelHeaderDetailDetail2.oData.Material = oModel.oData.Material,
					oModelHeaderDetailDetail2.oData.Fornecimento = oModel.oData.Fornecimento,
					oModelHeaderDetailDetail2.oData.FornecimentoItem = oModel.oData.FornecimentoItem,
					oModelHeaderDetailDetail2.oData.Qtd = oModel.oData.Qtd,
					oModelHeaderDetailDetail2.setData(oModelHeaderDetailDetail.oData),
					oModelHeaderDetailDetail2.setData(oModelHeaderDetailDetail2.oData),
					t.getView().setModel(oModelHeaderDetailDetail2, 'MDL_HeaderDetailDetailRight'),
					oModelHeaderDetailDetail2.refresh();
			}

			var oData = sap.ui.getCore().getModel("MDL_NewLotes").getData(),
				oModelLotes = new JSONModel(),
				oModelDataUnd = sap.ui.getCore().getModel('MDL_UnidadePesoBruto').getData(),
				oModelUnd = new JSONModel();

			oModelLotes.setData(oData);
			t.getView().setModel(oModelLotes, 'MDL_NewLotes');
			oModelLotes.refresh();

			oModelUnd.setData(oModelDataUnd);
			t.getView().setModel(oModelUnd, 'MDL_UnidadePesoBruto');
			oModelUnd.refresh();

		},
		onSliceCheck: function (oEvent) {

			oGCheckErrorValidacaoLote = false;
			var sInput = this.getView().byId("InputCodBarras2ID").getValue(),
				oInput = sInput.slice(4, 14),
				oInputSub = sInput.substring(4, 14),
				oComprimento = sInput.slice(22, 28),
				oView = this.getView();
			var oModelLotes = sap.ui.getCore().getModel('MDL_LotesG');

			oGCodigoBarras = sInput;

			oGComprimento = oGComprimento.split('.00');
			oGComprimento = oGComprimento[0];
			let sComprimentoSix = oGComprimento.padStart(6, '0');

			if (oGLastLote !== oInput) {
				const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				const sMsgCBarNPertenc = oResourceBundle.getText("msgErroCodBarNPertenceLote");
				MessageBox.error("" + sMsgCBarNPertenc + "");
				this.getView().byId("InputCodBarras2ID").setValue("");
				oGCheckErrorValidacaoLote = true;
				this.byId("BarCodeDialogID").close();
			}
			if (oGCheckErrorValidacaoLote === false) {
				if (sComprimentoSix != oComprimento) {
					const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					const sMsgCbarMetragem = oResourceBundle.getText("msgCBarMetragem");
					MessageBox.error("" + sMsgCbarMetragem + " " + oInput + "");
					this.getView().byId("InputCodBarras2ID").setValue("");
					oGCheckErrorValidacaoLote = true;
					this.byId("BarCodeDialogID").close();
				}
			}
			if (oGCheckErrorValidacaoLote === false) {
				if (oModelLotes.oData.skzua === true) {
					const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					const sMsgCbarPosicao = oResourceBundle.getText("msgCBarPosicao");
					MessageBox.error("" + sMsgCbarPosicao + "");
					oGCheckErrorValidacaoLote = true;
					this.getView().byId("InputCodBarras2ID").setValue("");
					this.byId("BarCodeDialogID").close();
				}
			}
			if (oGCheckErrorValidacaoLote === false) {
				if (oModelLotes.oData.skzsi === true) {
					const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
					const sMsgCBarPosicaoInvent = oResourceBundle.getText("msgCBarPosicaoInvent");
					MessageBox.error("" + sMsgCBarPosicaoInvent + "");
					oGCheckErrorValidacaoLote = true;
					this.getView().byId("InputCodBarras2ID").setValue("");
					this.byId("BarCodeDialogID").close();
				}
			}
			//	oGInsertinBar = true; // remover depois colocado aqui apenas para forçar a chamada
			if (oGCheckErrorValidacaoLote === false && oGInsertinBar === true && oGInsertInPalete === true) {
				if (!this._pAltPalete) {
					this._pAltPalete = Fragment.load({
						id: oView.getId(),
						name: "br.com.klabin.zewmpicking2.frags.AlturaPalete",
						controller: this
					}).then(function (oAltPalete) {
						oView.addDependent(oAltPalete);
						return oAltPalete
					});
				}
				this._pAltPalete.then(function (oAltPalete) {
					oAltPalete.open();
				});
				this.getView().byId("InputCodBarras2ID").setValue("");
				this.byId("BarCodeDialogID").close();
			} else if (oGCheckErrorValidacaoLote === false && oGInsertinBar === true && oGInsertInPalete === false) {
				this.getView().byId("InputCodBarras2ID").setValue("");
				this.onInsertNewLote(oEvent);
			}
		},
		onCloseBarCode: function (oEvent) {

			this.getView().byId("InputCodBarras2ID").setValue("");
			this.byId("BarCodeDialogID").close();
		},

		// 10/09/2024 Foi solicitada a retirada do popup do preenchimento da altura do palete
		onCheckAlturaPalete: function (oEvent) {
			oGCheckErrorValidacaoLote = false;
			var sInput = this.getView().byId("InputAlturaPaleteID").getValue();
			oGInputAlturaPalete = sInput;
			if (sInput === undefined) {
				const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				const sMsgAPaleteInformNumber = oResourceBundle.getText("msgAPaleteInformNumber");
				MessageBox.error("" + sMsgAPaleteInformNumber + "");
			} else {
				sInput = sInput.replaceAll("'", '');
				var oCheckInput = sInput.split('.');
				const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				const sMsgAPaleteInvalido = oResourceBundle.getText("msgAPaleteInvalido");
				if (parseInt(oCheckInput[0]) > 2) {
					MessageBox.error("" + sMsgAPaleteInvalido + "");
					oGCheckErrorValidacaoLote = true;
					this.getView().byId("InputAlturaPaleteID").setValue("");
				} else if (parseInt(oCheckInput[0]) === 0 && parseInt(oCheckInput[1]) === 0) {
					MessageBox.error("" + sMsgAPaleteInvalido + "");
					oGCheckErrorValidacaoLote = true;
					this.getView().byId("InputAlturaPaleteID").setValue("");
				} else if (parseInt(oCheckInput[0]) === 2 && parseInt(oCheckInput[1]) > 0) {
					MessageBox.error("" + sMsgAPaleteInvalido + "");
					oGCheckErrorValidacaoLote = true;
					this.getView().byId("InputAlturaPaleteID").setValue("");
				} else if (parseInt(oCheckInput[0]) < 0) {
					MessageBox.error("" + sMsgAPaleteInvalido + "");
					oGCheckErrorValidacaoLote = true;
					this.getView().byId("InputAlturaPaleteID").setValue("");
				} else {
					oGAlturaPalete = sInput;
					this.getView().byId("InputAlturaPaleteID").setValue("");
					this.onInsertNewLote(oEvent);
				}
			}
		},
		onCloseAltPalete: function (oEvent) {

			this.byId("AlturaPaleteDialogID").close();
		},
		onInsertNewLote: function (oEvent) {
			var Nuofe = this.getView().getModel('MDL_Posicoes').oData[0].Nuofe,
				oLgpla = this.getView().getModel('MDL_Posicoes').oData[0].Lgpla,
				strEntity = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
				sUrl = `/Lotes?$filter=${filterString}`,
				oModelSend = new ODataModel(strEntity, true),
				t = this;
			oModelSend.read(sUrl, {
				success: function (oData, results) {
					if (results.statusCode === 200) { //Sucesso do Get
						if (oGCheckErrorValidacaoLote === false) {
							/**Verificar Pesoo requerido */
							var oModelVeriPesoReqLocal = t.getView().getModel('MDL_VeriPesoReq');
							var oVeriPesoReq = 0.00;
							var oPesoBrutoTotal = t.getView().getModel('MDL_PesoBruto').oData.PesoBruto;

							if (oModelVeriPesoReqLocal === undefined) {
								oVeriPesoReq += parseFloat(oData.results[0].clabs);
							} else {
								oVeriPesoReq = parseFloat(oModelVeriPesoReqLocal.oData.VeriPeso) + parseFloat(oData.results[0].clabs);
							}

							if (PesoTotalRequerido < oVeriPesoReq) {
								oGCheckErrorValidacaoLote = true;
								// 10/09/2024 Foi solicitada a retirada do popup do preenchimento da altura do palete
								 if (t.getView().byId("InputAlturaPaleteID") != undefined) {
								 	t.getView().byId("InputAlturaPaleteID").setValue("");
								 	t.byId("AlturaPaleteDialogID").close();
								 }
								const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
								const sMsgQtdReqAtingida = oResourceBundle.getText("msgQtdReqAtingida");
								MessageBox.error("" + sMsgQtdReqAtingida + "");
							} else {
								oModelVeriPesoReq.oData.VeriPeso = oVeriPesoReq;
								oModelVeriPesoReq.setData(oModelVeriPesoReq.oData);
								t.getView().setModel(oModelVeriPesoReq, 'MDL_VeriPesoReq');
							}
							if (oGCheckErrorValidacaoLote != true) {

								/**Carregamento - INI*/
								var oPesoReal = 0.000;
								oPesoReal = oVeriPesoReq; //parseFloat(oData.results[0].clabs);

								if (isNaN(oPesoReal) || isNaN(PesoTotalRequerido)) {
									var oCarregamento = 0;
								} else {
									if (oPesoReal === 0 || PesoTotalRequerido === 0) {
										oCarregamento = 0;
									} else {
										//	if (oPesoReal < PesoTotalRequerido) {
										oCarregamento = (oPesoReal / PesoTotalRequerido) * 100;
										//	} else if (PesoTotalRequerido < oPesoReal) {
										//	oCarregamento = (PesoTotalRequerido / oPesoReal) * 100;
										//	}
									}
								}

								var sCarregamento = oCarregamento.toFixed(2);
								oModelCarregamento.oData.Carregamento = parseInt(sCarregamento);
								oModelCarregamento.setData(oModelCarregamento.oData);
								sap.ui.getCore().setModel(oModelCarregamento, 'MDL_Carregamento');
								t.getView().setModel(oModelCarregamento, 'MDL_Carregamento');

								/**Gravar dados nas tabelas Z's via SEGW */
								var oDados = {
									Bukrs: '',
									Transporte: '',
									Ticket: '',
									Ano: '',
									Vstel: '',
									Status: '',
									FinCarrUser: '',
									FinCarrData: '',
									PesoUltLido: '',
									ItemsSet: [{
										Bukrs: '',
										Transporte: '',
										Ticket: '',
										Ano: '',
										Vstel: '',
										Vbeln: '',
										Posnv: '',
										Lote: '',
										UserPicking: '',
										Matnr: '',
										DataPicking: '',
										AlturaPalete: '',
										OriEstoque: '',
									}],
									ResultSet: [{
										Bukrs: '',
										Transporte: '',
										Ticket: '',
										Ano: '',
										Vstel: '',
										return: '',
									}]
								};

								var oModelMain = sap.ui.getCore().getModel('ModelDataTransitMain');

								oDados.Bukrs = oGBukrs;
								oDados.Transporte = t.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
								oDados.Ticket = oGTicket;
								oDados.Ano = oGCurrentYear;
								oDados.Vstel = oGVstel;
								oDados.Status = '002';
								oDados.FinCarrUser = '';
								oDados.FinCarrData = '';
								oDados.PesoUltLido = oData.results[0].clabs;
								oDados.Meins = oData.results[0].meins;

								oDados.ItemsSet[0].Bukrs = oGBukrs;
								oDados.ItemsSet[0].Transporte = t.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
								oDados.ItemsSet[0].Ticket = oGTicket;
								oDados.ItemsSet[0].Ano = oGCurrentYear;
								oDados.ItemsSet[0].Vstel = oGVstel;
								oDados.ItemsSet[0].Vbeln = oData.results[0].VbelnR;
								oDados.ItemsSet[0].Posnv = oData.results[0].PosnnR;
								oDados.ItemsSet[0].Matnr = oData.results[0].Matnr;
								oDados.ItemsSet[0].Lote = oGLastLote;

								if (oData.results[0].TipoOV === 'MTS') {
									oDados.ItemsSet[0].OriEstoque = oGCMchb;
								} else if (oData.results[0].TipoOV === 'MTO') {
									oDados.ItemsSet[0].OriEstoque = oGCMska;
								}

								oDados.ItemsSet[0].UserPicking = '';
								oDados.ItemsSet[0].DataPicking = '';
								oDados.ItemsSet[0].AlturaPalete = oGInputAlturaPalete;

								oDados.ResultSet[0].Bukrs = oGBukrs;
								oDados.ResultSet[0].Transporte = t.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
								oDados.ResultSet[0].Ticket = t.getView().getModel('MDL_Posicoes').oData[0].Ticket;
								oDados.ResultSet[0].Ano = oGCurrentYear;
								oDados.ResultSet[0].Vstel = oGVstel;
								oDados.ResultSet[0].return = '';

								var oModelLotesList = new sap.ui.model.json.JSONModel({});

								oModelLotesList.setData(oDados);
								t.getView().setModel(oModelLotesList, 'MDL_LotesList');

								var vUrl = '/sap/opu/odata/sap/ZGWEWM_PICKINGS_INSERTS_SRV/';
								var oData = new sap.ui.model.odata.v2.ODataModel(vUrl);

								oData.create("/HeaderSet", oDados, {
									success: function (oData, response) {

										t.onGetNewLote();
										var sCStatus = '002',
											sStatus = 'Em Picking';
										t.onSetStatus(sCStatus, sStatus);
										const oResourceBundle = t.getOwnerComponent().getModel("i18n").getResourceBundle();
										const sMsgLoteInserido = oResourceBundle.getText("msgLoteInserido");

										MessageToast.show("" + sMsgLoteInserido + "");

										var oInput = t.getView().byId("LoteInput").setValue("");
										//oInput.setValue("");

									},
									error: function (err) {
										var oMessage = JSON.parse(err.responseText);
										sap.m.MessageBox.error(oMessage.error.innererror.errordetails[0].message);
									}
								});

							}
						}
					}
				},
				error: function (e) {
					var oRet = JSON.parse(e.response.body);
					MessageBox.show(oRet.error.message.value, {
						duration: 4000
					});
				}
			});

			
		},
		onClear: function () {
			oGInsertinBar = false;
			oGInsertInPalete = false;
			oGCheckErrorValidacaoLote = false;
			oGLastLote = '';
		},
		onGetNewLote: function () {

			const d = new Date();
			let year = d.getFullYear();
			var oDataAnt;

			var oModelLotesList = this.getView().getModel('MDL_LotesList');
			if (oModelLotesList === undefined) {
				var oCheckModel = true;
				oModelLotesList = new sap.ui.model.json.JSONModel({});
				oModelLotesList.oData.Bukrs = oGBukrs;
				if (this.getView().getModel('MDL_Posicoes') != undefined) {
					//ajuste
					try {
						oModelLotesList.oData.Transporte = this.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
					} catch (error) {
						this.getView().getModel('MDL_Header2').oData.sNumber.split("ticket=")[1].replaceAll(')','').replaceAll("'","")
						//oModelLotesList.oData.Transporte = this.getView().getModel('MDL_Header2').oData.sNumber.match(/Nuofe='(.*?)'/)[1];
					}
					// oModelLotesList.oData.Transporte = this.getView().getModel('MDL_Posicoes').oData[0].Nuofe;
				} else {
					try {
						oModelLotesList.oData.Transporte = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].Nuofe;
					} catch (error) {
						oModelLotesList.oData.Transporte = sap.ui.getCore().getModel('MDL_Header2').oData.sNumber.match(/Nuofe='(.*?)'/)[1];
					}
					// oModelLotesList.oData.Transporte = sap.ui.getCore().getModel('MDL_Posicoes').oData[0].Nuofe;
				}

				oModelLotesList.oData.Vstel = oGVstel;
				oModelLotesList.oData.Ticket = oGTicket;
				oModelLotesList.oData.Ano = "" + year + "";
			} else {
				oCheckModel = false;
			}
			var
				strEntity = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
				sUrl = "/NewLotes?$filter=Bukrs eq '" + oModelLotesList.oData.Bukrs + "' and Transporte eq '" + oModelLotesList.oData.Transporte + "' and Ticket eq '" + oModelLotesList.oData.Ticket + "' and Ano eq '" + oModelLotesList.oData.Ano + "' and Vstel eq '" + oModelLotesList.oData.Vstel + "'",
				oModelSend = new ODataModel(strEntity, true),
				t = this,
				oDataAnt;
			oModelSend.read(sUrl, {
				success: function (oData, results) {

					if (oData.results.length > 0) {
						var
							oModelLotes = new sap.ui.model.json.JSONModel({});
						oModelLotes.setData(oData.results);
						t.getView().setModel(oModelLotes, 'MDL_NewLotes');
						sap.ui.getCore().setModel(oModelLotes, 'MDL_NewLotes');

						let QtdLotes = 0;

						for (let i = 0; oData.results.length > i; i++) {
							QtdLotes += oData.results[i].Lote_Count;
						}

						oModelQtdBobinasHeader.oData.Qtd = " " + QtdLotes + " ";
						oModelQtdBobinasHeader.setData(oModelQtdBobinasHeader.oData);
						t.getView().setModel(oModelQtdBobinasHeader, 'MDL_QtdBobinas');
						oModelQtdBobinasHeader.refresh();

						var strEntity = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
							oPicking = '002',
							sUrl = "/CheckLotes?$filter=Bukrs eq '" + oModelLotesList.oData.Bukrs + "' and Transporte eq '" + oModelLotesList.oData.Transporte + "' and Ticket eq '" + oModelLotesList.oData.Ticket + "' and Ano eq '" + oModelLotesList.oData.Ano + "' and Vstel eq '" + oModelLotesList.oData.Vstel + "' and status eq '" + oPicking + "'",
							oModelSend = new ODataModel(strEntity, true);
						oModelSend.read(sUrl, {
							success: function (oData, results) {

								oDataAnt = oData;

								/**Obter Peso Faltante - INI*/
								var oLotes = t.getView().getModel('MDL_NewLotes'),
									strEntityCheck = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
									sUrlCheck = "/Lotes?$filter=Nuofe eq '" + oData.results[0].Transporte + "' and Ticket eq '" + oData.results[0].Ticket + "'",
									oModelSendCheck = new ODataModel(strEntityCheck, true);

								oModelSendCheck.read(sUrlCheck, {
									success: function (oData, results) {


										let TotalSum = 0.000;
										let oTotalPesoBruto = 0.000;
										let oTotalLeitura = 0.000;

										const mapLotes = new Set(oDataAnt.results.map(item => item.Lote));

										oData.results.forEach(item => {
											if (mapLotes.has(item.Charg)) {
												TotalSum += parseFloat(item.QtdReal);
											}
										});

										oData.results.forEach(item => {
											if (mapLotes.has(item.Charg)) {
												oTotalPesoBruto += parseFloat(item.clabs);
											}
										});

										oData.results.forEach(item => {
											if (mapLotes.has(item.Charg)) {
												oTotalLeitura += parseFloat(item.clabs);
											}
										});

										/**Carregamento - INI*/
										var oPesoReal = 0.000;
										oData.results.forEach(item => {
											if (mapLotes.has(item.Charg)) {
												oPesoReal += parseFloat(item.clabs);
											}
										});
										PesoTotalRequerido = 0;
										if (t.getView().getModel('MDL_Posicoes') != undefined) {
											for (let i = 0; t.getView().getModel('MDL_Posicoes').oData.length > i; i++) {
												PesoTotalRequerido += parseFloat(t.getView().getModel('MDL_Posicoes').oData[i].lfimg);
											}
										} else {
											for (let i = 0; sap.ui.getCore().getModel('MDL_Posicoes').oData.length > i; i++) {
												PesoTotalRequerido += parseFloat(sap.ui.getCore().getModel('MDL_Posicoes').oData[i].lfimg);
											}
										}

										if (isNaN(oPesoReal) || isNaN(PesoTotalRequerido)) {
											var oCarregamento = 0;
										} else {
											if (oPesoReal === 0 || PesoTotalRequerido === 0) {
												oCarregamento = 0;
											} else {
												//if (oPesoReal < PesoTotalRequerido) {
												oCarregamento = (oPesoReal / PesoTotalRequerido) * 100;
												//} else if (PesoTotalRequerido < oPesoReal) {
												//	oCarregamento = (PesoTotalRequerido / oPesoReal) * 100;
												//}
											}
										}

										var sCarregamento = oCarregamento.toFixed(2);
										oModelCarregamento.oData.Carregamento = parseInt(sCarregamento);
										oModelCarregamento.setData(oModelCarregamento.oData);
										sap.ui.getCore().setModel(oModelCarregamento, 'MDL_Carregamento');
										t.getView().setModel(oModelCarregamento, 'MDL_Carregamento');
										PesoTotalRequerido = 0.000;

										/**PESO LEITURA - INI*/

										var oLeitura = t.getView().getModel('MDL_PesoLeitura');

										var oPesoLeitura = oTotalLeitura;
										if (oLeitura === undefined) {
											oModelPesoLeituraHeader.oData.PesoLeitura = '0.000';
											oModelPesoLeituraHeader.setData(oModelPesoLeituraHeader.oData);
											t.getView().setModel(oModelPesoLeituraHeader, 'MDL_PesoLeitura');
											oModelPesoLeituraHeader.refresh();
										}

										/**PESO LEITURA - FIM*/

										/**PESO BRUTO - INI */
										var oModelUnidadePesoBruto = new sap.ui.model.json.JSONModel({
											Und: '',
										});
										oModelUnidadePesoBruto.oData.Und = oData.results[0].meins;
										oModelUnidadePesoBruto.setData(oModelUnidadePesoBruto.oData);
										t.getView().setModel(oModelUnidadePesoBruto, 'MDL_UnidadePesoBruto');
										sap.ui.getCore().setModel(oModelUnidadePesoBruto, 'MDL_UnidadePesoBruto');
										oModelUnidadePesoBruto.refresh();

										oModelPesoBrutoHeader.oData.PesoBruto = " " + oTotalPesoBruto.toFixed(3) + "";
										oModelPesoBrutoHeader.setData(oModelPesoBrutoHeader.oData);
										t.getView().setModel(oModelPesoBrutoHeader, 'MDL_PesoBruto');
										oModelPesoBrutoHeader.refresh();

										/**PESO BRUTO - FIM */

										var TotalRequerido = 0.000;
										if (t.getView().getModel('MDL_Posicoes') != undefined) {
											TotalRequerido = t.getView().getModel('MDL_Posicoes').oData.reduce((total, item) => total += parseFloat(item.lfimg), 0);
										} else {
											TotalRequerido = sap.ui.getCore().getModel('MDL_Posicoes').oData.reduce((total, item) => total += parseFloat(item.lfimg), 0);
										}

										var oSumFinal = 0.000;
										oSumFinal = TotalRequerido - TotalSum;

										var oModelNewLotes = t.getView().getModel('MDL_NewLotes');
										var oNumber = 0;
										for (let i = 0; oModelNewLotes.oData.length > i; i++) {
											oNumber = oNumber + 1;
											oModelNewLotes.oData[i].Number = oNumber;
										}
										oModelNewLotes.oData.Peso = "" + oSumFinal.toFixed(3) + "";
										oModelNewLotes.setData(oModelNewLotes.oData);
										t.getView().setModel(oModelLotes, 'MDL_NewLotes');
										sap.ui.getCore().setModel(oModelLotes, 'MDL_NewLotes');

										oGMatnr = oData.results[0].Matnr;

										var oModelPesoFaltante = new sap.ui.model.json.JSONModel({ Peso: '', });
										oModelPesoFaltante.oData.Peso = "" + oSumFinal + "";
										oModelPesoFaltante.setData(oModelPesoFaltante.oData);
										t.getView().setModel(oModelPesoFaltante, 'MDL_PesoFaltante');
										sap.ui.getCore().setModel(oModelPesoFaltante, 'MDL_PesoFaltante');
										oModelPesoFaltante.refresh();

										t.bus = t.getOwnerComponent().getEventBus();
										t.bus.publish("flexible", "setDetailDetailPage");

										// 10/09/2024 Foi solicitada a retirada do popup do preenchimento da altura do palete
										 if (oCheckModel === false && t.byId("AlturaPaleteDialogID") != undefined) {
										 	t.byId("AlturaPaleteDialogID").close();
										 	t.onClear();
										 }

									},
									error: function (e) {
										var oRet = JSON.parse(e.response.body);
										MessageBox.show(oRet.error.message.value, {
											duration: 4000
										});
									}
								});
							},
							error: function (e) {
								var oRet = JSON.parse(e.response.body);
								MessageBox.show(oRet.error.message.value, {
									duration: 4000
								});
							}
						});
					}
					/**Obter Peso Faltante - FIM */
				},
				error: function (e) {
					var oRet = JSON.parse(e.response.body);
					MessageBox.show(oRet.error.message.value, {
						duration: 4000
					});
				}
			});
		},
		onListItemPressRight: function (oEvent) {

			var index = oEvent.getSource().sId.split('table1-'),
				index = index[1],
				sDataTablePressed = this.getView().getModel('MDL_NewLotes').oData[index],
				t = this,
				oView = this.getView(),
				oPicking = '002',
				strEntityCheck = "/sap/opu/odata/sap/Z_UI_TICKET_TRANSP",
				sUrlCheck = "/CheckLotes?$filter=Vbeln eq '" + sDataTablePressed.Vbeln + "' and Posnv eq '" + sDataTablePressed.Posnv + "' and status eq '" + oPicking + "' and Ticket eq '" + oGTicket + "' and Transporte eq '" + sap.ui.getCore().getModel('MDL_Posicoes').oData[0].Nuofe + "'",
				oModelSendCheck = new ODataModel(strEntityCheck, true);

			oModelSendCheck.read(sUrlCheck, {
				success: function (oData, results) {

					var oModelLotes = new sap.ui.model.json.JSONModel({});
					var oModelLotes2 = new sap.ui.model.json.JSONModel({});
					var oModelLotesQtds = new sap.ui.model.json.JSONModel({
						Qtd: '',
						s: '',
					});
					oModelLotes.setData(oData.results);
					t.getView().setModel(oModelLotes, 'MDL_LotesFornList');
					oModelLotes2.setData(oData.results[0]);
					t.getView().setModel(oModelLotes2, 'MDL_LotesFornListForn');
					oModelLotesQtds.oData.Qtd = oData.results.length;
					if (oData.results.length > 1) {
						oModelLotesQtds.oData.s = 's:';
					} else {
						oModelLotesQtds.oData.s = ':';
					}
					t.getView().setModel(oModelLotesQtds, 'MDL_Qtd_s');

					if (!t._pPopover3) {
						t._pPopover3 = Fragment.load({
							id: oView.getId(),
							name: "br.com.klabin.zewmpicking2.frags.Popover3",
							controller: t
						}).then(function (oPopover3) {
							oView.addDependent(oPopover3);
							return oPopover3
						});
					}
					t._pPopover3.then(function (oPopover3) {
						oPopover3.open();
					});
				},
				error: function (e) {
					var oRet = JSON.parse(e.response.body);
					MessageBox.show(oRet.error.message.value, {
						duration: 4000
					});
				}
			});
		},
		onClosePopover3: function (oEvent) {

			this.byId("DialogPopover3ID").close();
		},
		onFinalizarPicking: function (oEvent) {

			if (sap.ui.getCore().getModel("MDL_NewLotes") === undefined) {
				const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				const sMsgFinalizarPickingError = oResourceBundle.getText("msgFinalizarPickingError");
				MessageBox.error("" + sMsgFinalizarPickingError + "", { title: 'Erro' });
			} else {
				var oView = this.getView();
				if (!this._pFPicing) {
					this._pFPicing = Fragment.load({
						id: oView.getId(),
						name: "br.com.klabin.zewmpicking2.frags.FinalizarPicking",
						controller: this
					}).then(function (oFPicking) {
						oView.addDependent(oFPicking);
						return oFPicking
					});
				}
				this._pFPicing.then(function (oFPicking) {
					oFPicking.open();
				});
			}
		},
		onCloseFinalizarPickingFrag: function (oEvent) {
			this.byId("DialogFinalizarPickingID").close();
		},
		onCheckFinalizarPicking: function (oEvent) {

			var sInput = this.getView().byId("inputQtdBobinasContraPicking").getValue();
			//			var sQtd = sap.ui.getCore().getModel("MDL_NewLotes").getData()[0].Lote_Count;

			var sQtd = 0;
			for (let i = 0; sap.ui.getCore().getModel("MDL_NewLotes").oData.length > i; i++) {
				sQtd += sap.ui.getCore().getModel("MDL_NewLotes").getData()[i].Lote_Count;
			}
			let t = this;

			if (sInput != sQtd) {
				const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
				const sMsgQtdBobinasIncorrect = oResourceBundle.getText("msgQtdBobinasIncorrect");
				MessageBox.error("" + sMsgQtdBobinasIncorrect + "");
			} else if (sInput === "" + sQtd + "") {

				/****FAZER FINALIZAÇÃO DO PICKING AQUI - INI */
				let oDados = {
					Bukrs: oGBukrs,
					Transporte: this.getView().getModel('MDL_Posicoes').oData[0].Nuofe,
					Ticket: oGTicket,
					Ano: oGCurrentYear,
					Vstel: oGVstel
				}

				// ------------------

				var vUrl = '/sap/opu/odata/sap/ZGEWM_PCK_TRANSPTRANSF_SRV/';
				var oData = new sap.ui.model.odata.v2.ODataModel(vUrl);

				oData.create("/PickingTranspSet", oDados, {
					success: function (oData, response) {

						t.getView().byId("inputQtdBobinasContraPicking").setValue("");
						t.byId("DialogFinalizarPickingID").close();

						//ajustado
						let sDescStatus = t.onGetTextoStatus(oData.Status);
						t.onSetStatus(oData.Status, sDescStatus);

						//ini original
						// var sCStatus = '004',
						// 	sStatus = 'Picking em processamento';

						// t.onSetStatus(sCStatus, sStatus);
						//fim original

						t.onOpenDialog();

						//Desabilitar botão de finalizar Picking
						oModelSetEnableLoteFinalizarPicking.oData.flag = 'false'
						oModelSetEnableLoteFinalizarPicking.setData(oModelSetEnableLoteFinalizarPicking.oData);
						this.getView().setModel(oModelSetEnableLoteFinalizarPicking, 'MDL_SetEnableLoteFinalizarPicking');
						sap.ui.getCore().setModel(oModelSetEnableLoteFinalizarPicking, 'MDL_SetEnableLoteFinalizarPicking');
						oModelSetEnableLoteFinalizarPicking.refresh();

					},
					error: function (err) {

					}
				});
				/****FAZER FINALIZAÇÃO DO PICKING AQUI - FIM */
			}
		},
		onOpenDialog: function () {
			// load BusyDialog fragment asynchronously
			if (!this._pBusyDialog) {
				this._pBusyDialog = Fragment.load({
					name: "br.com.klabin.zewmpicking2.frags.BusyDialog",
					controller: this
				}).then(function (oBusyDialog) {
					this.getView().addDependent(oBusyDialog);
					syncStyleClass("sapUiSizeCompact", this.getView(), oBusyDialog);
					return oBusyDialog;
				}.bind(this));
			}

			this._pBusyDialog.then(function (oBusyDialog) {
				oBusyDialog.open();
				this.simulateServerRequest();
			}.bind(this));
		},

		simulateServerRequest: function () {
			// simulate a longer running operation
			iTimeoutId = setTimeout(function () {
				this._pBusyDialog.then(function (oBusyDialog) {
					oBusyDialog.close();
				});
			}.bind(this), 2000);
		},

		onDialogClosed: function (oEvent) {
			clearTimeout(iTimeoutId);
		},
		DeleteLotes: function(oEvent){
			let sOModelData = this.getView().getModel('MDL_LotesFornList');
			let aData = sOModelData.getData();
			let sLote = oEvent.getParameter("listItem").getCells()[0].mProperties.text

			if (aData && aData.length > 0) {
				
				sOModelData.setData(aData);
				this.getView().setModel(sOModelData, 'MDL_LotesFornList');
				sOModelData.refresh();

				let oQtdModel = new JSONModel();
				oQtdModel.oData.Qtd = aData.length
				this.getView().setModel(oQtdModel, 'MDL_Qtd_s');
				oQtdModel.refresh();

				var oModelQtdBobinasHeader = new JSONModel();

				oModelQtdBobinasHeader.oData.Qtd = " " + aData.length + " ";
				oModelQtdBobinasHeader.setData(oModelQtdBobinasHeader.oData);
				this.getView().setModel(oModelQtdBobinasHeader, 'MDL_QtdBobinas');
				oModelQtdBobinasHeader.refresh();

				let oModelNewLotes = this.getView().getModel('MDL_NewLotes');

				let aDataNewLotes = oModelNewLotes.getData();

				let oItem = aDataNewLotes.findIndex(function (item) {
					return item.Vbeln === aData[0].Vbeln;
				})

				oModelNewLotes.oData[oItem].Lote_Count = aData.length;
				this.getView().setModel(oModelNewLotes, 'MDL_NewLotes');
				oModelNewLotes.refresh();

				let sDataPos = sap.ui.getCore().getModel('MDL_Posicoes').oData[0];

				var oDados = {
					Transporte: '',
					Ticket: '',
					Vbeln: '',
					Posnv: '',
					Lote: '',
					ResultSet: [{
						Transporte: '',
						Ticket: '',
						Vbeln: '',
						Posnv: '',
						Lote: '',
					}]
				};

				oDados.Transporte = sDataPos.Nuofe;
				oDados.Ticket = oGTicket;
				oDados.Vbeln = sDataPos.VbelnR;
				oDados.Posnv = sDataPos.PosnnR;
				oDados.Lote = sLote;

				oDados.ResultSet.Transporte = sDataPos.Nuofe;
				oDados.ResultSet.Ticket = oGTicket;
				oDados.ResultSet.Vbeln = sDataPos.VbelnR;
				oDados.ResultSet.Posnv = sDataPos.PosnnR;
				oDados.ResultSet.Lote = sLote;

				var vUrl = '/sap/opu/odata/sap/ZGEWM_PICKING_DEL_SRV/';
				var oData = new sap.ui.model.odata.v2.ODataModel(vUrl);
				var t = this;

				let MDL_LotesTable = t.getView().byId("MDL_LotesTable")
				let index = 0
				for(let lote of MDL_LotesTable.getItems()){
					let mLote = lote.getCells()[0].mProperties.text
					if(mLote === sLote){
						break
					}else{
						index ++
					}
				}
				
				oData.create("/DeleteSet", oDados, {
					success: function (oData, response) {
						MDL_LotesTable.removeItem(index)
						t.onGetNewLote();
					}, error: function (err) {
						var oMessage = JSON.parse(err.responseText);
						sap.m.MessageBox.error(oMessage.error.innererror.errordetails[0].message);
					}
				});
			}
		},
		onDelLotes: function (oEvent) {
			let that = this
			MessageBox.warning("Deseja realmente deletar este Lote?", {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: "Deletar!",
				onClose: function (sAction) {
					if(sAction === 'OK'){
						that.DeleteLotes(oEvent)
					}
				},
				dependentOn: this.getView()
			});
		},
		onGetTextoStatus: function (sCStatus) {
			/*
				001	Inicial
				002	Em Picking
				003	Finalizado
				004	Picking em processamento
				005	Erro no particionamento de lotes
				006	Erro ao adicionar remessas ao transporte
				007	Erro ao distribuir IM
				008	Erro ao distribuir EWM
				009	Erro ao confirmar tarefa EWM
				010	Erro ao criar remessas ZSDR2086
			*/
			let sStatus;
			switch (sCStatus) {
				case '001':
					sStatus = `Inicial`;
					break;
				case '002':
					sStatus = `Em Picking`;
					break;
				case '003':
					sStatus = `Finalizado`;
					break;
				case '004':
					sStatus = `Picking em processamento`;
					break;
				case '005':
					sStatus = `Erro no particionamento de lotes`;
					break;
				case '006':
					sStatus = `Erro ao adicionar remessas ao transporte`;
					break;
				case '007':
					sStatus = `Erro ao distribuir IM`;
					break;
				case '008':
					sStatus = `Erro ao distribuir EWM`;
					break;
				case '009':
					sStatus = `Erro ao confirmar tarefa EWM`;
					break;
				case '010':
					sStatus = `Erro ao criar remessas ZSDR2086`;
					break;
				default:
					sStatus = ``;
					break;
			}
			return sStatus;
		}
	});
});
