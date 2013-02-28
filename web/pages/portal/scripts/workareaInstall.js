/**
 *  Setup the workareaInstall Widget
 */

//steal('/appRAD/portal/view/workareaInstall.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('workareaInstall', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      uid:'workareaInstall_uuid_notGiven',
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
                var self = this;
                
                this.options = options;
                this.selectedModule = null;
                
                this.buttons = {};  // track the buttons on our page

                this.icons = {};    // track the icons on our page
                
                
                // insert our DOM elements
         //       this.insertDOM();
                
                
                // attach other widgets & functionality here:
                
                // attach the install file list widget:
                this.element.find('#installFileList').install_file_list_widget();
                
                this.setupSQL();
                
                this.setupLabels();

                

                
 //               listSelected.findAll();
//// Left OFF:
//// 7) update ListIterator to have .create(), .update(), .destroy() methods (use the base Model obj)
//// 8) ADForm() can we use ListIterator.create(), .update(), etc... to manage form?
//// 9) Create AD.Util.Validator()  method  (see 
//// 10) create module.error(res, ID, CONST, data);  capability
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            busyOn: function() {
                
            },
            
            
            busyOff: function() {
                console.log(' Busy Off!');
            },
            
            
            errorMessage: function(message) {
                
                console.error(message);
                
            },
            

            
            insertDOM: function() {
                
 //               this.element.html(this.view('/appRAD/portal/view/workareaInstall.ejs', {}));
                
            },
            
            
            
            onAddLabel: function(models) {
                
                var self = this;
                
                var totalOps = models.length;
                var opsDone = 0;
                
                self.icons.labelBusy.show();
                
                for (var i=0; i<models.length; i++) {
                    
                    var path = models[i].attr('path');

                    var createIt = function( path ) {
                        var created = self.listSelected.create({module:self.selectedModule, path:path});
                        $.when(created)
                            .then(function(data) { 
                                opsDone++;
                                if (opsDone >= totalOps) {
                                    self.icons.labelBusy.fadeOut('slow');
                                }
                            })
                            .fail(function(err) {
                                    self.errorMessage('Yikes!');
                            });
                    }
                    createIt(path);
                    
                }
            },
            
            
            
            onAddTable: function(models) {
                
                var self = this;
                
                var totalOps = models.length;
                var opsDone = 0;
                
                self.icons.sqlBusy.show();
                
                for (var i=0; i<models.length; i++) {
                    
                    // NOTE: we have 2 different models returning table info
                    // one reports the table name as 'name', the other 'table'
                    // depending on which one is being used to add back to the table
                    // we need to get the correct value for it here:
                    var table = models[i].attr('name') || models[i].attr('table');

                    var createIt = function( table ) {
                        var created = self.listSelectedTables.create({module:self.selectedModule, table:table});
                        $.when(created)
                            .then(function(data) { 
                                opsDone++;
                                if (opsDone >= totalOps) {
                                    self.icons.sqlBusy.fadeOut('slow');
                                }
                            })
                            .fail(function(err) {
                                    self.errorMessage('Yikes!');
                            });
                    }
                    createIt(table);
                    
                }
            },

            
            
            onRefreshLabelFiles: function () {
                var self = this;
                
                if (this.selectedModule != null) {
                    
                    // for each language installed on the system
                    var listFound = AD.Lang.getList();
                    $.when(listFound)
                        .then(function(list) {
                            self.icons.labelBusy.show();
                            var countDone = 0;
                            for (var i=0; i<list.length; i++ ) {
                                
                                appRAD.LabelExport.create({module:self.selectedModule, destLang:list[i].attr('language_code')}, function(){
                                    countDone++;
                                    if (countDone >= list.length) {
                                        self.icons.labelBusy.fadeOut('slow');
                                        AD.Comm.Notification.publish('apprad.install.files.changed', {});
                                    }
                                }, function(err){
                                   
                                    console.error('error writing files.');
                                    console.error(err);
                                    
                                    countDone++;
                                    if (countDone >= list.length) {
                                        self.icons.labelBusy.fadeOut('slow');
                                        AD.Comm.Notification.publish('apprad.install.files.changed', {});
                                    }
                                });
                            }
                            
                        })
                        .fail(function(err){
                            console.error('Could not get language list!');
                        });
                }
                
            },

            
            
            onRefreshSQL: function () {
                var self = this;
                
                if (this.selectedModule != null) {
                    

                    self.icons.sqlBusy.show();
                    
                        
                    appRAD.InstallSQLExport.create({module:self.selectedModule }, function(){
 
                        self.icons.sqlBusy.fadeOut('slow');
                        AD.Comm.Notification.publish('apprad.install.files.changed', {});
   
                    }, function(err){
                       
                        console.error('error writing SQL file.');
                        console.error(err);
                        
                        // well, go ahead and refresh the files anyway ... who knows what might have changed
                        self.icons.sqlBusy.fadeOut('slow');
                        AD.Comm.Notification.publish('apprad.install.files.changed', {});
                        
                    });
                    
                            
                }
                
            },
            
            
            
            onRemoveLabel: function(models) {
                
                var self = this;
                
                var totalOps = models.length;
                var opsDone = 0;
                
                self.icons.labelBusy.show();
                
                for (var i=0; i<models.length; i++) {
                    
                    var path = models[i].attr('path');

                    var removeIt = function( path ) {
                        var removed = self.listSelected.destroy({module:self.selectedModule, path:path});
                        $.when(removed)
                            .then(function(data) { 
                                opsDone++;
                                if (opsDone >= totalOps) {
                                    self.icons.labelBusy.fadeOut('slow');
                                }
                            })
                            .fail(function(err) {
                                    self.errorMessage('Yikes!');
                            });
                    }
                    removeIt(path);
                    
                }
            },
            
            
            
            onRemoveTable: function(models) {
                
                var self = this;
                
                var totalOps = models.length;
                var opsDone = 0;
                
                self.icons.sqlBusy.show();
                
                for (var i=0; i<models.length; i++) {
                    
                    // NOTE: see note on onAddTable()
                    var table = models[i].attr('name') || models[i].attr('table');

                    var removeIt = function( table ) {
                        var removed = self.listSelectedTables.destroy({module:self.selectedModule, table:table});
                        $.when(removed)
                            .then(function(data) { 
                                opsDone++;
                                if (opsDone >= totalOps) {
                                    self.icons.sqlBusy.fadeOut('slow');
                                }
                            })
                            .fail(function(err) {
                                    self.errorMessage('Yikes!');
                            });
                    }
                    removeIt(table);
                    
                }
            },
            
            
            
            setupLabels: function () {
                var self = this;
                
                this.listAll = appRAD.LabelPath.listIterator();
                this.listSelected = appRAD.InstallLabelPath.listIterator();
                
                this.element.find('#install-installation-labels').appdev_option_twocolumn({
                    titleCol1:'[appRad.portal.install.availLang]',
                    titleCol2:'[appRad.portal.install.selectedLang]',
                    dataManagerAll: this.listAll,
                    dataManagerSelected:this.listSelected,
                    onAdd:function(models) { self.onAddLabel(models);},
                    onRemove:function(models) { self.onRemoveLabel(models);},
                    templateView:'/appRAD/portal/view/install_label_entry.ejs'
                });
                
                

                this.buttons.refreshLabels = this.element.find('#install-labels-refresh');
                this.buttons.refreshLabels.click(function(opt1, opt2) {
                    self.onRefreshLabelFiles();
                });
                this.buttons.refreshLabels.hide();
                
                

                this.icons.labelBusy = this.element.find('#install-labels-busy');
                this.icons.labelBusy.hide();
                
            },
            
            
            
            setupSQL: function () {
                var self = this;
                
                this.sqlDBName = this.element.find('#install-sql-dbname').val();
                this.listAllTables = appRAD.DBTable.listIterator({dbname:this.sqlDBName});
                this.listSelectedTables = appRAD.InstallSQLTable.listIterator();
                
                this.element.find('#install-installation-sql').appdev_option_twocolumn({
                    titleCol1:'[apprad.portal.install.sql.allTables]',
                    titleCol2:'[apprad.portal.install.sql.selectedTables]',
                    dataManagerAll: this.listAllTables,
                    dataManagerSelected:this.listSelectedTables,
                    onAdd:function(models) { self.onAddTable(models);},
                    onRemove:function(models) { self.onRemoveTable(models);},
                    templateView:'/appRAD/portal/view/install_label_entry.ejs'  // can reuse this template
                });
                
                

                this.buttons.refreshSQL = this.element.find('#install-sql-refresh');
                this.buttons.refreshSQL.click(function(opt1, opt2) {
                    self.onRefreshSQL();
                });
                this.buttons.refreshSQL.hide();
                
                

                this.icons.sqlBusy = this.element.find('#install-sql-busy');
                this.icons.sqlBusy.hide();
                
            },
            
            
            
            
            'appRad.module.selected subscribe': function(msg, data) {
                var self = this;
                
                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;
                    
                    this.listAll.findAll({path:this.selectedModule});
                    this.listSelected.findAll({module:this.selectedModule});
                    
                    this.listAllTables.refresh();  // refresh the list
                    this.listSelectedTables.findAll({module:this.selectedModule});
                }
                
                // make sure our buttons appear now:
                this.buttons.refreshLabels.show();
                this.buttons.refreshSQL.show();
            },
            
            
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
