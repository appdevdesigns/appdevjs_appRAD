////
//// [modelName]
////
//// This model is the interface to the [tableName] table.


(function () {
    // Pull AppDev from the global scope on NodeJS and browser and load the AppDev CommonJS module on Titanium
    var AD = (typeof AppDev === "undefined" ? (typeof global === "undefined" ? require('AppDev') : global.AD) : AppDev);

    // On Titanium and NodeJS, the full model definition is needed
    var extendedDefinition = typeof Titanium !== 'undefined' || typeof process !== 'undefined';

    var attr = {
        // Shared model attributes
        _adModule:'[module]',
        _adModel:'[modelName]',
        id:'[primaryKey]',
        labelKey:'[labelKey]',
        _isMultilingual:false,
        _relationships:{
            belongs_to:[], // array of Model Names: ['Attributeset', 'site.Viewer', ... ]
            has_many:[]    // array of Model Names
            },
        //connectionType:'server', // optional field
        cache:false
    };

    if (extendedDefinition) {
        // Extended model attributes
        AD.jQuery.extend(attr, {
            type:'single',  // 'single' | 'multilingual'
[dbName]
            dbTable:'[tableName]',
            modelFields: {
[propertyList]
            },
            primaryKey:'[primaryKey]'
        });
    }


    var Model = AD.Model.extend("[module].[modelName]",
    attr,
    {
        // define instance methods here.
    });

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        // This is a CommonJS module, so return the model
        module.exports = Model;
    }
})();