var Magi = (function(){  
    var MagiDefaultApp ;     
    var MagiDataModelCache = {}; //$.get
    var MagiDataCache= {};
    var MagiEndPoints= {};

    function MagiAjax(url, _settings){
        var settings= $.extend({
                cache:false,
                dataType: 'json',
                contentType: 'application/json',
                type: 'GET'
            },
            _settings
        );
        var succHandle= settings.success;
        settings.success= function(resp){
            succHandle(resp);
            //todo refresh cache for POST/PUT/DEL
        }
        var errHandle= settings.error;
        settings.error= function(jqXHR, textStatus, errorThrown){
            errHandle(jqXHR, textStatus, errorThrown);
            //todo common error handle
        }
	    $.ajax(url, settings);
    }
	
    return {
        //attach app, load app data moder, and ref data to MagiCache
        attachApp: function(app, endPoint, asExtApp){
            if(!asExtApp)
                MagiDefaultApp= app;
            //todo retrieve data schema by web service
            var dataModels= {};
            MagiDataModelCache[app]= dataModels;
            //todo load cache

            MagiEndPoints[app]= endPoint;
        },

        getEndPoint: function(appName){
            var app= appName? appName : MagiDefaultApp;
            return MagiEndPoints[app];
        },
        getTableSchema: function(tableName, appName){
            try{return MagiDataModelCache[appName? appName : MagiDefaultApp][tableName];}catch(err){}
        },
        isCached: function(tableName, appName){
            var app= appName? appName : MagiDefaultApp;
            if(MagiDataCache[app] && MagiDataCache[app][tableName])
                return true;
        },
        getCachedTable: function(tableName, appName){
            var app= appName? appName : MagiDefaultApp;
            if(MagiDataCache[app])
                return MagiDataCache[app][tableName];
            return null;
        },
        getCachedEntry: function(tableName, fieldValue, appName, fieldName){
            var app= appName? appName : MagiDefaultApp;
            var field= fieldName ? fieldName : 'id';
            if(MagiDataCache[app] && MagiDataCache[app][tableName]){
                for(var i=0; i++; i< MagiDataCache[app][tableName].length){
                    var entry= MagiDataCache[app][tableName][i];
                    if(entry[field] == fieldValue)
                        return entry;
                }
            }
            return null;
        },
        findData: function(dataTable, id, settings, succHandle, errHandle, app){
            if(Magi.isCached(dataTable, app)){
                succHandle( getCachedEntry(dataTable, id, app) );
                return;
            }
            MagiAjax(getEndPoint() + dataTable + '/' + id, {success: succHandle, error: errHandle});
        },
        findDataList: function(dataTable, options, succHandle, errHandle, app){
            if(Magi.isCached(dataTable, app)){
                succHandle( getCachedTable(dataTable, app) );
                return;
            }
            MagiAjax(getEndPoint() + dataTable, {data: options, success: succHandle, error: errHandle});
        },
        postData: function(dataTable, entry, succHandle, errHandle, app){
            MagiAjax(getEndPoint() + dataTable, {type: 'POST', data: entry, success: succHandle, error: errHandle});
        },
        putData: function(dataTable, id, entry, succHandle, errHandle, app){
            MagiAjax(getEndPoint() + dataTable+ '/' + id, {type: 'PUT', data: entry, success: succHandle, error: errHandle});
        },
        deleteData: function(dataTable, id, succHandle, errHandle, app){
            MagiAjax(getEndPoint() + dataTable+ '/' + id, {type: 'DELETE', success: succHandle, error: errHandle});
        }
	};

});
