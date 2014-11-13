////////////////////Message Resource, override this for localization//////////////////////
var MagiMsg={
    DataTableNoFound: 'DataTable {1} No Found',
    DataSchemaNoFound: 'Fatal: No data schema found for Magi-App {1}'
};

var DataResult = function(rows, totalRow){
    this.rows = rows;
    this.totalRow = totalRow;
};
var QueryCriteria = function(pageNum, pageSize, criteria, sortBy, groupBy){
    this.pageNum = pageNum ? pageNum : 1;
    this.pageSize = pageSize ? pageSize : 1;
    this.criteria = criteria;
    this.sortBy = sortBy;
    this.groupBy = groupBy;
};
var Criteria = function(left, opr, right){
	this.left= left;
	this.opr= opr,
	this.right= right
};
var CriteriaOpr= {
	'=': function(left, right){
		return left == right;
	},
	'>': function(left, right){
		return left > right;
	},
	'<': function(left, right){
		return left < right;
	},
	'startWith': function(left, right){
		return left.indexOf(right) == 0;
	},
	'icStartWith': function(left, right){
		return (new RegExp('^' + right, 'i')).test(left);
	},
	'contains': function(left, right){
		return left.indexOf(right) >= 0;
	},
	'icContains': function(left, right){
		return (new RegExp('/' + right+ '/', 'i')).test(left);
	}
};

/**
 * level: 
*/
var Log4Js= {
	levelOptions: {'debug': 1, 'info':2, 'warn':3, 'error':4, 'fatal':5},
	level: 1
};
Log4Js.debug= function(msg){
	if(Log4Js.level<=1)
		console.log(msg);
};
Log4Js.info= function(msg){
	if(Log4Js.level<=2)
		console.log(msg);
};
Log4Js.warn= function(msg){
	if(Log4Js.level<=3)
		console.log(msg);
};
Log4Js.error= function(msg){
	if(Log4Js.level<=4)
		console.log(msg);
};
Log4Js.fatal= function(msg){
	console.log(msg);
};
