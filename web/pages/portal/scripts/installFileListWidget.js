/**
 *  Setup the installFileListWidget Widget
 */

//steal('/appRAD/portal/view/installFileListWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('installFileListWidget', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      uid:'installFileListWidget_uuid_notGiven',
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
                
                
                
                // attach other widgets & functionality here:
                this.listFiles = appRAD.InstallFile.listIterator();
                this.element.appdev_list_admin({
                    uid:this.options.uid,
                    title:'[apprad.portal.install.Files]',
                    buttons:{add:false},
                    dataManager:this.listFiles,
//                    modelInstance:this.modelInstance,
                    onSelect:function(event, page) {
                        console.log('page was selected '+page.name);
                    },
                    customButtons: [
                        {
                            buttonClass: 'icon-upload',
                            buttonName: '[site.button.Import]',
                            buttonHandler: function(listSelected){
                                
                                // This is the import routine.
                                // we can import label.po files, (and eventually) .sql files
                                if (listSelected.length > 0) self.fileList.icons.busy.show();
                                var opsComplete = 0;
                                
                                var path = '/'+self.selectedModule+'/install/data';
                                
                                // foreach file selected,
                                for (var f=0; f<listSelected.length; f++) {
                                    
                                    var fileName = listSelected[f].attr('name');;
                                
                                    // if file is a label import (has .po)
                                    if (fileName.indexOf('.po') !== -1) {
                                        
                                        appRAD.LabelImport.create({ file:fileName, path:path},
                                                function(data) {
                                                    opsComplete++;
                                                    if (opsComplete >= listSelected.length)
                                                        self.fileList.icons.busy.hide();
                                            
                                                }, function(err){
                                                    
                                                    opsComplete++;
                                                    if (opsComplete >= listSelected.length)
                                                        self.fileList.icons.busy.fadeOut('slow');
                                                    
                                                    console.error(err);
                                                });
                                         
                                    }// end if
                                }// next file
                                
                            } // buttonHandler()
                        }
                    ]
//                    templateEdit:'<input data-bind="page" type="text" class="span12 option-input" placeholder="[apprad.portal.webui.pages.add.name]">'
                });
                this.fileList = this.element.data('appdev_list_admin');
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            'appRad.module.selected subscribe': function(msg, data) {
                
                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;
                    
                    this.fileList.clearList();
                    this.listFiles.findAll({module:this.selectedModule});
                }
    
            },
            
            
            
            'apprad.install.files.changed subscribe': function(msg, data) {
                
                if (this.selectedModule) {
                    
                    this.fileList.clearList();
                    this.listFiles.findAll({module:this.selectedModule});
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
