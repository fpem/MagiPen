////////////////////Message Resource, override this for localization//////////////////////
var MagiMsg={
    DataTableNoFound: 'DataTable {1} No Found',
    DataSchemaNoFound: 'Fatal: No data schema found for Magi-App {1}'
}


var DataResult = function(rows, totalRow){
    this.rows = rows;
    this.totalRow = totalRow;
}
var QueryCriteria = function(pageNum, pageSize, criteria, sortBy, groupBy){
    this.pageNum = pageNum ? pageNum : 1;
    this.pageSize = pageSize ? pageSize : 1;
    this.criteria = criteria;
    this.sortBy = sortBy;
    this.groupBy = groupBy;
}
