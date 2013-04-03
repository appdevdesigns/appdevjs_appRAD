/**
 *  Setup the Model List Widget
 */

//steal('/appRAD/portal/view/webuiLabelForm.ejs').then(function() {

    // Keep all variables and functions inside an encapsulated scope
    (function() {


        //// Setup Widget:
        AD.Controller.extend('webuiLabelForm', {


            init: function (el, options) {

                //// Setup your controller here:

                // make sure defaults are taken care of
                var defaults = {
/*
                      gid:'webuiLabelForm_uuid_notGiven',
                      dataManager:null, // the ListIterator of the data to display
                      template:null,	// view(): the default view template
                      templateEdit:null,// veiw(): the edit panel view
                      templateDelete:null, // view():  the delete confirmation view
                      title: null      // the MultilingualLabel Key for the title
*/
                    uid:'webuiLabelForm',
                    onDelete:null

                };
                var options = $.extend(defaults, options);
                this._super(el, options);


                this.options = options;
                var self = this;

                this.selectedModule = null;
                this.selectedPage = null;
                this.selectedLang = AD.Lang.Labels.getCurrLangKey();

                this.inModeDel = false;

                //// insert our DOM elements
                this.insertDOM();


                //// attach other widgets & functionality here:

                // setup our data:
                this.pageLabels = site.Labels.listIterator();
                this.dataReady(this.pageLabels, function(){
                    self.loadFromDataManager();
                });
                this.pageLabels.bind('change', this.loadFromDataManager, this);


                // add a LanguagePicker to the form
                this.languagePicker.appdev_list_languagepicker({
                    onSelect:function(langData) {  self.onLanguageSwitch(langData); }
                });


                this.busyOff();


                // Attach an ADForm to the Form entry and run it with PageLabel
                this.model = new site.Labels(); // need a model instance for create/update ops.
                this.addForm.ad_form({
                    dataManager:this.model,
                    dataValid:function(data){ return self.isValid(data);},
                    error:'.text-error',
                    submit:'#btn-save',
                    cancel:'#btn-cancel',
                    onCancel:function() {

                        self.ADForm.clear();
                        self.ADForm.focus();

                        // just need to clear the form

                        //self.addForm.hide();

                        return false;
                    }
                });

                this.ADForm = this.addForm.data('ADForm');
                this.ADForm.disable();
                this.addForm.bind('saveDone',function(event,model){

                    // clear model object
                    model.clear();

                    // reset path and language
                    model.attr('label_path',self.getLabelPath());
                    model.attr('language_code', self.selectedLang);

                    self.ADForm.clear();
                    self.ADForm.focus();

                    self.clearList();
                    self.pageLabels.refresh();
                });


///// Left Off:
///// - merge conflicts back to git and commit!



                // translate Labels
                // any DOM element that has an attrib "appdLabelKey='xxxx'" will get it's contents
                // replaced with our Label.  Careful to not put this on places that have other content!
                this.xlateLabels();
            },



            addEntry: function(model) {

//                var $tr = $('<tr>');
                var html = this.view('/appRAD/portal/view/webuiLabelForm_entry.ejs', {model:model});

                $tr = $(html); // note, this auto wraps <tr> around content!


                this.list.find('tbody:last').append($tr);


                var self = this;
                $tr.find('.ios-delete').click(function(ev){self.onDelSelect(ev);});
                $tr.find('.ios-buttons').click(function(ev){self.onDelConfirm(ev);});

                $tr.find('.pane_left').hide();
                $tr.find('.pane_rigth').hide();

                $tr.data('ad-model', model);
            },



            busyOn: function() {

                this.busyIndicator.show();
            },



            busyOff: function() {

                this.busyIndicator.hide();
            },


            clearList: function() {

                this.labelPath.html(''); // clear out our label path.
                this.list.find('tr').remove();


            },



            insertDOM: function() {
                var self = this;

                this.element.html(this.view('/appRAD/portal/view/webuiLabelForm.ejs', {}));

                // find our list of labels
                this.list = this.element.find('#webuiLabelForm-list');

                // print out our label path:
                this.labelPath = this.element.find('#webui-labelForm-labelPath');

                // language chooser for the labels we are working with:
                this.languagePicker = this.element.find('#webui-labelForm-languagePicker');


                // little spinner in title bar
                this.busyIndicator = this.element.find('.add-delete .busyicon-inline');


                // the add form
                this.addForm = this.element.find('#labels-form');


                // Buttons: on the Title bar
                this.button = {};
                this.button.del = this.element.find('#btn-del');
                this.button.del.click(function(){ self.onDel(); });

                this.button.done = this.element.find('#btn-done');
                this.button.done.click(function(){ self.onDone(); });
            },



            isValid:function(data) {

                var isValid = true;

                var listNotEmpty = ['label_key', 'label_label'];

                for(var i=0; i<listNotEmpty.length; i++) {
                    var field = listNotEmpty[i];
                    if (data[field] == '') {
                        isValid = false;
                       var labelKey = '[appRad.portal.error.Required]';
//                        var label = AD.Lang.Labels.getLabelHTML(labelKey);
                        this.ADForm.validationErrorField(field,labelKey);
                    }
                }


                return isValid;
            },



            getLabelPath: function() {

                return '/page/'+this.selectedModule+'/'+this.selectedPage;
            },



            loadEntries: function() {


                var path = this.getLabelPath();
                this.pageLabels.findAll({label_path:path, language_code:this.selectedLang});

                this.labelPath.html(path);
                this.busyOn();


                this.model.attr('label_path', path);
                this.model.attr('language_code', this.selectedLang);


                // reset the model for this form
                this.ADForm.setModel(this.model);
            },



            loadFromDataManager: function() {

                this.busyOff();

                var self = this;
                this.pageLabels.each(function(entry){

                    self.addEntry(entry);

                });


            },



            onDel: function() {

                // our [-] button was pressed

                this.inModeDel = true;

                // show all the (-) delete buttons:
                this.element.find('.pane_left').show();
                this.element.find('.panel_center').css('width','100px');

                this.button.del.hide();
                this.button.done.show();

                this.ADForm.disable();

            },



            onDelConfirm: function(event) {
                var self = this;

                var doDefault = true;

                // get the associated model object for this obj to delete
                var me = $(event.currentTarget);
                var myTR = me.parent().parent().parent();
                var rowMgr = myTR.data('ad-model');


                // if an onDelete is provided then call that
                if (this.options.onDelete) {
                    doDefault = this.options.onDelete(rowMgr);
                }

                // are we supposed to simply call the model.destroy() method?
                if (doDefault) {
                    this.busyOn();
                    var done = rowMgr.destroy();
                    $.when(done).then(function(){
                       self.busyOff();
                       myTR.remove();
                    });
                }

                event.stopPropagation();
            },



            onDelSelect: function(ev) {
                // a (-) button was pressed for a row:


                var me = $(ev.currentTarget);
                var myDelConf = me.parent().parent().parent().find('.pane_right');
 //               var myContent = me.parent().parent().parent().find('.panel_center');

                // if initial click
                var rotation = me.getRotateAngle();
                if ((rotation == '') || (rotation == 0)) {

                    // rotate me
                    me.rotate({animateTo:90, duration:500, callback: function() {
                     // show the [delete] confirmation
 //                       myContent.width('100px');
                        myDelConf.show();
                    }});


                } else {
                    // unrotate me
                    me.rotate({animateTo:0, duration:500, callback:function(){}});
                    // hide my [delete] confirmation
//                    myContent.width('110px');
                    myDelConf.hide();
                }// end if


                ev.stopPropagation();  // don't bubble up
            },



            //-----------------------------------------------------------------
            onDone: function(event) {
                // reset our delete operations

//                if (this.options.buttons.del) {


                    this.element.find('.pane_left').hide();
                    this.element.find('.ios-delete').rotate({angle:0});
                    this.element.find('.pane_right').hide();
                    this.element.find('.panel_center').width('110px');
                    this.button.done.hide();
                    this.button.del.show();

                    this.ADForm.enable();
                    this.ADForm.focus();

                    this.inModeDel = false;
//                }

                if (event) event.stopPropagation();

            },



            //------------------------------------------------------------
            /**
             * @function onKeypress
             *
             * process any keypresses that this widget cares about.
             *
             * NOTE: this only fires when this widget has been given
             * keyboard focus.
             *
             * @param {object} el
             *      DOM element that received the event
             * @param {object} event
             *      The event object that contains more info about the keypress.
             */
            onKeypress: function(el, event) {

                // this form only has a [-] option to pay attention to
                // any other entry should be handled by the always present
                // ADForm for our input form.
                switch(event.charCode) {


                    case 45: // [-]
                    case 31: // [ctl]+[-] ??
                        // [ctrl]+[-] : delete option
                        if (event.ctrlKey) {
                            if (!this.inModeDel) {
                                if (this['onDel']) this.onDel();
                            } else {
                                if (this['onDone']) this.onDone();
                            }
                        }
                        break;

                }

            },



            onLanguageSwitch: function (langData) {

                this.selectedLang = langData.language_code;

                this.clearList();
                this.loadEntries();

            },



            'appRad.module.selected subscribe': function(msg, data) {

                if (this.selectedModule != data.name) {
                    this.selectedModule = data.name;

                    this.clearList();
                    this.pageLabels.clear();  // new module so clear our data.
                    this.ADForm.disable();    // disable the form until we have a page selected
                }
            },



            'appRad.webui.pages.page.selected subscribe': function(message, page) {

                this.selectedPage = page.page;

console.log('page.selected subscription():');
                this.clearList();
                this.loadEntries();
                this.ADForm.enable();
                this.ADForm.focus();

            },



            'tr click': function(el, ev) {
                // clicking on a row will edit that data

                // get the model associated with that row
                var model = $(el).data('ad-model');

                // tell the Form to use that model.
                this.ADForm.setModel(model);


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
