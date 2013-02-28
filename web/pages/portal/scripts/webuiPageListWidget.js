/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/webuiPageListWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('webuiPageListWidget', {
    
            
            init: function (el, options) {

                var self = this;
                
                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
/*                        
                      gid:'webuiPageListWidget_uuid_notGiven',
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
                
                
                
                this.listPages = appRAD.Pages.listIterator();
                this.modelInstance = new appRAD.Pages();
                this.element.appdev_list_admin({
                    uid:this.options.uid,
                    title:'[apprad.portal.webui.Pages]',
                    buttons:{add:true},
                    dataManager:this.listPages,
                    modelInstance:this.modelInstance,
                    onSelect:function(event, page) {  self.onSelect(event, page); },
                    templateEdit:'<input data-bind="page" type="text" class="span12 option-input" placeholder="[apprad.portal.webui.pages.add.name]">'
                });
                this.pageList = this.element.data('appdev_list_admin');
                
                this.element.bind('addDone', function(ev, model) {
                    // clear current list
                    self.pageList.clearList();
                    
                    // refresh our listPages
                    self.listPages.findAll({module:self.selectedModule}); 
                });
                
                // insert our DOM elements
//                this.insertDOM();
                
                
                // attach other widgets & functionality here:
                
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            

            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/webuiPageListWidget.ejs', {}));
                
            },
            
            
            
            onSelect: function(event, page) {
                var data = {
                	module: this.selectedModule,
                	page: page.name
                };
                
                AD.Comm.Notification.publish('appRad.webui.pages.page.selected', data);

            },
            
            
            
            'appRad.module.selected subscribe': function(msg, data) {
                
                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;
                    
                    this.pageList.clearList();
                    this.listPages.findAll({module:this.selectedModule});
                    
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
