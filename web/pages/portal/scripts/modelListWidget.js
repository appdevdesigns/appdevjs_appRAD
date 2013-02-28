/**
 *  Setup the Model List Widget
 */

steal(
        '/scripts/jQueryRotate.2.2.js'
).then(function() {


    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('modelListWidget', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
 /*                     gid:'modelListWidget_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/
                        onDelete:null,
                        
                };
                var options = $.extend(defaults, options);
 //               this._super(el, options);
                var self = this;
                
                this.options = options;
                this.selectedModule = null;
                
                
                this.listModels = appRAD.Models.listIterator();
                
                this.element.appdev_list_admin({
                    uid:'model-list-widget',
                    title:'[apprad.portal.model.list.title]',
                    buttons:{add:true},
                    dataManager:this.listModels,
                    onSelect:function(event) {  self.onSelect(event); },
                    onAdd:function(event) { return self.onAdd(event); },
//                    templateEdit:'<input data-bind="name" type="text" class="span12 option-input" placeholder="[apprad.portal.webui.pages.add.name]">'
                });
                
                this.adminList = this.element.data('appdev_list_admin');
    
            },
            
            
            
            onAdd: function(event) {
              
              AD.Comm.Notification.publish('appRad.model.add', {}); 
              this.setKeyboardFocus('model-add-widget');
              
              return false; // don't perform appdevListAdmin default action
            },

            
            
            onDelete: function(model) {
                
                console.log('Deleting element!');

                return false;  // don't try the model.destroy() action.
            },
            
            
            
            onSelect: function(event) {

                var itemName = $(event.currentTarget).find('.model-name').html();
                console.log('model list ['+itemName +'] clicked!');
            },
            
            
            
            'appRad.module.selected subscribe': function(msg, data) {
                
                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;
                    
                    this.adminList.clearList();
                    this.listModels.findAll({module:data.name});
                }
            },
            
            
            
            'appRad.model.created subscribe': function(msg, data) {
                // every time a new model is created refresh our list
                
                this.adminList.clearList();
                this.listModels.findAll({module:this.selectedModule});
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

});  // end steal
