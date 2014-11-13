var MagiDao = {	
    magiDataModels: {}, //{app : {tables: {}, i18n:{}}
    magiDataCache: {}, //todo create web socket to refresh data
    
	//to do check environment
	checkEnv: function(){
		if( typeof MagiSetting == 'undefined' || !MagiSetting.app || !MagiSetting.endPoint ){
			console.log('ERROR: magiConfig.js is not found or incorrect!');
			alert('ERROR: magiConfig.js is not found or incorrect!');//todo i18n
		}
	},		

    magiAjax: function(url, _settings){
        var settings= $.extend({
                cache:false,
                dataType: 'json',
                //contentType: 'application/json',
                type: 'GET'
            },
            _settings
        );
        settings.success= function(resp){
			if(_settings.success) _settings.success(resp);
            //todo refresh cache for POST/PUT/DEL
        };
        settings.error= function(jqXHR, textStatus, errorThrown){
            if(_settings.error) _settings.error(jqXHR, textStatus, errorThrown);
            //todo common error handle
        };
        $.ajax(url, settings);
    },

    magiDaoException: function(jqXHR, textStatus, errorThrown){
        alert('Failed to Connect the backend services.')
    },

    getMagiMsg: function(errType, ref){
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
    },

	_app: function(appName){ return appName? appName : MagiSetting.app;},

	defaultCriteria: {pageNum: 1, pageSize: 10},
		
		//load app data model, and cache data for cacheable tables
    initData: function(appName){
		var app= MagiDao._app(appName);
		MagiDao.checkEnv();
		//to do retrieve data schema by web service
		var urlDataModels= MagiSetting.endPoint + 'dataModel/'+ app;
		//var dataModels= $.get({url: urlDataModels,async:false, error: MagiDao.magiDaoException});
		MagiDao.magiAjax(urlDataModels, {async: false, error: function() { 
				alert(MagiDao.getMagiMsg("DataModelNoFound", app));
			},
			success: function(dataModels) {
				Log4Js.debug('loaded data models for app : '+ app+ ', dataModel:\n'+ dataModels);
				if(!dataModels) {
					alert(MagiDao.getMagiMsg("DataModelNoFound", app));
					return;
				}
				MagiDao.magiDataModels[app]= dataModels;
				
				//to do load cache        
				MagiDao.magiDataCache[app]= {};
				$.each( dataModels.tables, function(tableName, tableModel){
					if(tableModel.cacheable){
						MagiDao.find(tableName, null, function(dataResult){
							MagiDao.magiDataCache[app][tableName]= 
								(dataResult && dataResult.rows)? dataResult.rows : [];
						});
					}
				}); 
			}
		});
	},
	getEndPoint: function(appName){
		//if(extModule)
		//    return MagiSetting.extEndPoints[extModule];
		//else
			return MagiSetting.endPoint + 'data/'+ MagiDao._app(appName)+ '/';
	},
	getAppDataModels: function(appName){
		return MagiDao.magiDataModels[MagiDao._app(appName)];
	},
	getDataModel: function(tableName, appName){
		var appModel= MagiDao.getAppDataModels(appName);
		if(appModel && appModel.tables && appModel.tables[tableName])
			return appModel.tables[tableName];
		return null;
	},
	isCached: function(tableName, appName){
		var app= MagiDao._app(appName);
		if(MagiDao.magiDataCache[app] && MagiDao.magiDataCache[app][tableName])
			return true;
	},
	getCachedTable: function(tableName, appName){
		var app= MagiDao._app(appName);
		if(MagiDao.magiDataCache[app])
			return MagiDao.magiDataCache[app][tableName];
		return null;
	},
	getCachedEntry: function(tableName, fieldValue, fieldName, appName){
		var app= MagiDao._app(appName);
		var field= fieldName ? fieldName : 'id';
		if(MagiDao.magiDataCache[app] && MagiDao.magiDataCache[app][tableName]){
			for(var i=0; i++; i< MagiDao.magiDataCache[app][tableName].length){
				var entry= MagiDao.magiDataCache[app][tableName][i];
				if(entry[field] == fieldValue)
					return entry;
			}
		}
		return null;
	},
	findById: function(dataTable, id, succHandle, errHandle, app){
		if(MagiDao.isCached(dataTable, app)){
			succHandle( MagiDao.getCachedEntry(dataTable, id, app) );
			return;
		}
		MagiDao.magiAjax(MagiDao.getEndPoint(app) + dataTable + '/' + id, {success: succHandle, error: errHandle});
	},
	find: function(dataTable, queryCriteria, gridElement, succHandle, errHandle, app){
		if(MagiDao.isCached(dataTable, app)){
			if(succHandle) succHandle( MagiDao.getCachedTable(dataTable, app) );
			return;
		}
		MagiDao.magiAjax(MagiDao.getEndPoint(app) + dataTable, {data: queryCriteria, success: function(_dataResult){				
				// debug ---------------------
				var tableRows= _dataResult.rows;
				var rows= [];
				var qc = jQuery.extend({}, MagiDao.defaultCriteria, queryCriteria);
				if(tableRows && qc.criteria){
					var filteredRows= [];
					for(var i= 0;  i< tableRows.length; i++){
						if( CriteriaOpr[qc.criteria.opr] (tableRows[i][qc.criteria.left], qc.criteria.right) )
							filteredRows.push(tableRows[i]);
					}
					tableRows= filteredRows;
				}
				var start= (qc.pageNum-1) * qc.pageSize;
				for(var i= start; tableRows && i< tableRows.length && i< start+ qc.pageSize; i++){
					rows.push(tableRows[i]);
				}
				var dataResult= new DataResult(rows, tableRows.length);
				// debug ---------------------
				
				if(succHandle) succHandle(dataResult, gridElement);
			}, error: errHandle});
	},
	
	postData: function(dataTable, entry, succHandle, errHandle, app){
		MagiDao.magiAjax(MagiDao.getEndPoint(app) + dataTable, {type: 'POST', data: entry, success: succHandle, error: errHandle});
	},
	putData: function(dataTable, id, entry, succHandle, errHandle, app){
		MagiDao.magiAjax(MagiDao.getEndPoint(app) + dataTable+ '/' + id, {type: 'PUT', data: entry, success: succHandle, error: errHandle});
	},
	deleteData: function(dataTable, id, succHandle, errHandle, app){
		MagiDao.magiAjax(MagiDao.getEndPoint(app) + dataTable+ '/' + id, {type: 'DELETE', success: succHandle, error: errHandle});
	},
	/**
	 *
	 * @param persistRequests  [{tableName:'xx', data: 'id or entry'}, opr: 'INSERT/UPDATE/DELETE'}]
	 * @param succHandle
	 * @param errHandle
	 * @param app
	 */
	batchPersist: function(persistRequests, succHandle, errHandle, app){
		MagiDao.magiAjax(MagiDao.getEndPoint(app) + 'batchPersist', {type: 'POST', data: persistRequests, success: succHandle, error: errHandle});
	}

};

MagiDao.initData();
