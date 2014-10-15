var MagiPen = (function(){  
    var defaultApp ;     
    var dataModelsCache = {}; //$.get
    var dataCache= {};
    function alertPrivate(){
		alert(privateVar);
	}
 
	return {
    //attach app, load app data moder, and ref data to MagiCache
		attachApp: function(app, asExtApp){
		  if(!asExtApp)
		    defaultApp= app;
		  var dataModels= {};//todo
		  cacheDataModels[app]= dataModels;
		},
    getDataModel: function(appName, modelName){ try{returncacheDataModels[appName][modelName];}catch(err){} },
    getData: function(dataTable, id, succHandle, failHandle){
            $.ajax({
            url: endpoint + dataTable + '/' + id,
            dataType:'json',
            cache:false,
            ;
        }),
    }
    findData: function(dataTable, options, succHandle, failHandle){          
        $.ajax({
            url: this.getUrlGet(dataTable, options),
            dataType:'json',
            timeout:3000000,
            contentType: 'application/json',
            cache:false,
            success: function(resp){
                    try {
                        if(succHandle) succHandle(resp.data);
                    } catch (err) {
                        if(failHandle) failHandle();
                    }
            },
            error: function(jqXHR, textStatus, errorThrown){
                if(failHandle) failHandle();
            }
        });
    },
    postData: function(dataTable, entry, succHandle, failHandle){
    },
    putData: function(dataTable, id, entry, succHandle, failHandle){
    },
    deleteData: function(dataTable, id, succHandle, failHandle){
    }
	}
