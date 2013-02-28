/**
 *  Setup the labelsTranslationList Widget
 */

//steal('/appRAD/portal/view/labelsTranslationList.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {
    
    
        //// Setup Widget:
        AD.Controller.extend('labelsTranslationList', {
    
            
            init: function (el, options) {

                //// Setup your controller here:
                
                // make sure defaults are taken care of
                var defaults = {
                      uid:'labelsTranslationList_uuid_notGiven',
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
                
                
                this.selectedPath = null;
                this.selectedLangSource = 'en';
                this.selectedLangDest = 'zh-hans';
                
                
                // insert our DOM elements
                this.insertDOM();
                
                
                // attach other widgets & functionality here:
                this.listSource = site.Labels.listIterator();
                this.listDest   = site.Labels.listIterator();
                
                
                
                
                
                
                // add a LanguagePicker for the source
                this.sourceLang.appdev_list_languagepicker({
                    onSelect:function(langData) {  self.onSourceLanguageSwitch(langData); },
                    initialValue:this.selectedLangSource
                });
                
                
                // add a LanguagePicker for the destination
                this.destLang.appdev_list_languagepicker({
                    onSelect:function(langData) {  self.onDestLanguageSwitch(langData); },
                    initialValue:this.selectedLangDest
                });
                
                
                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
                
                
                this.clearList();
            },
            
            
            
            addEntry: function(model) {
                
                //              var $tr = $('<tr>');
                var html = this.view('/appRAD/portal/view/labelsTranslationList_item.ejs', {obj:model});
                  
                $tr = $(html); // note, this auto wraps <tr> around content!
                  
                
                this.list.find('tbody:last').append($tr);
                  
                  
                var self = this;
                  
                // grab busyIcon and hide
                  
                  
                  
                $tr.data('ad-model-source', model.sourceModel);
                $tr.data('ad-model-dest', model.model);
                $tr.data('ad-key', model.key);
                
            },
            
            
            clearList: function() {
                
                
                this.list.find('tr').remove();
                
                
            },
            

            
            insertDOM: function() {
                
 //               this.element.html(this.view('/appRAD/portal/view/labelsTranslationList.ejs', {}));
                
                
                
                this.sourceLang = this.element.find('#labels-language-source');
                this.destLang   = this.element.find('#labels-language-destination');
                
                this.list = this.element.find('.table');
                
            },
            
            
            
            itemBusyOff: function( $tr, errorMsg ) {
              
                errorMsg = errorMsg || { success:true };
                
                var $busyIcon = $tr.find('.item-busy');
                
                $busyIcon.find('.busyicon-inline').remove();
                
                if (errorMsg.success) {
                    $busyIcon.find('.busy-content').html( AD.Lang.Labels.getLabelHTML('[appRad.portal.labels.saved]')).css('display','inline').css('color','#00FF00');
                    $busyIcon.css('background-color','rgba(0,128,0,0.6)');
                
                } else {
                    $busyIcon.find('.busy-content').html( errorMsg.message ).css('display','inline').css('color','#FF0000');
                    $busyIcon.css('background-color','rgba(128,0,0,0.6)');
                }
                
                var removeItem = function() {
                    $busyIcon.remove();
                }
                
                window.setTimeout(removeItem, 1000);
                
            },
            
            
            
            itemBusyOn: function( $tr ) {
              
                // find Text Area & disable
                var $textArea = $tr.find('textarea');
                var $td = $textArea.parent();
                
                var height = $td.css('height');
                var width = $td.css('width');
                var h2 = (parseInt(height.replace('px','')) / 2) - 7;  // 7: 1/2 the height of the busy icon
                
                var $busyDiv = $('<div class="item-busy" style="height:'+height+'; width:'+width+'; position:absolute; background-color:rgba(128,128,128,0.5);"><div class="busy-content" style="position:absolute; top:'+h2+'px;" ><div class="busyicon-inline"></div></div></div>');
                
                // add div to make screen
                // 
                $td.prepend($busyDiv);
                
            },
            
            
            
            
            
            loadFromDataManager: function() {
                
                var self = this;
                
                // reload source labels:
                var optSource = {
                        language_code:this.selectedLangSource,
                        label_path:this.selectedPath
                }
                var sourceDone = this.listSource.findAll(optSource);
                
                
                // reload Dest Labels
                var optDest = {
                        language_code:this.selectedLangDest,
                        label_path:this.selectedPath
                }
                var destDone = this.listDest.findAll(optDest);
                
                
                // when both are complete then
                $.when(sourceDone, destDone). then(function(listSource, listDest) {
                   
                    var items = {};
                    
                    // build list of labels:
                    for (var s=0; s<listSource.length; s++ ) {
                        
                        var sourceLabel = listSource[s];
                        items[sourceLabel.label_key] = {
                                key:self.prepKey(sourceLabel.label_key),
                                sourceText: sourceLabel.label_label,
                                destText: '--',
                                sourceModel:sourceLabel
                        }
                        
                    }
                    
                    
                    // add to it dest item data:
                    for (var d=0; d<listDest.length; d++){
                        var destLabel = listDest[d];
                        
                        // does this label match an existing one from the source lis?
                        if ('undefined' != typeof items[destLabel.label_key]) {
                            
                            items[destLabel.label_key].destText = destLabel.label_label;
                            items[destLabel.label_key].model = destLabel;
                        
                        } else {
                            
                            // Hmmmm... found a dest label that !exists in source lang
                            items[destLabel.label_key] = {
                                    key:destLabel.label_key,
                                    sourceText:'--',
                                    destText: destLabel.label_label,
                                    model: destLabel
                            }
                        }
                    }
                    
                    
                    
                    // Now add each entry:
                    for (var key in items) {
                        var entry = items[key];
                        self.addEntry(entry);
                    }
                    
                    
                });
               
                
                
            },
            
            
            onSourceLanguageSwitch:function(langData) {
                
                this.selectedLangSource = langData.language_code;
                
                this.clearList();
                this.loadFromDataManager(); 
            },
            
            
            onDestLanguageSwitch:function(langData) {
                
                this.selectedLangDest = langData.language_code;
                
                this.clearList();
                this.loadFromDataManager(); 
            },
            
            
            
            prepKey: function(key) {
              
                key = key || '';
                
                var arry = key.split('.');
                return arry.join('.<br>');
            },
            
            
            
            '.labels-translation-textarea blur': function (el, ev) {
                var self = this;
                var $el = $(el);
                var $tr = $el.parent().parent();
                
                
                var value = $el.val();
                var currVal = '';
                var valOnErr = '';
                var saved = false;

                
                // if destination label model exists:
                var model = $tr.data('ad-model-dest');
                if (model) {
                    
                    currVal = model.attr('label_label');
                    if (value != currVal) {      
                        this.itemBusyOn($tr);
                        model.attr('label_label', value);
                        saved = model.save();
                        
                        valOnErr = currVal;
                    }
                    
                } else {
                    
                    if (value != '--') {
                        this.itemBusyOn($tr);
                        var sourceLabel = $tr.data('ad-model-source');
                        
                        // no model found, so need to create this instance
                        model = new site.Labels();
                        var key= sourceLabel.attr('label_key');
                        model.attr('label_label', value);
                        model.attr('label_key', key);
                        model.attr('label_path', this.selectedPath);
                        model.attr('language_code', this.selectedLangDest);
                        
                        
                        saved = model.save();
                        
                        valOnErr = '--';
                        
                        $tr.data('ad-model-dest', model);
                    }
                    
                }
                
                // did we do something?
                if (saved) {
                    
                    $.when(saved)
                        .then(function(){
                            
                            // successful operation
                            self.itemBusyOff($tr);
                        })
                        .fail(function(err) {
                            // return data to it's initial value:
                            $tr.find('textarea').val(valOnErr);
                            
                            // oops, display a brief error msg
                            self.itemBusyOff($tr, {
                                success:false,
                                message:err
                            });
                            
                        });
                }
                
            },
            
            
            'appRad.labels.path.selected subscribe': function (msg, data) {
                
                this.selectedPath = data.path;
                
                this.clearList();
                this.loadFromDataManager(); 
                
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
