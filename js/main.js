
/* 	

*				<コ:彡

*	digital library services / university of kentucky
	digitization progress visualization
* 	License: MIT
 	https://github.com/misoproject/dataset/blob/master/LICENSE-MIT 
* 	(c) 2013
 	nabil kashyap (nabilk.com)
*

*/


// container for entire app
var DLSapp = {

	index: function() {

		var key1 = "0Ah0k7Gw2Z7y1dFo1RTNaTjJmd295dHZRcDdVcjJZdUE";
		var key2 = "0AqAqvqKN28wbdHctVDdfU2NxMlN3amlEM3ZUaW50ZGc";
		var key3 ="0Ah0k7Gw2Z7y1dHlaTWlvNm44S2RkaU1TWmdQcTloOGc";
	 
	// gathers data according to Miso dataset library (misoproject.com)
		DLSapp.data = new Miso.Dataset({

			url: 'https://docs.google.com/spreadsheet/pub?key=' + key3 + '&output=csv',
			delimiter: ",",
			columns: [ {name : "date", type : "time", format : "MM/DD/YYYY"}]

		 	// importer : Miso.Dataset.Importers.GoogleSpreadsheet,
		 	// parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
		  	// 	key : key3,
		  	// 	worksheet : "1"

			});

		DLSapp.data.fetch({ 

		  success : function() {

			var dlsData = this.toJSON();
			if(dlsData.length > 0) $("#loading").css("display", "none");

	// updates data / draws chart once
			DLSapp.optionsRender(dlsData);
			DLSapp.draw(dlsData);
			DLSapp.state(dlsData);

		  },
		
		  error : function() {
			console.log("Are you sure you are connected to the internet?");
		  }

		});
	},

	draw: function(ds){

	// chart variables
		var h = 600;
		var w = 600;
		var timeOffset = 500;

		var svg = d3.select("svg")
			.attr("width", w)
			.attr("height", h);

	// convenience functions for setting up chart elements
		function defaultAttr(selection) {
			selection
				.attr("x", 0)
				.attr("y", function(d,i) { return yScale(i); })
				.attr("rx", 5)
				.attr("ry", 5)
	// if too few bars to be drawn, range bands are too wide, chart looks funky
				.attr("height", function(){ if(yScale.rangeBand() > 20) return 20; return yScale.rangeBand(); });
		}
	// hover functions
		function aboutHover(selection) { selection.on("mouseover", function(d){

			var title = "<h5> Title: </h5>", br = "<br /><br />", extent = "<h5> Extent: </h5>", description = "<h5> Description: </h5>"; 

			d3.select("div#about div").style("height", "400px");
			d3.select("div#about div h4").style("display", "block");
			d3.select("div#about div p")
				.html(
					title + d.title + br + extent + d.extent + " " + d.extentUnits 
					+ br + description+ d.description + br);
			});
		}

		function aboutMouseOut(selection) { selection.on("mouseout", function(d) {

				d3.select("div#about h4").style("display", "none");
				d3.select("div#about p")
					.html("<em>Hover over a collection to learn more about it</em>");
				d3.select("div#about div").style("height", "auto");

			});
		}

	// BARS
		var dataBars = ds.filter(function(e,i,array){
				return (e.status === "scanning");
			})

	// height of bars varies according to svg height and number of bars to be drawn
		var yScale = d3.scale.ordinal()
			.domain(d3.range(dataBars.length))
			.rangeRoundBands([0,h], 0.75);		

	// gray underlying bars
		var barsTotal = svg.selectAll("rect.total")
			.data(dataBars);

		barsTotal.transition()
				.duration(timeOffset - 200)
				.call(defaultAttr);

		barsTotal.enter()
			.append("rect")
				.attr("class", "total")
				.call(defaultAttr)
				.attr("width", w)
				.attr("fill", "#fff")
				.call(aboutHover)
			.transition()
				.duration(timeOffset)
				.attr("fill", "#ccc");

		barsTotal.exit()
			.transition()
				.duration(timeOffset)
				.attr("fill", "#fff")
			.remove();

	// progress bars
		var barsProgress = svg.selectAll("rect.progress")
			.data(dataBars);

	// moves any old bars up to top of screen
		barsProgress.transition()
				.duration(timeOffset - 200)
				.call(defaultAttr);

	// adds new bars
		barsProgress.enter()
			.append("rect")
				.attr("class", "progress")
				.call(defaultAttr)
				.attr("fill", "#44AA52")
				.attr("width", 0)
				.call(aboutHover)			
			.transition()
				.duration(timeOffset)
				.attr("width", function(d) { return (d.completed / d.extent * w) });

	//removes extra bar elements
		barsProgress.exit()
			.transition()
				.duration(timeOffset)
				.attr("fill","#fff")
				.remove();

	// bar labels
		var barsLabel = svg.selectAll("text")
			.data(dataBars);

	//takes care of old labels
		barsLabel.transition()
				.duration(timeOffset - 200)
				.attr("y", function(d,i) { 
					var yOffset = (yScale.rangeBand() > 20)? 20 : yScale.rangeBand();					
					return yScale(i) + yOffset + 15
				});

	// new labels
		barsLabel.enter()
			.append("text")
			.attr("x", 0)
			.attr("y", function(d,i) { 
				var yOffset = (yScale.rangeBand() > 20)? 20 : yScale.rangeBand();					
				return yScale(i) + yOffset + 15
			})
			.text(function(d){ return d.title + " / Scans to Date: " + d.scansToDate})
			.attr("fill", "#777")
			.call(aboutHover)
			.transition()
			.duration(timeOffset)

	// remove labels
		barsLabel.exit()
			.transition()
			.duration(timeOffset - 200)
			.attr("fill","#fff")
			.remove();

	// COMPLETED LIST
		var dataComplete = ds.filter(function(e,i,array){
				return (e.status === "completed");
			});
		
		var completeList = d3.select(".completed ul").selectAll("li")
			.data(dataComplete);
	
	// add to list
		completeList.enter()
			.append("li")
			.text(function(d) { return d.title })
			.call(aboutHover)
			.style("color", "#fff")
			.transition()
			.duration(timeOffset)
			.style("color", "#777");
	
	// remove from list
		completeList.exit()
			.transition()
			.duration(timeOffset)
			.style("color", "#fff")
			.remove();		
	
	// targeted collections list
		var dataTarget = ds.filter(function(e,i,array){
				return (e.status === "targeted");
			});

	// TARGETED LIST
		var targetList = d3.select(".targeted ul").selectAll("li")
			.data(dataTarget);

	// add to list
		targetList.enter()
			.append("li")
			.text(function(d) { return d.title })
			.call(aboutHover)
			.style("color", "#fff")
			.transition()
			.duration(timeOffset)
			.style("color", "#777");

	// remove from list
		targetList.exit()
			.transition()
			.duration(timeOffset)
			.style("color", "#fff")
			.remove();		

	},

	// filters data according to selected options
	optionsRender: function(dataAll){

	// arrays for the select values that appear in the dropdown menu
		var contributors = ["All"];
		var projects = ["All"];
	
		for(i in dataAll) {
			if($.inArray(dataAll[i].contributor, contributors) === -1) contributors.push(dataAll[i].contributor);
			if($.inArray(dataAll[i].project, projects) === -1) projects.push(dataAll[i].project);
			}

		function optionsAdd(selection, array){

			selection.selectAll("option")
				.data(array)
				.enter()
				.append("option")
				.text(function(d){ return d });

		}

	// adds the contributor options
		d3.select("div#groupselect select#contributors")
			.call(optionsAdd, contributors);

	// adds the project options
		d3.select("div#groupselect select#projects")
			.call(optionsAdd, projects);

	},

	state: function(dataAll){

	// event listener, filters the data and draws a new chart based on filtered data
		d3.select("div#groupselect select#contributors")
			.on("change", function(){
				DLSapp.draw(currentData(this));
			});

		d3.select("div#groupselect select#projects")
			.on("change", function(){
				DLSapp.draw(currentData(this));
			});

	// array of the currently selected options
		var currentSelect = { contributor : "All", project : "All" };
		var dataUpdate = [];

	// the heart of the thing -- returns data filtered by the currently selected array
		function currentData(select) {

				currentSelect.contributor =  (select.id === "contributors")? select.value : currentSelect.contributor;
				currentSelect.project =  (select.id === "projects")? select.value : currentSelect.project;

				dataUpdate = dataAll.filter(function(e, i, array){

						if((e.contributor == currentSelect.contributor || currentSelect.contributor == "All") &&
							(e.project == currentSelect.project || currentSelect.project == "All")) return e;
						
					});

				return dataUpdate;

		};
	}
};
	// go mango ...
DLSapp.index();