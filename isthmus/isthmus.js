//IMPORT VEGA LITE

//STYLES


function styleOptions(s) {
setTimeout( function() {

  var side = s.sidebar
  var titles = s.titles
  var widgets = s.widgetTitles
  var icon = s.appIcon
  var pop = s.popout

  $('.app-menu').css("background", `${side}`);
  $('h1').css("color", `${titles}`);
  $('.ui.sidebar.menu h1').css("color", `${titles}`);
  $('.wisconsin').css("color", `${widgets}`); 
  $('.app-icon').css("background-color", `${icon}`); 
  $('.ui.left.sidebar.popout').css("background-color", `${pop}`); 
  

}, 20)};

//ACCOUNT DEFS

function accountCreds(settings) {

  this.accountName = settings.username;
  this.apiKey = settings.apiKey;
	this.sqlURL = 'https://'+settings.username+'.carto.com/api/v2/sql?q=';
  this.exportURL = 'https://'+settings.username+'.carto.com/api/v2/sql?';
	this.jobURL = 'https://'+settings.username+'.carto.com/api/v2/sql/job/';
	this.sqlEnd = '&api_key='+settings.apiKey+'';
	this.batchEnd = '?api_key='+settings.apiKey+'';
  this.map = settings.map;

};

//TEXT QUERY

function textQuery(settings) {
  v = settings.variable
  c = settings.column
  n = settings.name
  d = settings.dropdown

  function g() {
    if (d === true) {
    var v = $("#"+n+"").val();

  } else {
    v = settings.variable
  }
    return v
  };

  var v = g();

  joined = ""

  if (v.length === 0) {
    joined = null
  }
  else {
    joined = ""+c+" IN (" + "'" + v.join("'" + ',' + "'") + "'" + ")"
  };
  return joined
}

// function timeQuery(s) {
//   var v = s.variable
//   var x = ""
//   var matt = getData(); 

//   console.log(matt)
// debugger
// $("#button").mousedown(function () { 
//   console.log(v)
//   x = getData(); 
  
// })

//   console.log(x)

// };

//CHECKBOX ARRAY

function newCheckboxList(settings) {

var list = []
var joined = ""
var sub = settings.name
var query = settings.query._query
var url = `${settings.credentials.sqlURL}WITH a AS (${query}) SELECT a.${settings.column} as name, lower(replace(a.${settings.column}, ' ', '')) as id, ${settings.aggregation}(*) from a group by a.${settings.column}, id order by ${settings.aggregation} desc${settings.credentials.sqlEnd}`


$("<div></div>").addClass(""+settings.name+"").attr("id", "checklist").appendTo( ".widget-content" );

$("."+settings.name+"").before(`
    <br></br>
    <p><b class="wisconsin">${settings.title}</b></p>
`)

$("#button").mouseup( function () {
	var query = settings.query._query
	console.log(query)
	var url = `${settings.credentials.sqlURL}WITH a as (${query}), b as (select count(*), ${settings.column} from a group by ${settings.column}) SELECT ${settings.dataset}.${settings.column} as name, lower(replace( ${settings.dataset}.${settings.column}, ' ', '')) as id, COALESCE(b.count, 0) from ${settings.dataset} LEFT JOIN b on ${settings.dataset}.${settings.column}  = b.${settings.column} group by ${settings.dataset}.${settings.column}, id, count order by coalesce desc${settings.credentials.sqlEnd}`

	$.getJSON(`${settings.credentials.sqlURL}WITH a as (${query}), b as (select count(*), ${settings.column} from a group by ${settings.column}) SELECT ${settings.dataset}.${settings.column} as name, lower(replace( ${settings.dataset}.${settings.column}, ' ', '')) as id, COALESCE(b.count, 0) from ${settings.dataset} LEFT JOIN b on ${settings.dataset}.${settings.column}  = b.${settings.column} group by ${settings.dataset}.${settings.column}, id, count order by coalesce desc${settings.credentials.sqlEnd}`, function( data ) {

		//$("."+settings.name+"").empty();

	  var items = [];

	  $.each(data.rows, function(key, val) {
			if (val.coalesce === 0) {

				items.push( "<div class=\"ui checkbox "+sub+" "+val.id+"\"> <input type=\"checkbox\" id=\""+sub+"\" value=\""+val.name+"\" tabindex=\"0\"> <label>"+val.name+" ("+val.coalesce+")</label> </div> <div class=\"smallspace\"></div>" );

			} else {

	    	items.push( "<div class=\"ui checkbox "+sub+" "+val.id+"\"> <input type=\"checkbox\" id=\""+sub+"\" checked=\"\" value=\""+val.name+"\" tabindex=\"0\"> <label>"+val.name+" ("+val.coalesce+")</label> </div> <div class=\"smallspace\"></div>" );

			}

	  });

		$("."+settings.name+"").empty()

	  $("."+settings.name+"").append(items.join(""))

	  $.each(data.rows, function(key, val) {

	  $('.ui.checkbox.'+sub+'.'+val.id+'').checkbox({
	    //fireOnInit: true,
	    onChecked: function () { list.push(''+val.name+'') },
	    onUnchecked: function () {
	      for(var i = 0; i < list.length; i++) {
	      if(list[i] == ''+val.name+'') {
	          list.splice(i, 1);
	          break;
	          }
	        }
	      }

	    });
	  });

	//return joined

	}); //END DATA FUNCTION

});



$.getJSON(`
  ${url}
  `, function( data ) {

  var items = [];

  $.each(data.rows, function(key, val) {

    items.push( "<div class=\"ui checkbox "+sub+" "+val.id+"\"> <input type=\"checkbox\" id=\""+sub+"\" checked=\"\" value=\""+val.name+"\" tabindex=\"0\"> <label>"+val.name+" ("+val.count+")</label> </div> <div class=\"smallspace\"></div>" );

  });

  $("."+settings.name+"").append(items.join(""))

  $.each(data.rows, function(key, val) {



  $('.ui.checkbox.'+sub+'.'+val.id+'').checkbox({
    fireOnInit: true,
    onChecked: function () { list.push(''+val.name+'') },
    onUnchecked: function () {
      for(var i = 0; i < list.length; i++) {
      if(list[i] == ''+val.name+'') {
          list.splice(i, 1);
          break;
          }
        }
      }

    });
  });

//return joined
console.log(query)

}); //END DATA FUNCTION

return list

};

//DROPDOWNS

//first create the dropdown, then assemble the query with input for column name, then generate the html

function newDropdown(s) {

var name = s.id;
var values = s.max;
var col = s.column;
var table = s.table;
var link = s.linked;
var urlStart = s.credentials.sqlURL
var query = s.query._query
var urlEnd = s.credentials.sqlEnd

//ADD IN AN OPTION FOR GROUPINGS & COUNTS
//ASSEMBLE URL HERE THEN PASS IN
//update it to be .html content
//ADD IN BREAKS AND TITLES

var url = ""

$("#checklist").click( function () {
	console.log('This is the dropdown working')

	var url = ""+s.credentials.sqlURL+"with a as ("+s.query._query+") select a."+col+" as name, a."+col+"  as value from a group by a."+col+" order by a."+col+" asc"+s.credentials.sqlEnd+""
	//console.log(s.query._query)
	//console.log(url)
	return url

});

$("<select></select>").attr("id", ""+name+"", "multiple", "").addClass("ui multiple search dropdown "+name+"").appendTo( ".widget-content" );

$(".ui.multiple.dropdown."+name+"").before(`
    <p><b class="wisconsin">${s.title}</b></p>
    `)
// $(".ui.multiple.dropdown."+name+"").after(`
//     <br></br>
// `)

$('.ui.multiple.dropdown.'+name+'').dropdown({
  maxSelections: values,
  fields: { name: "name", value: "value" },
  apiSettings: {
      cache: false,
      beforeSend: function(settings) {
				//console.log(query)
				var url = ""+s.credentials.sqlURL+"with a as ("+s.query._query+") select a."+col+" as name, a."+col+"  as value from a group by a."+col+" order by a."+col+" asc"+s.credentials.sqlEnd+""
        //console.log(url)
				settings.url = url
				return settings
      },
      onResponse: function(cartoResponse) {
        return {
            "success": true,
            "results": cartoResponse.rows
        };
    },
    url: url
    },
  saveRemoteData: false,
  filterRemoteData: true,
  dataType: JSON
});

};


//CHECKBOXES

function newCheckbox(settings) {

  var b = settings.name;
  var a = settings.layer;
  var map = settings.credentials.map;
  var c = settings.checked;
  var t

  function check() {

    if (c === false) {
      var t = `<input type="checkbox" name="${b}">`
    } else {
      var t = `<input type="checkbox" name="${b}" checked="">`
    }

    return t

  };

  var d = check();

  $("<div></div>").html(`
    ${d}
    <label>${settings.label}</label>
    `).addClass("ui checkbox "+settings.name+" checked").appendTo( ".widget-content" );

  $(".ui.checkbox."+b+"").before(`
    <br></br>
    <p><b class="wisconsin">${settings.title}</b></p>
    `)

  var client = new carto.Client({
    apiKey: settings.credentials.apiKey,
    username: settings.credentials.accountName
  });


$('.ui.checkbox.'+b+'').checkbox({
  fireOnInit: true,
  onChecked: function () { client.addLayers([ a ]); client.getLeafletLayer().addTo(map);},
  onUnchecked: function () { client.removeLayers([ a ]); }

});

};


//SLIDER


//RANG INPUT



function rangeInput(s) {

	var query = s.query._query
	var col = s.column
	var name = s.name
	var title = s.title
	var range = ""

$.getJSON(`${s.credentials.sqlURL}WITH a as (${query}) SELECT max(${col}) as max, min(${col}) as min from a${s.credentials.sqlEnd}`, function( data ) {

	var min = data.rows[0].min
	var max = data.rows[0].max
	console.log(min)
	console.log(max)

$("<div></div>").html(`
	<div class="ui labeled input min" id="${name}-input-min">
  <div class="ui label">
    MIN
  </div>
  <input class="${name}-input-min" type="text" id="${name}-input-min-input" placeholder="${min}" value="${min}">
	</div>

  <div class="smallspace"></div>

	<div class="ui labeled input max" id="${name}-input-max">
  <div class="ui label">
    MAX
  </div>
	<input class="${name}-input-max" type="text" id="${name}-input-max-input" placeholder="${max}" value="${max}">
	</div>
`).addClass("range").appendTo( ".widget-content" )
.attr("id", ""+name+"");

$("#"+name+"").before(`
	<br></br>
	<p><b class="wisconsin">${title}</b></p>
`)

// $('#'+name+'-input-min').keyup(function () {
//  value = $('#'+name+'-input-min').val()
//  if (value < min || value > max) {
// 	 $('#'+name+'-input-min').addClass('error');
//  } else {
// 	 $('#'+name+'-input-min').removeClass('error');
//  }
// });
//
// $('#'+name+'-input-max').keyup(function () {
//  value = $('#'+name+'-input-max').val()
//  if (value < min || value > max) {
// 	 $('#'+name+'-input-max').addClass('error');
//  } else {
// 	 $('#'+name+'-input-max').removeClass('error');
//  }
// });
styleOptions(s)
});
};


function rangeQuery(s) {

	var name = s.name
	var col = s.column

	var inMin = $('#'+name+'-input-min-input').val()
	var inMax = $('#'+name+'-input-max-input').val()

	var range = ""+col+" BETWEEN "+inMin+" AND "+inMax+""
	return range
};


//INPUT

function newInput(settings) {
  $("<div></div>").html(`
    <input type="text" id="${settings.name}-input" placeholder="${settings.placeholder}" value="${settings.start}">
    `).addClass("ui input").appendTo( ".widget-content" )
    .attr("id", ""+settings.name+"");

  $("#"+settings.name+"").before(`
    <br></br>
    <p><b class="wisconsin">${settings.title}</b></p>
    `)

var min = settings.min
var max = settings.max
var name = settings.name

 $('#'+name+'').keyup(function () {
  value = $('#'+name+'-input').val()
  if (value < min || value > max) {
    $('#'+name+'').addClass('error');
  } else {
    $('#'+name+'').removeClass('error');
  }
});
};

//AUTO STYLE


function autoStyle(settings) {

    var a = settings.layer
    var b = settings.cartocss
    var c = settings.defaultCartocss


$("<div></div>").html(`
  <p class="autostyle"><i class="marker icon"></i>   APPLY STYLE TO MAP</p>
  `).appendTo( ".widget-content" )
  .attr("id", ""+settings.name+"");

$("#"+settings.name+"").before(`
  <br></br>
  <p><b class="wisconsin">${settings.title}</b></p>
  `)

$("p.autostyle").click( function() {
  //$( this ).not().attr('class', 'autostyle');
  $( this ).toggleClass( "active" )
  $( "p.autostyle.active" ).not(this).attr('class', "autostyle")
});


var css = new carto.style.CartoCSS(`${settings.cartocss}`);

$("p.autostyle").click( function() {

  if ( this.className === "autostyle active" ) {

    a.setStyle(css);
  }
  else if ( this.className === "autostyle" ) {
    a.setStyle(c)
  }
});

}


//SOME FUNCTION TO HANDLE THE ASSEMBLY OF QUERY VARS - inputs can take the values you want to grab and assemble them if text or numeric and if null s
//NEED A FUNCTION TO GET THE VALUES OF EACH VARIABLE


function queryFactory(settings) {
  var a = settings.items;
  var join = $.grep(a, Boolean).join(" AND ")
  if (join === null || join === "") {
    var query = "SELECT * FROM "+settings.table+""
  } else {
  var query = "SELECT * FROM "+settings.table+" WHERE "+join+""
  }
  return query
}

//TIME SLIDER

//PIE CHART

//POP-UPS

//SLIDEOUT


function sidebarInfo(settings) {

$('.ui.left.sidebar.popout').html(`

<i class="inverted remove icon" style="right: 10px; top: 10px; position: absolute; padding: 3px;"></i>

${settings.content}

`);

$('.ui.left.sidebar.popout').sidebar('show');

$('.inverted.remove.icon').click(function() {
  $('.ui.left.sidebar.popout').sidebar('hide');
});


}

//HOVERS

//EXPORT

function fileExport(s) {

  $("<div></div>").html(`
  <p id="button-download" class="button button--blue">
  <button  class="ui primary button">
  <a style="color:white;" href="#">EXPORT</a>
  </button>
  `).appendTo( ".ui.sidebar.menu" );

  $("#button-download").click( function (){
  window.location=""+s.credentials.exportURL+"filename="+s.filename+"&format="+s.format+"&q="+s.query._query+""+s.credentials.sqlEnd+""
  $(this).target = "_blank";
  })

  console.log(s.query)
}

//BATCH EXPORT

function batchExport(s) {

$("<div></div>").html(`
	<div class=\"smallspace\"></div>
	<h1>${s.name}</h1>
	<p>${s.description}</p>
	<p>Enter a name for your new dataset below:</p>
	<p><i>Name must be one word with no spaces</i></p>
	<div class="ui input" >
	  <input type="text" placeholder="Dataset Name" id="datasetname">
	</div>
	<br><br />
	<p><i>Check the box below and enter an amount to return a limited dataset of .</i></p>
	<div class="ui checkbox limit">
	  <input type="checkbox" name="limit">
	  <label>Return Limited Dataset</label>
	</div>
	<br><br />
	<p>Number of records to return (Max 10,000)</p>
	<div class="ui input" id="limit-input">
	  <input type="text" placeholder="Limit" value="100" id="limit" min="0" max="10000">
	</div>
	<br><br />
	<p id="button-download" class="button button--orange">
	<button class="ui blue button batch">
	EXPORT
	</button>

	</p>
	<div id="jobs">
	</div>
`).appendTo( ".ui.sidebar.menu" );

var timers = {};

function check(job_id, $el) {

  $.ajax({
    url: ""+s.credentials.jobURL+""+ job_id +""+s.credentials.batchEnd+"",
  }).done(function (resp) {

    $el.text(JSON.stringify(resp, undefined, 2));
    $el.parent().addClass(resp.status);
    var job = resp.job_id
    if (resp.status === 'pending' || resp.status === 'running') {
      $('.ui.blue.button.batch').addClass('loading');
      $( "#jobs" )
      .html(`<div class="ui message"> <p>The data export is running. The status will update once the export is complete but do not close or refresh the page.</p><p>Job ID: ${job}</p> </div>`)
      //headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
      // $('.ui.button.cancel').click(function() {
      //   $.ajax({
      //     method: 'DELETE',
      //     url: "https://mforrest.carto.com/api/v2/sql/job/"+job+"?api_key=665b6d21a3b9c20906057414b7da378b519df141"
      //   })
      // });
     }
	    else if (resp.status === 'done') {
	      clearInterval(timers[job_id]);
	      var tablename = $('#datasetname').val();
	      var tableURL = "https://team.carto.com/u/"+s.credentials.accountName+"/dataset/"+tablename+""
	      var exportURL = ""+s.credentials.exportURL+"filename="+s.filename+"&format="+s.format+"&q="+s.query._query+""+s.credentials.sqlEnd+""
	      $('.ui.blue.button.batch').removeClass('loading');
	      $( "#jobs" ).html(`<div class="ui green message"> <p>The data export is complete. You can see your dataset <a href=${tableURL} target="_blank">here</a> or download your data <a href=${exportURL} target="_blank">here</a></p> </div>`)
	    }
	    else {
	      var job = resp.job_id
	      var errorURL = ""+s.credentials.jobURL+""+job+"?"+s.credentials.batchEnd+""
	      $( "#jobs" ).html(`<div class="ui red message"> <p>The data export failed! Please try again. If this error is persisting click <a href=${errorURL} target="_blank">this link</a> to see the error.</p><p>Job ID: ${job}</p> </div>`);
	      clearInterval(timers[job_id]);
	      $('.ui.blue.button.batch').removeClass('loading');
	    }
	  }).fail(function (err) {
	    $('.ui.blue.button.batch').removeClass('loading');
	    clearInterval(timers[job_id]);
	  });
	}
	$('.ui.blue.button.batch').click(function (evt) {
	  var tablename = $('#datasetname').val();
	  evt.preventDefault();
	  var exportSQL = s.query._query
		console.log("create table "+tablename+" as "+exportSQL+"", "select cdb_cartodbfytable('mforrest', '"+tablename+"')")
		console.log(exportSQL)
	  $.ajax({
	    method: 'POST',
	    url: "https://"+s.credentials.accountName+".carto.com/api/v2/sql/job?api_key="+s.credentials.apiKey+"" ,
	    //contentType: 'json',
	    data: {
	      query: ["create table "+tablename+" as "+exportSQL+"", "select cdb_cartodbfytable('mforrest', '"+tablename+"')"]
	    }
	  }).done(function (resp) {
	    var $result = $('<pre class="result">');
	    $('#jobs').prepend($('<div />')
	        .data('job_id', resp.job_id)
	        //.text(resp.job_id)
	        //.addClass('job')
	        .append($result)); //.on('click', check));
	    timers[resp.job_id] = setInterval(function () {
	      check(resp.job_id, $result);
	    }, 1000);
	  }).fail(function (err) {
	    // $('#error').text(err);
	  });
	  return false;
	});

}

//LASSO TOOL


function lassoTool(s) {

  var map = s.credentials.map;
  var mainquery = s.query._query
  var query = s.query
  var bbox = ""

  var drawnItems = new L.FeatureGroup().addTo(map);

  var drawControl = new L.Control.Draw({
      edit: {
            featureGroup: drawnItems,
            polygon: {
                allowIntersection: false,
                edit: false
            }
        },
        draw: {
            polygon: true,            
            polyline: false,
            line: false,
            marker: false,
            rectangle: {
                allowIntersection: false,
                showArea: true,
                metric: false,
                precision: {feet: 10, mi: 10, yd: 5}
            },
            //circle: true,
            circlemarker: false,
            polygon: {
                allowIntersection: false,
                showArea: true,
                metric: false,
                precision: {feet: 10, mi: 10, yd: 5}
            }
        },
      position: 'bottomleft'

  });

  map.addControl(drawControl);
  map.addLayer(drawnItems);



  map.on(L.Draw.Event.CREATED, e => {

    var mainquery = s.query._query

    var layer = e.layer;
    drawnItems.addLayer(layer);
    var geojson = JSON.stringify(layer.toGeoJSON().geometry)

    console.log(geojson);
    console.log('MAIN QUERY' + mainquery);

    var bbox = `St_Intersects(the_geom, St_SetSRID(St_GeomFromGeoJSON('${geojson}'), 4326))`;

    query.setQuery(`with a as (${mainquery}) select * from a where ${bbox}`)

    $("#button").mouseup( function () {
      var mainquery = s.query._query
      //var geojson = JSON.stringify(drawnItems.toGeoJSON().features[0].geometry)
      var i = drawnItems._layers
      if (jQuery.isEmptyObject(i)) {
        query.setQuery(`${mainquery}`)
      } else {
        query.setQuery(`with a as (${mainquery}) select * from a where ${bbox}`)
      }      
    });

  })

//ADD CIRCLE CONTROLS
//TURN OFF IF ONE THING IS ACTIVE

}

//TIME SERIES

function getData(e) {
  console.log(e)
  return e
};

function timeSeries(s) {

var sqlStart = s.credentials.sqlURL
var sqlEnd = s.credentials.sqlEnd
var group = s.grouping
var aggdate = s.dateAggregation
var agg = s.aggregation
var date = s.date
var col = s.numericColumn
var dataset = s.dataset
var query = s.query._query
var sql = s.query
var d = ""

var date1 = ""
var date2 = ""

$("<div></div>").addClass("bottom").insertAfter( ".fullSize" ).attr("id", "timeseries");

$('.fullSize').css("height", "60%");


var url = `${sqlStart}WITH a AS (${query}) select to_char(date_trunc('${aggdate}', ${date}), 'MM-DD-YYYY') as c_date, ${group}, ${agg}(${col}) as damage from a group by 1, 2 order by 1`

var width = document.getElementById('timeseries').offsetWidth;
var width = width - 100

var opt = {
  "padding" : 30,
  "actions" : false
}

var yourVlSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  
  "data": {"url": url, 
  "format": {
    "type": "json", "property": "rows"
  }},

  "vconcat": [{
    "width": width,
    "mark": {
      "type": "line",
      "interpolate": "monotone"
  },
    "encoding": {
      "x": {
        "field": "c_date",
        "type": "temporal",
        "scale": {"domain": {"selection": "brush"}},
        "axis": {"title": "", "format": "%b %y", "labelAngle": 0}
      },
      "y": {
        "field": "damage", 
        "type": "quantitative",
        "axis": {
          "title": ""
        },
      },
      "color": {
        "field": "railroad", 
        "type": "nominal", 
        "legend": false,
        "scale": {
          "range": ["#00AFD7", "#E0004D", "#FFC72C", "#F68D2E", "#63666A"]
        }
      }
    }
  }, {
    "width": width,
    "height": 40,
    "mark": {"type": "line",
    "interpolate": "monotone"},
    "selection": {
      "brush": {"type": "interval", "encodings": ["x"]}
    },
    "encoding": {
      "x": {
        "field": "c_date",
        "type": "temporal",
        "axis": {"format": "%b %y", "labelAngle": 0, "title": ""}
      },
      "y": {
        "field": "damage",
        "aggregate": "sum",
        "type": "quantitative",
        "axis": {"tickCount": 3, "grid": false, "title": ""}
      }
    }
  }]
}

vega.embed("#timeseries", yourVlSpec, [opt]).catch(console.error)

.then(

function (result) {

$('#timeseries').mouseup(function () {
    
    var format = d3.timeFormat("%Y-%m-%d");
    
    date1 = format(result.view.data('brush_store')[0].intervals[0].extent[0]);    
    date2 = format(result.view.data('brush_store')[0].intervals[0].extent[1]);

    d = `${date} BETWEEN '${date1}' AND '${date2}'`

    sql.setQuery(`WITH a AS (${query}) SELECT * FROM a WHERE ${d}`);
    console.log(`WITH a AS (${query}) SELECT * FROM a WHERE ${d}`)
});
});

$("#button").mouseup(function () {

var query = s.query._query

$(".bottom").empty();

var url = `${sqlStart}WITH a AS (${query}) select to_char(date_trunc('${aggdate}', ${date}), 'MM-DD-YYYY') as c_date, ${group}, ${agg}(${col}) as damage from a group by 1, 2 order by 1`

var width = document.getElementById('timeseries').offsetWidth;
var width = width - 100

var opt = {
  "padding" : 30,
  "actions" : false
}

var yourVlSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  
  "data": {"url": url, 
  "format": {
    "type": "json", "property": "rows"
  }},

  "vconcat": [{
    "width": width,
    "mark": {
      "type": "line",
      "interpolate": "monotone"
  },
    "encoding": {
      "x": {
        "field": "c_date",
        "type": "temporal",
        "scale": {"domain": {"selection": "brush"}},
        "axis": {"title": "", "format": "%b %y", "labelAngle": 0}
      },
      "y": {
        "field": "damage", 
        "type": "quantitative",
        "axis": {
          "title": ""
        },
      },
      "color": {
        "field": "railroad", 
        "type": "nominal", 
        "legend": false,
        "scale": {
          "range": ["#00AFD7", "#E0004D", "#FFC72C", "#F68D2E", "#63666A"]
        }
      }
    }
  }, {
    "width": width,
    "height": 40,
    "mark": {"type": "line",
    "interpolate": "monotone"},
    "selection": {
      "brush": {"type": "interval", "encodings": ["x"]}
    },
    "encoding": {
      "x": {
        "field": "c_date",
        "type": "temporal",
        "axis": {"format": "%b %y", "labelAngle": 0, "title": ""}
      },
      "y": {
        "field": "damage",
        "aggregate": "sum",
        "type": "quantitative",
        "axis": {"tickCount": 3, "grid": false, "title": ""}
      }
    }
  }]
}

vega.embed("#timeseries", yourVlSpec, [opt]).catch(console.error)

.then(

function (result) {

$('#timeseries').mouseup(function () {
    
    var format = d3.timeFormat("%Y-%m-%d");
    
    date1 = format(result.view.data('brush_store')[0].intervals[0].extent[0]);    
    date2 = format(result.view.data('brush_store')[0].intervals[0].extent[1]);

    d = `${date} BETWEEN '${date1}' AND '${date2}'`

    sql.setQuery(`WITH a AS (${query}) SELECT * FROM a WHERE ${d}`);
    console.log(`WITH a AS (${query}) SELECT * FROM a WHERE ${d}`)
});
});
});

// x = getData(d);
// console.log(x)
// return x

};



function assembleQuery() {
  //in each function it needs to read the values every time and run the assemble the query 
  //grabs the value from where it is run
  //assembles all the values
  //does the boolean join
  //udpates the map
}