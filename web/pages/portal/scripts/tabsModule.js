/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/tabsModule.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('tabsModule', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
 /*                     gid:'tabsModule_uuid_notGiven',
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
                
                
                // insert our DOM elements
//                this.insertDOM();
                
                
                // attach other widgets & functionality here:
                
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            

            
            insertDOM: function() {
                
                this.element.html(this.view('/appRAD/portal/view/tabsModule.ejs', {}));
                
            },
            
            
//// To setup default functionality

            'li a click' : function (el, ev) {
            
                var $ev = $(ev.currentTarget);
                var id = $ev.attr('href');
                
                switch(id) {
                    case '#module-models':
                        this.setKeyboardFocus('model-list-widget');
                        break;
                }
                var inHere = true;
            },


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
