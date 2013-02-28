

/**
 * @class [moduleName].client.pages.modelSQLMultilingualForm
 * @parent [moduleName].client.pages.modelSQLMultilingualForm
 * 
 *  Setup the modelSQLMultilingualForm Widget
 */

//steal('/appRAD/portal/view/modelSQLMultilingualForm.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('modelSqlMultilingualForm', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      uid:'modelSQLMultilingualForm_uuid_notGiven',
/*                      
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/                      
                };
                var options = $.extend(defaults, options);
                this._super(el, options);
                
                
                this.options = options;
                this.selectedModule = null;
                
                
                // insert our DOM elements
                this.insertDOM();
                
                
                // attach other widgets & functionality here:
                this.attachAddSQLTable();
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            attachAddSQLTable: function(){
                var self = this;

                //// Setting up which Form should be shown (DB Table vs Description)
                
                // Tab 1: create from DB
                this.$tabSQL = this.element.find('.tab-sqlmulti-createdb');
                this.$tabSQL.click(function(ev) {
                    self.$modelAddSQLTableForm.show();
                    self.$modelAddSQLTableForm.focus();
                    self.$modelAddSQLDescriptionForm.hide();
                });
                
                
                // Tab 2: create from definition
                this.$tabDescription = this.element.find('.tab-sqlmulti-definition');
                this.$tabDescription.click(function(ev){
                    self.$modelAddSQLTableForm.hide();
                    self.$modelAddSQLDescriptionForm.show();
                    //self.$modelAddSQLTableForm.focus();
                });
                
                
                // setup the Model Add - SQL - From Table form
                this.$modelAddSQLTableForm = this.element.find('#addModel-SQLMulti-DBTable');
                this.$modelAddSQLTableForm.show();
                
                this.$modelAddSQLDescriptionForm = this.element.find('#addModel-SQLMulti-Definition');
                this.$modelAddSQLDescriptionForm.hide();
                
                this.lists = {};
                
                
                

                ////  Init the DB list
                this.lists.listDB = appRAD.DBList.listIterator({});
                this.$modelAddSQLTableForm.find('#sel-multi-selectDB').appdev_dropdown({
                    dataManager:this.lists.listDB,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.selectDB]',
                    autocomplete:{
                        autoFocus:true
                    },
                    onSelection:function(ev) { 
                        self.onSelectDB(ev); 
                    },
                    dataBind:'dbName'
                });
                
                
                

                //// Init the Data Table list
                this.lists.listDBTables = appRAD.DBTable.listIterator();
                this.$modelAddSQLTableForm.find('#sel-multi-dat-selectDBTable').appdev_dropdown({
                    dataManager:this.lists.listDBTables,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.chooseDataTable]',
                    autocomplete:{
                        autoFocus:true
                    },
                    onSelection:function(obj) { 
                        self.onSelectTableData(obj); 
                    },
                    dataBind:'tableNameData'
                });
                
                
                //// Init the Data Field Pickers
                this.lists.listDBTableFieldsData = appRAD.DBTableField.listIterator();
                this.$modelAddSQLTableForm.find('#sel-multi-data-primaryKey').appdev_dropdown({
                    dataManager:this.lists.listDBTableFieldsData,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.selectPK]',
                    autocomplete:{
                        autoFocus:true
                    },
                    dataBind:'primaryKey'
                });
                
                
                
                
                //// Init the Trans Field Pickers
                this.$modelAddSQLTableForm.find('#sel-multi-trans-selectDBTable').appdev_dropdown({
                    dataManager:this.lists.listDBTables,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.chooseTransTable]',
                    autocomplete:{
                        autoFocus:true
                    },
                    onSelection:function(obj) { 
                        self.onSelectTableTrans(obj); 
                    },
                    dataBind:'tableNameTrans'
                });
                this.lists.listDBTableFieldsTrans = appRAD.DBTableField.listIterator();
                this.$modelAddSQLTableForm.find('#sel-multi-labelKey').appdev_dropdown({
                    dataManager:this.lists.listDBTableFieldsTrans,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.selectLK]',
                    autocomplete:{
                        autoFocus:true
                    },
                    dataBind:'labelKey'
                });
                
                
                
                //// Init our Form controller
                this.modelInstance = new appRAD.ModelMultilingual();
                this.$modelAddSQLTableForm.ad_form({ 
                    dataManager:this.modelInstance,
                    submit:'#btn-submit',
                    cancel:'#btn-cancel',
                    onCancel:function() {
                        self.clearSQLTableForm();
                        self.setKeyboardFocus('model-list-widget');
                        AD.Comm.Notification.publish('appRad.model.add.cancel');
                        return false; // don't have ADForm perform default cancel option
                    },
                    dataValid:function(data) { return self.dataValid(data);}
                });
                this.ADForm = this.$modelAddSQLTableForm.data('ADForm');
                
                this.modelInstance.bind('created', function(ev) {
                    // we want our form to reuse this model instance
                    // each time to 'create' a new model (not update it 
                    // the second time it is used).  So clear the model
                    // after a new one is created:
                    
                    AD.Comm.Notification.publish('appRad.model.created', this);
                    
                    self.clearSQLTableForm();
                    self.ADForm.focus();

                });
                
                
                
                
                
                
                
            },
            
            
            
            clearSQLTableForm: function() {
                
                var dbName = this.modelInstance.attr('dbName');
                this.modelInstance.clear();
                this.modelInstance.attr('dbName', dbName);
                this.modelInstance.attr('module', this.selectedModule);
                
                
                this.modelInstance.bindToForm(this.$modelAddSQLTableForm);
                
                // reset our form elements
//                self.lists.listDB.clear();
//                self.lists.listDBTables.clear();
                this.lists.listDBTableFieldsData.clear();
                this.lists.listDBTableFieldsTrans.clear();
                
                
            },
            
            
            
            dataValid: function(data) {
                
                return true;
            },
            

            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/modelSQLMultilingualForm.ejs', {}));
                
            },
            
            
            
            onSelectDB: function(obj) {
                
                if (obj) {
                    this.selectedDB = obj.id;
                    this.lists.listDBTables.findAll({dbname:obj.id});
                    this.lists.listDBTableFieldsData.clear();
                }
                
            },
            
            
            
            onSelectTableData: function(obj) {
            
                if (obj) {
                    this.selectedTableData = obj.id;
                    this.lists.listDBTableFieldsData.findAll({dbname:this.selectedDB, dbtable: this.selectedTableData});
                }
            },
            
            
            
            onSelectTableTrans: function(obj) {
            
                if (obj) {
                    this.selectedTableTrans = obj.id;
                    this.lists.listDBTableFieldsTrans.findAll({dbname:this.selectedDB, dbtable: this.selectedTableTrans});
                }
            },
            
            
            
            'appRad.module.selected subscribe': function(msg, data) {
                
                if (this.selectedModule != data.name) {
                    
                    // track the latest module that is selected.
                    this.selectedModule = data.name;
                    
                    // update our model with the currently selecte module name
                    this.modelInstance.attr('module', this.selectedModule);
                }
            }
            
            
//// To setup default functionality
/*
            '.col1 li dblclick' : function (e) {
            
                this.element.find('#someDiv').append(e);
            },
*/

//// To Add Subscriptions:
/*
            'apprad.module.selected subscribe': function(message, data) {
                // data should be { name:'[moduleName]' }
                this.module = data.name;
                this.setLookupParams({module: data.name});
            },
*/
        });
        
    }) ();

// });  // end steal
