///////// Magi elements ////////
//MagiGrid
/**
Render a div as MagiGrid.
usage:
  var grid= $('#mygrid').magiGrid();
  var grid2= $('#mygrid').magiGrid('Contact', {searchable: false, pageSize: 20});
  var grid3= new MagiGrid('#mygrid');
**/

var MagiGrid = function(element, dataTable, options){
    this.element = $(element);
	if(dataTable){
		this.dataTable = dataTable;
		this.options = jQuery.extend({}, this.defaults, options);
	}else{
		this.options = jQuery.extend({}, this.defaults, this.element.data());
		this.dataTable = this.options['table'];
	}
    this.dataRows= [];
	this.init();
};
MagiGrid.prototype = {
    // now we define the prototype
    defaults: {
        searchable: false,
        advSearchable: false,
        sortable: true,
        creatable: false,
        editable: false,
        deletable: false,
        customizable: false,
        pageSizeOptions: [10,15,50,200],
        hiddenColumns: null,
        searchableColumns: null,
        columnsFormatter: null,

        //below 5 for queryCriteria
        pageNum: 1,
        pageSize: 10,    // 0 for no pagination
        criteria: null,
        sortBy: null,
        groupBy: null
    },
    operations: ["=","!=",">","<",">=","<=","isNull","isNotNull","startWith","endWith","contains"],
    template:'<div class="row magigrid-top"><div class="col-sm-6" role="heading"><h2>Data list</h2></div></div><div class="table-responsive"><table class="table table-striped table-bordered table-hover" style="margin-bottom:5px;"><thead><tr></tr></thead><tbody></tbody></table><div class="alert alert-danger" style="display:none" role="alert"></div></div><div class="row  magigrid-bottom"></div>',
    searchTemplate: '<div class="col-sm-6 input-group" role="search" style="margin-top:25px;padding-right: 15px;"><div class="input-group search-block"><input type="text" class="form-control pull-right" style="width:250px;" placeholder="type name to search"><div class="input-group-btn"><button type="button" class="btn btn-primary"><span class="glyphicon glyphicon-search"></span></button><button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" style="padding-left: 5px;padding-right:5px;"><span class="caret"></span></button><ul class="dropdown-menu dropdown-menu-right" role="menu"></ul></div></div></div>',
	advSearchLiTemplate: '<li><a href="#" onclick="$(this).closest(\"div[role=search]\").find(\"div.search-block\").toggle();">Advance search</a></li><li class="divider"></li>';
    advSearchTemplate: '';
    pagerTemplate: '<ul class="pagination"><li><a href="#">«</a></li><li><a href="#">1</a></li><li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li><a href="#">6</a></li><li><a href="#">»</a></li></ul></div>',
	
	init: funciton(){
		initUI();
		search();
	},
	initUI: funciton(){
		this.element.html(template);
		if(this.options['searchable'] || this.options['advSearchable']){
			this.element.find('div.magigrid-top').append(searchTemplate);
		}
		if(this.options['advSearchable']){		
		}
		if(this.options['creatable'] || this.options['editable'] || this.options['deletable'] || this.options['customizable']){		
			var toolbar= '<div class="col-sm-6 magigrid-tools">';
			if(this.options['creatable'])
				toolbar+= '<button type="button" class="btn btn-primary">Create</button>';
			if(this.options['editable'])
				toolbar+= '<button type="button" class="btn btn-primary">Edit</button>';
			if(this.options['deletable'])
				toolbar+= '<button type="button" class="btn btn-primary">Delete</button>';
			if(this.options['customizable'])
				toolbar+= '<button type="button" class="btn btn-primary">Customize</button>';
			toolbar+= '</div>';
			this.element.find('div.magigrid-bottom').append(toolbar);
		}		
		if(this.options['pageSize']){ //pageable
			this.element.find('div.magigrid-bottom').append('<div class="col-sm-6 magigrid-pager"><ul class="pagination pull-right" role="navigation" style="margin:0;"></ul></div>');
		}
	},
    updateData: function(){
        //todo ajax load data
        MagiDao.findDataList(this.dataTable, this.options, function(respData){
            this.dataRows= respData;
            this.render();
        });
    },

    search: function(){
		var qc = this.getQueryCriteria();
		this.cleanGrid();
		MagiDao.find(this.dataTable, qc, this.renderGrid, this.renderGridMsg);		
    },
	
    cleanGrid: function(){
		this.element.find('tbody').empty();
        this.element.find('.alert').hide();	
    },
    renderGridMsg: function(msg){
        this.element.find('.alert').html(msg).show();	
    },
    advSearch: function(){

    },
	renderGrid: function(dataResult){
            var $magiGrid= this.element;
            var dataModel= $magiGrid.data('dataModel');
            var rows= $magiGrid.data('rows');
            var pageNum= $magiGrid.data('pageNum');
            var totalRow= $magiGrid.data('totalRow');
            var pageSize= $magiGrid.data('pageSize');

            $magiGrid.find('.alert').hide();
            //render column header
            if(! dataModel){
                $magiGrid.find('.alert').html('Missing data definition.').show();
                return;
            }

            var $theadTR= $magiGrid.find('thead tr').empty();
            var $tbody= $magiGrid.find('tbody').empty();
            for(var i=0;i< dataModel.columns.length; i++){
                var colName= dataModel.columns[i].name;
                $theadTR.append('<th onclick="sortMe(this)" data-key="'+ colName+ '"><a href="#">'+ colName+ '</a><span></span></th>');
            }

            //render rows
            if(! rows){
                $magiGrid.find('.alert').html('No record.').show();
                return;
            }
            var $tbody= $magiGrid.find('tbody');
            for(var j=0;j< rows.length; j++){
                var r= '<tr>';
                for(var i=0;i< dataModel.columns.length; i++){
                    r+= '<td>'+ rows[j][dataModel.columns[i].name]+ '</td>';
                }
                $tbody.append(r);
            }

            //render pagination
            rederPager($magiGrid.find('.pagination'), pageNum, pageSize, totalRow)

            $magiGrid.find('tbody tr').click(function(){
				var selected= $(this).hasClass('selected');
                $magiGrid.find$('tr.selected').removeClass('selected');
				if(!selected)
					$(this).addClass('selected');
            });
        }

    rederPager: function(elm, pageNum, pageSize, totalRow, groupSize){
            var totalPage= Math.ceil(totalRow/pageSize);
            if(!groupSize)
                groupSize= 5;
            var groupInx= Math.floor((pageNum-1)/groupSize);//start from 0

            var $pager= $(elm).empty();
            if(pageSize>= totalRow)
                return;
            var liList= '';
            if(pageNum>1)
                liList+= '<li><a href="#" onclick="jumpPage(this,1);"><span class="glyphicon glyphicon-step-backward"></span></a></li>';
            else
                liList+= '<li class="disabled"><span><span class="glyphicon glyphicon-step-backward"></span></span></li>';

            if(groupInx>0)
                liList+= '<li><a href="#" onclick="jumpPage(this,'+ (groupInx*groupSize) +');">&laquo;</a></li>';
            else
                liList+= '<li class="disabled"><span>&laquo;</span></li>';
            for(var i=1; i<= groupSize; i++){
                var p= groupInx * groupSize +i;
                if( p<= totalPage && p>0){
                    if(p == pageNum)
                        liList+= '<li class="active"><span>'+ p +'</a></span>';
                    else
                        liList+='<li><a href="#" onclick="jumpPage(this,'+ p +');">'+ p +'</a></li>';
                }
            }
            if(groupInx< Math.floor((totalPage-1)/groupSize))
                liList+= '<li><a href="#" onclick="jumpPage(this,'+ ((groupInx+1)*groupSize+1) +');">&raquo;</a></li>';
            else
                liList+= '<li class="disabled"><span>&raquo;</span></li>';
            if(pageNum< totalPage)
                liList+= '<li><a href="#" onclick="jumpPage(this,'+totalPage+');"><span class="glyphicon glyphicon-step-forward"></span></a></li>';
            else
                liList+= '<li class="disabled"><span><span class="glyphicon glyphicon-step-forward"></span></span></li>';

            $pager.append(liList);

        },
		
    addCondition: function(me){
        var $f= $(me).closest('form');
        var opr= $f.find('select[name=opr]').val();
        var c= '{'+ $f.find('select[name=field]').val() +'} '
            +  opr;
        if(opr!= 'isNull' && opr!= 'isNotNull') {
            var term = $f.find('input[name=term]').val().trim();
            if (term.length > 1)
                c += ' "' + term + '"';
        }
        var cs= $f.find('input[name=conditions]').val();
        if(cs.length>0)
            c= ' && '+ c;
        $f.find('input[name=conditions]').val(cs + c);
        $f.find('input[name=term]').val('');
    },
    chgOpr: function(me){
        var opr= $(me).val();
        if(opr== 'isNull' || opr== 'isNotNull')
            $(me).next('input').hide();
        else
            $(me).next('input').show();
    },
    changeSearchField: function(me){
        var $m= $(me);
        var placeHolder= $m.val() ? $m.val() : $m.text();
        $m.closest('ul').find('li').removeClass('active');
        $m.closest('li').addClass('active');
        $m.closest('div.input-group').find('input[type=text]').attr("placeholder", placeHolder);
    },
    toggleSearchMode: function(me){
        $(me).closest('div[role=search]').find('div.search-block').toggle();
    }
	
	getQueryCriteria: function(){
		return new QueryCriteria(this.options.pageNum, this.options.pageSize, this.options.criteria, this.options.sortBy, this.options.groupBy);
	}
};

// does nothing more than extend jQuery
jQuery.fn.magiGrid = function(dataTable,options){
    var $magiGrid= new MagiGrid(this, dataTable,options)
    return $magiGrid;
}
