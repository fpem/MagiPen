var MagiDao = (function(){
    //var MagiDefaultApp ;
    var MagiDataModels = {}; //{app : {tables: {}, i18n:{}}
    var MagiDataCache= {}; //todo create web socket to refresh data
    //var MagiEndPoints= {};
    checkEnv();
    initData();

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

    function MagiDaoException(jqXHR, textStatus, errorThrown){
        alert('Failed to Connect the backend services.')
    }

    function getMagiMsg(errType, ref){
        if(!errType)
            return MagiMsg['UnknownError'];
        var msg= MagiMsg[errType];
        if(!msg)
            return MagiMsg['UnknownError'] + ': '+ errType;
        if(ref)
            for(var i= 0; i< ref.length; i++){
                var re= eval('/{'+ (i+1) + '}/gm');
                msg= msg.replace(re, ref[i]);
            }
        return msg;
    }

    function checkEnv(){
        //todo check browser
        if( typeof MagiSetting == 'undefined' || !MagiSetting.appName || !MagiSetting.endPoint ){
            console.log('ERROR: magiConfig.js is not found or incorrect!');
            alert('ERROR: magiConfig.js is not found or incorrect!');//todo i18n
        }
    }
    //attach app, load app data moder, and ref data to MagiCache
    function initData(){
        //to do retrieve data schema by web service
        var dataModels= $.ajax({url:MagiSetting.endPoint+ 'schema',async:false, error: MagiDaoException});

        if(dataModels.length==0) {
            alert(getMagiMsg("DataSchemaNoFound", app));
            return;
        }

        MagiDataModels[app]= dataModels;
        //todo load cache
        var cacheTables= [];
        $.each( dataModels.tables, function(){
            if(this.cacheable){
                cacheTables.push(this.name);
            }
        });
        MagiDataCache[app]= cacheTables;
        console.log('Cached tables: '+ cacheTables.join());
    }

    return {

        getEndPoint: function(extModule){
            if(extModule)
                return MagiSetting.extEndPoints[extModule];
            else
                return MagiSetting.endPoint;
        },
        getDataModel: function(tableName, appName){
            var app= appName? appName : MagiSetting.appName;
            return MagiDataModels[app]
        },
        getDataTable: function(tableName, appName){
            var app= appName? appName : MagiSetting.appName;
            return MagiDataModels[app][tableName];
        },
        isCached: function(tableName, appName){
            var app= appName? appName : MagiSetting.appName;
            if(MagiDataCache[app] && MagiDataCache[app][tableName])
                return true;
        },
        getCachedTable: function(tableName, appName){
            var app= appName? appName : MagiSetting.appName;
            if(MagiDataCache[app])
                return MagiDataCache[app][tableName];
            return null;
        },
        getCachedEntry: function(tableName, fieldValue, fieldName, appName){
            var app= appName? appName : MagiSetting.appName;
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
        findDataRow: function(dataTable, id, succHandle, errHandle, app){
            if(MagiDao.isCached(dataTable, app)){
                succHandle( MagiDao.getCachedEntry(dataTable, id, app) );
                return;
            }
            MagiAjax(MagiDao.getEndPoint() + dataTable + '/' + id, {success: succHandle, error: errHandle});
        },
        findDataList: function(dataTable, options, succHandle, errHandle, app){
            if(MagiDao.isCached(dataTable, app)){
                succHandle( MagiDao.getCachedTable(dataTable, app) );
                return;
            }
            MagiAjax(MagiDao.getEndPoint(app) + dataTable, {data: options, success: succHandle, error: errHandle});
        },
        postData: function(dataTable, entry, succHandle, errHandle, app){
            MagiAjax(MagiDao.getEndPoint(app) + dataTable, {type: 'POST', data: entry, success: succHandle, error: errHandle});
        },
        putData: function(dataTable, id, entry, succHandle, errHandle, app){
            MagiAjax(MagiDao.getEndPoint(app) + dataTable+ '/' + id, {type: 'PUT', data: entry, success: succHandle, error: errHandle});
        },
        deleteData: function(dataTable, id, succHandle, errHandle, app){
            MagiAjax(MagiDao.getEndPoint(app) + dataTable+ '/' + id, {type: 'DELETE', success: succHandle, error: errHandle});
        },
        /**
         *
         * @param persistRequests  [{tableName:'xx', data: 'id or entry'}, opr: 'INSERT/UPDATE/DELETE'}]
         * @param succHandle
         * @param errHandle
         * @param app
         */
        batchPersist: function(persistRequests, succHandle, errHandle, app){
            MagiAjax(MagiDao.getEndPoint(app) + 'batchPersist', {type: 'POST', data: persistRequests, success: succHandle, error: errHandle});
        }
    };

});
