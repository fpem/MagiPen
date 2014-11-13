///////// Magi elements ////////
//MagiGrid
/**
Render a div as MagiGrid.
usage:
  var grid= $('#mygrid').magiGrid();
  var grid2= $('#mygrid').magiGrid('Contact', {searchable: false, pageSize: 20});
  var grid3= new MagiGrid('#mygrid');
**/

var MagiGrid = function(element, tableName, options){
	"use strict";
    this.element = element;
	if(tableName){
		this.tableName = tableName;
		this.options = jQuery.extend({}, this.defaults, options);
	}else{
		this.options = jQuery.extend({}, this.defaults, $(element).data());
		this.tableName = this.options['tableName'];
	}
    this.dataRows= [];
	this.initUI();
	//this.search();
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
    template: '<div class="row magigrid-top"><div class="col-sm-6" role="heading"></div><div class="col-sm-6 input-group" role="search" style="margin-top:25px;padding-right: 15px;"></div></div><div class="table-responsive"><table class="table table-striped table-bordered table-hover" style="margin-bottom:5px;"><thead><tr></tr></thead><tbody></tbody></table><div class="alert alert-danger" style="display:none" role="alert"></div></div><div class="row  magigrid-bottom"></div>',
    titleTemplate: '<h2>{tableName} list</h2>',
	searchTemplate: '<div class="input-group search-block"><input type="text" name="term" class="form-control pull-right" style="width:250px;"><div class="input-group-btn"><button type="button" class="btn btn-primary" onclick="MagiGrid.fireSearch(this)"><span class="glyphicon glyphicon-search"></span></button><button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" style="padding-left: 5px;padding-right:5px;"><span class="caret"></span></button><ul class="dropdown-menu dropdown-seach-colmns dropdown-menu-right" role="menu"></ul></div></div>',
	typeColumnTemplate:  'type {column} to search',
	advSearchLiTemplate: '<li><a href="#" onclick="$(this).closest(\"div[role=search]\").find(\"div.search-block\").toggle();">Advance search</a></li><li class="divider"></li>',
    advSearchTemplate: '',
    btnTemplate: '<button type="button" class="btn btn-primary" style="margin: 0 5px;">{title}</button>',
	pagerTemplate: '<div class="col-sm-6 magigrid-pager"><ul class="pagination pull-right" role="navigation" style="margin:0;"></ul></div>',
	
	
	getElement: function(){ return this.element;},
	getTableName: function(){ return this.tableName;},
	setOptions: function(options){ this.options = jQuery.extend({}, this.options, options);},
	
	initUI: function(){
		this.element.html(this.template);		
		this.element.find('div[role=heading]').html(this.titleTemplate.replace(/{tableName}/g, this.tableName));
		
		//toolbar
		if(this.options['creatable'] || this.options['editable'] || this.options['deletable'] || this.options['customizable']){		
			var toolbar= '<div class="col-sm-6 magigrid-tools">';
			if(this.options['creatable'])
				toolbar+= this.btnTemplate.replace(/{title}/, 'Create');
			if(this.options['editable'])
				toolbar+= this.btnTemplate.replace(/{title}/, 'Edit');
			if(this.options['deletable'])
				toolbar+= this.btnTemplate.replace(/{title}/, 'Delete');
			if(this.options['customizable'])
				toolbar+= this.btnTemplate.replace(/{title}/, 'Customize');
			toolbar+= '</div>';
			this.element.find('div.magigrid-bottom').append(toolbar);
		}		
		
		//pager
		if(this.options['pageSize']){ //pageable
			this.element.find('div.magigrid-bottom').append(this.pagerTemplate);
		}
		
		this.initColumns();
		this.element.find('input[name=term]').keypress(function(e) {
			if(e.which == 13) {
				MagiGrid.fireSearch(this);
			}
		}); 
	},
		
	initColumns: function(){		
		var dataModel= MagiDao.getDataModel(this.getTableName());
		if(! dataModel || ! dataModel.columns){
			this.element.find('.alert').html('Missing data definition.').show();
			return;
		}
		
		//search bar
		if(this.options['searchable'] || this.options['advSearchable']){
			this.element.find('div[role=search]').html(this.searchTemplate);
			var $dm= this.element.find('.dropdown-menu.dropdown-seach-colmns')
			for(var i=0;i< dataModel.columns.length; i++){
				var colName= dataModel.columns[i].name;
				$dm.append('<li><a href="#" onclick="MagiGrid.chgSearchField(this,\''+ colName+ '\')">type '+ colName+ ' to search</a></li>');
			}
			var defaultCol= dataModel.columns.length>1? dataModel.columns[1] : dataModel.columns[0];
			this.element.find('input[name=term]')
					.attr("placeholder", this.typeColumnTemplate.replace(/{column}/, defaultCol.name) )
					.data("column", defaultCol.name);
		}
		if(this.options['advSearchable']){		
		}
		//render column header
		var $theadTR= this.element.find('thead tr').empty();
		for(var i=0;i< dataModel.columns.length; i++){
			var colName= dataModel.columns[i].name;
			$theadTR.append('<th onclick="sortMe(this)" data-column="'+ colName+ '"><a href="#">'+ colName+ '</a><span></span></th>');
		}		
	},

    search: function(){
		var qc = this.getQueryCriteria();
		MagiDao.find(this.tableName, qc, this.element, this.renderGrid, this.renderGridMsg);		
    },
	
    cleanGrid: function(){
		$(this.element).find('tbody').empty();
        $(this.element).find('.alert').hide();	
    },
    renderGridMsg: function(msg){
        $(this.element).find('.alert').html(msg).show();	
    },
    advSearch: function(){

    },
	renderGrid: function(dataResult, gridElement){
		var $gridElement= $(gridElement);
		var $magiGrid= $(gridElement).magiGrid();
		var dataModel= MagiDao.getDataModel($magiGrid.getTableName());
		var rows= dataResult.rows;
		var pageNum= $magiGrid.options['pageNum'];;
		var totalRow= dataResult.totalRow;
		var pageSize= $magiGrid.options['pageSize'];;

		$magiGrid.cleanGrid();
		//render rows
		if(! rows){
			$gridElement.find('.alert').html('No record.').show();
			return;
		}
		var $tbody= $gridElement.find('tbody');
		for(var j=0;j< rows.length; j++){
			var r= '<tr>';
			for(var i=0;i< dataModel.columns.length; i++){
				r+= '<td>'+ rows[j][dataModel.columns[i].name]+ '</td>';
			}
			$tbody.append(r);
		}

		//render pagination
		$magiGrid.renderPager($gridElement.find('.pagination'), pageNum, pageSize, totalRow)

		$gridElement.find('tbody tr').click(function(){
			var selected= $(this).hasClass('selected');
			$gridElement.find('tr.selected').removeClass('selected');
			if(!selected)
				$(this).addClass('selected');
		});
	},

    renderPager: function(elm, pageNum, pageSize, totalRow, groupSize){
		var totalPage= Math.ceil(totalRow/pageSize);
		if(!groupSize)
			groupSize= 5;
		var groupInx= Math.floor((pageNum-1)/groupSize);//start from 0

		var $pager= $(elm).empty();
		if(pageSize>= totalRow)
			return;
		var liList= '';
		if(pageNum>1)
			liList+= '<li><a href="#" onclick="MagiGrid.jumpPage(this,1);"><span class="glyphicon glyphicon-step-backward"></span></a></li>';
		else
			liList+= '<li class="disabled"><span><span class="glyphicon glyphicon-step-backward"></span></span></li>';

		if(groupInx>0)
			liList+= '<li><a href="#" onclick="MagiGrid.jumpPage(this,'+ (groupInx*groupSize) +');">&laquo;</a></li>';
		else
			liList+= '<li class="disabled"><span>&laquo;</span></li>';
		for(var i=1; i<= groupSize; i++){
			var p= groupInx * groupSize +i;
			if( p<= totalPage && p>0){
				if(p == pageNum)
					liList+= '<li class="active"><span>'+ p +'</a></span>';
				else
					liList+='<li><a href="#" onclick="MagiGrid.jumpPage(this,'+ p +');">'+ p +'</a></li>';
			}
		}
		if(groupInx< Math.floor((totalPage-1)/groupSize))
			liList+= '<li><a href="#" onclick="MagiGrid.jumpPage(this,'+ ((groupInx+1)*groupSize+1) +');">&raquo;</a></li>';
		else
			liList+= '<li class="disabled"><span>&raquo;</span></li>';
		if(pageNum< totalPage)
			liList+= '<li><a href="#" onclick="MagiGrid.jumpPage(this,'+totalPage+');"><span class="glyphicon glyphicon-step-forward"></span></a></li>';
		else
			liList+= '<li class="disabled"><span><span class="glyphicon glyphicon-step-forward"></span></span></li>';

		$pager.append(liList);

	},
	
	getQueryCriteria: function(){
		return new QueryCriteria(this.options.pageNum, this.options.pageSize, this.options.criteria, this.options.sortBy, this.options.groupBy);
	}
};

//---------static methods:
MagiGrid.addCondition = function(me){
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
};
MagiGrid.chgOpr = function(me){
	var opr= $(me).val();
	if(opr== 'isNull' || opr== 'isNotNull')
		$(me).next('input').hide();
	else
		$(me).next('input').show();
};
MagiGrid.chgSearchField = function(me, column){
	var $m= $(me);
	var placeHolder= $m.val() ? $m.val() : $m.text();
	$m.closest('ul').find('li').removeClass('active');
	$m.closest('li').addClass('active');
	$m.closest('div.input-group').find('input[name=term]').attr("placeholder", placeHolder).data("column", column);
};
MagiGrid.toggleSearchMode = function(me){
	$(me).closest('div[role=search]').find('div.search-block').toggle();
};	
	
MagiGrid.jumpPage = function(elm, page){
	var magiGrid= $($(elm).closest('.magiGrid')).magiGrid();
	magiGrid.setOptions({'pageNum': page});
	magiGrid.search();
};
MagiGrid.fireSearch = function(elm){
	var $gridElement= $($(elm).closest('.magiGrid'));
	var magiGrid= $gridElement.magiGrid();
	var term= $.trim( $gridElement.find('input[name=term]').val() );
	var criteria= null;
	if(term.length>0){
		var column= $gridElement.find('input[name=term]').data('column');
		var opr= 'icStartWith';//$gridElement.find('select[name=opr]').val();
		criteria= new Criteria(column, opr, term);
	}
	magiGrid.setOptions({'pageNum': 1, 'criteria': criteria});
	magiGrid.search();
};

//---------static methods end

//--- bind to jQuery method
jQuery.fn.magiGrid = function(tableName, options){
	var id = $(this).attr('id');
	var magiGridObjects= $('body').data('magiGridObjects');
	if(!magiGridObjects){
		magiGridObjects= {};
	}
	
	if(!id){
		var seq= $('body').data('magiGridObjectSeq');
		seq= seq ? seq+1 : 1;
		id= 'magiGridObj'+ seq;
		$(this).attr('id', id);
		$('body').data('magiGridObjectSeq', seq);
	}
	if(magiGridObjects[id])
		return magiGridObjects[id];
		
    var grid= new MagiGrid(this, tableName, options);
	Log4Js.debug(' new MagiGrid with id: '+ id);
	magiGridObjects[id]= grid;
	$('body').data('magiGridObjects', magiGridObjects);
    return grid;
};

