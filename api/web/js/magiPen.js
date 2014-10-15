///////// Magi elements ////////
//MagiGrid
var MagiGrid = function(element, dataTable, options){  
    this.element = element;     
    this.dataTable = dataTable;
    this.dataRows= [];
    this.options = jQuery.extend({}, this.defaults, options);
    this.attach();

};
MagiGrid.prototype = {
  // now we define the prototype
  defaults: {
    searchable: false,
    pagable: true,
    pageSizeCustomizable: false,
      editable: false,
      sortable: true,
      columnOrderCustomizable: false,
      columnHidable: false,
      startRow: 1,
      pageSize: 10,
      fields: null,
      searchFields: null,
      sortFields: null
  },
    captionTemplate: '<h2></h2><div class="tools"></div>';
    pagerTemplate: '<ul class="pagination"><li><a href="#">«</a></li><li><a href="#">1</a></li><li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li><a href="#">6</a></li><li><a href="#">»</a></li></ul></div>',

  loadData: function(){
      //todo ajax load data
    this.dataRows= [];
    this.render();
  },

  render: function(){
      var tableElm= $(this.element).find('table');
      if(!tableElm){
         $(this.element).html('<div class="tableCaption"></div><div class="table-responsive"><table class="table"></table></div><div class="tablePager"></div>'); 
      }
      //render Caption bar
      var tableCaption= $(this.element).find('.tableCaption');
      tableCaption.html(captionTemplate);
      tableCaption.find('h2').html(this.dataTable));
      tableCaption.html(pagerTemplate);
      
      //render table
      
      if(this.dataRows.lenght>0
      
      //render pager
      var tablePager= $(this.element).find('.tablePager');
      
  }

};

// does nothing more than extend jQuery
jQuery.fn.magiGrid = function(options){
  var $magiGrid= new MagiGrid(this, options)
  return $magiGrid;
}

////////////////////MagicPen//////////////////////
var MagiPen = (function(){  
    var appName ;     
    var dataDef = {}; //$.get
    var cacheData= {};
    function alertPrivate(){
		alert(privateVar);
	}
 
	return {
		init:function(_appName){
			appName= _appName;
            dataDef = {};
            cachData= {};
		},
        getAppName: function(){ return appName; },
        getDataDef: function(){ return dataDef; },
        getCacheData: function(){ return cacheData; },
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
})();


        
////////////////////Resource//////////////////////
var MagiPenMsg={
    DataTableNoFound: 'DataTable {1} No Found'
}
        
////////////////////auto initlize//////////////////////
$(function(){
    //init app
    //init Magi DOM elements    
})
