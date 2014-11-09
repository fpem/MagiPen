///////// Magi elements ////////
//MagiGrid
var MagiGrid = function(element, dataTable, options){
    this.element = element;
    this.dataTable = dataTable;
    this.options = jQuery.extend({}, this.defaults, options);
    this.dataRows= [];
};
MagiGrid.prototype = {
    // now we define the prototype
    defaults: {
        searchable: false,
        sortable: true,
        creatable: false,
        editable: false,
        deletable: false,
        pageSizeOptions: [10,15,50,200],
        columnCustomizable: false,
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
    template:'',
    captionTemplate: '<h2></h2><div class="tools"></div>',
    pagerTemplate: '<ul class="pagination"><li><a href="#">«</a></li><li><a href="#">1</a></li><li><a href="#">2</a></li><li><a href="#">3</a></li><li><a href="#">4</a></li><li><a href="#">5</a></li><li><a href="#">6</a></li><li><a href="#">»</a></li></ul></div>',

    updateData: function(){
        //todo ajax load data
        MagiDao.findDataList(this.dataTable, this.options, function(respData){
            this.dataRows= respData;
            this.render();
        });
    },

    render: function(){
        var tableElm= $(this.element).find('table');
        if(!tableElm){
            $(this.element).html('<div class="tableCaption"></div><div class="table-responsive"><table class="table"></table></div><div class="tablePager"></div>');
        }
        //render Caption bar
        var tableCaption= $(this.element).find('.tableCaption');
        tableCaption.html(captionTemplate);
        tableCaption.find('h2').html(this.dataTable);
        tableCaption.html(pagerTemplate);

        //render table

        if(this.dataRows.lenght>0 )

        //render pager
            var tablePager= $(this.element).find('.tablePager');

    },

    search: function(){

    },
    advSearch: function(){

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
};

// does nothing more than extend jQuery
jQuery.fn.magiGrid = function(options){
    var $magiGrid= new MagiGrid(this, options)
    return $magiGrid;
}


