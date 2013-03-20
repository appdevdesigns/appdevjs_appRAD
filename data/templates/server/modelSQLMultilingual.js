////
//// [ModelName]
////
//// This model is the interface to the [tableNameData] table.


(function () {
    // Pull AppDev from the global scope on NodeJS and browser and load the AppDev CommonJS module on Titanium
    var AD = (typeof AppDev === "undefined" ? (typeof global === "undefined" ? require('AppDev') : global.AD) : AppDev);
    
    // On Titanium and NodeJS, the full model definition is needed
    var extendedDefinition = typeof Titanium !== 'undefined' || typeof process !== 'undefined';
    
    var attr = {
        // Shared model attributes
        _adModule:'[module]',
        _adModel:'[ModelName]',
        id:'[primaryKey]',
        labelKey:'[labelKey]',
        _isMultilingual:true,
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
            type:'multilingual',  // 'single' | 'multilingual'
            dbName:'[dbName]',
            tables:{
                data:'[tableNameData]',
                trans:'[tableNameTrans]'
            },
            fields: {
                data: {
[propertyListData]
                },
                trans: {
[propertyListTrans]
                  
                }
            },
            primaryKey:'[primaryKey]',
            multilingualFields: [[listMultilingualFields]]
        });
    }
    
    
    var Model = AD.Model.extend("[module].[ModelName]",
    attr,
    {
        // define instance methods here.
    });
    
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        // This is a CommonJS module, so return the model
        module.exports = Model;
    }
})();