/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/moduleInfoWidget.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
        //// Setup Widget:
        AD.Controller.extend('moduleInfoWidget', {
            
            init: function (el, options) {
                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      gid:'moduleInfoWidget_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
                };
                var options = $.extend(defaults, options);
 //               this._super(el, options);
                
                this.options = options;
                this.domInserted=false;
                this.selectedModule = null;
                
                // attach other widgets & functionality here:
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            
            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/moduleInfoWidget.ejs', {}));
				this.domInserted = true;
                
            },

            
            
            'appRad.module.selected subscribe': function(message, data) {
                if (this.selectedModule != data.name) {
                    
                    // remember this module name
                    this.selectedModule = data.name;
                    
                    // make sure our dom is created
                    if (this.domInserted != true) {
    					this.insertDOM();
    					//future expansion: should call xlateLabels to translate any labels
    					// (there currently aren't any)
    				}
                    
                    // add name
    				$('#module-name').text(data.name);
    				
    				// add icon
    				if (data.iconPath) {
    					$('#icon-img').attr('src', data.iconPath);
    				} else {
    					// load default module icon
    					$('#icon-img').attr('src', '/appRAD/portal/images/icon_application.png');
    				}
                }
            }
        });
        
    }) ();

// });  // end steal
