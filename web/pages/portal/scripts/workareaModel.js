/**
 *  Setup the workareaModel Widget
 */

//steal('/appRAD/portal/view/workareaModel.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('workareaModel', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      uid:'workareaModel_uuid_notGiven'
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
                
                
                // attach other widgets & functionality here:
                
                // attach the install file list widget:
                this.element.find('#modelListWidget').model_list_widget();
                this.element.find('#modelAddWidget').model_add_widget();
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/workareaModel.ejs', {}));
                
            }
       

        });
        
    }) ();

// });  // end steal
