/**
 *  Setup the Model SQL Form
 */

//steal('/appRAD/portal/view/modelSQLForm.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('modelSQLForm', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
/*                      
                      gid:'modelAddWidget_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/
                };
                var options = $.extend(defaults, options);
 //               this._super(el, options);
                
                
                this.options = options;
                this.selectedModule = null;
                
                
                // insert our DOM elements
                this.insertDOM();
                
                
                this.attachAddSQLTable();
                
                // attach other widgets & functionality here:
                
                this.element.hide();
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            attachAddSQLTable: function(){
                var self = this;

//// LEFT OFF:  
//// !!) Error messages not being displayed!
//// 5) refactor service & model to share common loadFromDOM(), bindToForm() 
                
                //// attach the two form selectors:
                
                // selector 1: create from DB
                this.$tabSQL = this.element.find('.tab-sql-createdb');
                this.$tabSQL.click(function(ev) {
                    self.$modelAddSQLTableForm.show();
                    self.$modelAddSQLTableForm.focus();
                    self.$modelAddSQLDescriptionForm.hide();
                });
                
                // selector 2: create from definition
                this.$tabDescription = this.element.find('.tab-sql-definition');
                this.$tabDescription.click(function(ev){
                    self.$modelAddSQLTableForm.hide();
                    self.$modelAddSQLDescriptionForm.show();
                    //self.$modelAddSQLTableForm.focus();
                });
                
                
                // setup the Model Add - SQL - From Table form
                this.$modelAddSQLTableForm = this.element.find('#addModel-SQL-DBTable');
                this.$modelAddSQLTableForm.show();
                
                this.$modelAddSQLDescriptionForm = this.element.find('#addModel-SQL-Definition');
                this.$modelAddSQLDescriptionForm.hide();
                
                this.lists = {};
                
                
                ////  Init the DB list
                this.lists.listDB = appRAD.DBList.listIterator({});
                this.$modelAddSQLTableForm.find('#sel-selectDB').appdev_dropdown({
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
                
                
                //// Init the Table list
                this.lists.listDBTables = appRAD.DBTable.listIterator();
                this.$modelAddSQLTableForm.find('#sel-selectDBTable').appdev_dropdown({
                    dataManager:this.lists.listDBTables,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.chooseTable]',
                    autocomplete:{
                        autoFocus:true
                    },
                    onSelection:function(obj) { 
                        self.onSelectTable(obj); 
                    },
                    dataBind:'tableName'
                });
                
                
                //// Init the Field Pickers
                this.lists.listDBTableFields = appRAD.DBTableField.listIterator();
                this.$modelAddSQLTableForm.find('#sel-primaryKey').appdev_dropdown({
                    dataManager:this.lists.listDBTableFields,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.selectPK]',
                    autocomplete:{
                        autoFocus:true
                    },
                    dataBind:'primaryKey'
                });
                
                this.$modelAddSQLTableForm.find('#sel-labelKey').appdev_dropdown({
                    dataManager:this.lists.listDBTableFields,
                    placeholder:'[apprad.portal.model.addwidget.sql.table.selectLK]',
                    autocomplete:{
                        autoFocus:true
                    },
                    dataBind:'labelKey'
                });
                
                
                
                //// Init our Form controller
                this.modelInstance = new appRAD.Models();
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
                this.lists.listDBTableFields.clear();
                
                
            },
            
            
            
            dataValid: function(data) {
                var isValid = true;
                var labelKey = '[appRad.portal.error.Required]';
                
                var required = ['dbName', 'labelKey', 'modelName', 'module', 'primaryKey', 'tableName'];
                for (var i=0; i< required.length; i++) {
                    var field = required[i];
                    if ((data[field] == '') || (data[field]==null)){
                        isValid = false;
                        this.ADForm.validationErrorField(field,labelKey);
                    }
                }
                
                return isValid;
            },

            
            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/modelSQLForm.ejs', {}));
                
            },
            
            
            
            onSelectDB: function(obj) {
                
                if (obj) {
                    this.selectedDB = obj.id;
                    this.lists.listDBTables.findAll({dbname:obj.id});
                    this.lists.listDBTableFields.clear();
                }
                
            },
            
            
            
            onSelectTable: function(obj) {
            
                if (obj) {
                    this.selectedTable = obj.id;
                    this.lists.listDBTableFields.findAll({dbname:this.selectedDB, dbtable: this.selectedTable});
                }
            },
            
            
            
            'appRad.model.add subscribe': function(msg, data) {
                // listen for this and show our widget 
                
                // if we are not already visible
                if (!this.element.is(':visible')) {
                    
                    this.element.show();
                    this.$modelAddSQLTableForm.focus();
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

        });
        
    }) ();

// });  // end steal
