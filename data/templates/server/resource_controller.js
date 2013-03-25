// [Resource] : name of the Resource
// [app] : the name of the application


// This is the Resource Definition
var log = AD.Util.Log;
var logDump = AD.Util.LogDump;
var error = AD.Util.Error;
var errorDump = AD.Util.ErrorDump;
var $ = AD.jQuery;
var db = AD.Model.Datastore;

var [Resource] = new AD.Resource('[app]', '[Resource]');
module.exports = [Resource];



//.publicLinks() : return an object representing the url definition for this resource
/*
[Resource].publicLinks = function () {
    return  {
        findAll: { method:'GET',    uri:'/[app]/[resource]',        params:{}, type:'resource' },
        findOne: { method:'GET',    uri:'/[app]/[resource]/[id]',   params:{}, type:'resource' },
        create:  { method:'POST',   uri:'/[app]/[resource]',        params:{}, type:'action' },
        update:  { method:'PUT',    uri:'/[app]/[resource]/[id]',   params:{}, type:'action' },
        destroy: { method:'DELETE', uri:'/[app]/[resource]/[id]',   params:{}, type:'action' },
    }
}
*/


//.fieldValidations() : return an object's field validations
/*
[Resource].fieldValidations = function () {
    return  {
//        object_key:['exists','notEmpty'],
//        object_pkey:['notEmpty'],
//        object_table:['notEmpty']
      }
}
*/



// .model  : which model are you associated with
//[Resource].model = AD.Model.List['[app].[Resource]'];



// .find() : the operation that performs your .model.findAll(params)
//           store your results in : res.aRAD.result = [];
//[Resource].find = function (req, res, next) { next();}



//.create() : the operation that performs your .model.create(params)
//            store your results in : res.aRAD.result = {id:newID}
//[Resource].createNext = [Resource].create;
//[Resource].create = function (req, res, next) { [Resource].createNext(req, res, next); }


//.update() : the operation that performs your .model.update(id, params)
//          store any results in : res.aRAD.result = {};
//[Resource].update = function (req, res, next) { next();}



//.destroy() : the operation that performs your .model.destroy(id, params)
//[Resource].destroy = function (req, res, next) { next();}



///// Model Events:

//.onCreated() : is called each time an instance of Attribute.model is created
//[Resource].onCreated = function (ev, modelInstance) {}


//.onUpdated() : is called each time an instance of Attribute.model is created
//[Resource].onUpdated = function (ev, modelInstance) {}


//.onDestroyed() : is called each time an instance of Attribute.model is created
//[Resource].onDestroyed = function (ev, modelInstance) {}
