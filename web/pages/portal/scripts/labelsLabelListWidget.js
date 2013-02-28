/**
 *  Setup the labelsLabelListWidget Widget
 */

//steal('/appRAD/portal/view/labelsLabelListWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('labelsLabelListWidget', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      uid:'labelsLabelListWidget_uuid_notGiven',
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
                var self = this;
                
                     
                // attach other widgets & functionality here:
                this.listData = appRAD.LabelPath.listIterator();
//                this.modelInstance = new site.Labels();
                this.element.appdev_list_admin({
                    uid:this.options.uid,
                    title:'[apprad.portal.label.Labels]',
                    buttons:{add:false},
                    dataManager:this.listData,
//                    modelInstance:this.modelInstance,
                    onSelect:function(event, path) {  self.onSelect(event, path); },
                    templateEdit:'<input data-bind="path" type="text" class="option-input" style="width:90%" placeholder="[apprad.portal.labels.label.add.name]" >'
                });
                this.labelList = this.element.data('appdev_list_admin');
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            onSelect: function(event, model) {
                
                var data = {
                    path: model.path
                };
                
                AD.Comm.Notification.publish('appRad.labels.path.selected', data);
                
            },
            
            
            
            'appRad.module.selected subscribe': function(msg, data) {
                
                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;
                    
                    this.labelList.clearList();
                    this.listData.findAll({path:data.name});
                }
                
            }
            
            
        });
        
    }) ();

// });  // end steal
