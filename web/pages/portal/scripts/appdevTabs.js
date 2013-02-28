/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/appdevTabs.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('appdevTabs', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
/*                        
                      gid:'appdevTabs.js_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/  
                    ul:'ul.appdev-tabs',        // a selector for our tabs
                    div:'.appdev-tab-display',  // a selector for our displayed areas when a tab is clicked
                    defaultDiv:null,            // a selector for the default Div to display
                    onSelect:null               // a callback for when a tab is clicked
                };
                var options = $.extend(defaults, options);
 //               this._super(el, options);
                
                
                this.options = options;
                
                
                // insert our DOM elements
//                this.insertDOM();
                this.tabSetup();
                
                // attach other widgets & functionality here:
                
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },
            

            
            //-----------------------------------------------------------------
            tabSetup: function() {
                // find the different parts of our TABs
                //  $divs : the areas to display when a tab it clicked
                //  $ul   : the tab bar and tabs definition <ul><li><a>tab1</a></li>...</ul>
                
                                
                
                // hide all our displayable divs
                this.$divs = this.element.find(this.options.div);
                this.$divs.hide();
                
                // choose one to display
                var first = this.options.div+':first';  // assume first div found
                if (this.options.defaultDiv) {          // if a defaultDiv is provided
                    first = this.options.defaultDiv;
                }
                var firstTab = this.element.find(first);
                firstTab.show();
                
                var tabHref = firstTab.attr('id');
                
                this.$ul = this.element.find(this.options.ul);
                
                // make sure our UL has .appdev-tabs
                this.$ul.addClass('appdev-tabs');
                
                
                // indicate which tab to display as active
                this.$ul.find('li[href='+tabHref+']').addClass('active');
                
                if (this.options.onSelect) {
                    this.options.onSelect(tabHref);
                }
            },
            
            
            
            // setup the tab click handler
            'ul.appdev-tabs li a click': function(el, event) {
                
                var $el = $(el);
                
                this.$ul.find('li').removeClass('active');

                $el.parent().addClass('active');
                var currTab = $el.attr('href');
                
                this.$divs.hide();
                $(currTab).show();
                
                
                // call the onSelect() callback if provided.
                if (this.options.onSelect) {
                    this.options.onSelect(currTab);
                }
                
                return false;
                
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
