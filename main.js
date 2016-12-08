
//  making a locations array (values taken from udacity course on maps)
var locations=[
            {title:'Park Ave Penthouse',location:{lat:40.7713024,lng:-73.9632393},bool:true},
            {title:'Chelsea Loft',location:{lat:40.7444883,lng: -73.9949465},bool:true},
            {title:'Union squre open floor plan',location:{lat:40.7347062,lng: -73.9895759},bool:true},
            {title:'East village Hip Studio',location:{lat:40.7281777,lng: -73.9843777},bool:true},
            {title:'Tribeca',location:{lat:40.7195264,lng: -74.0089934},bool:true},
            {title:'Chinaton',location:{lat:40.7180628,lng: -73.9961237},bool:true},
            ];

// Global variables

var map;
var markers=[];
infoWindow = new google.maps.InfoWindow();
var input;


//knockout viewModel
var viewModel=function(){
  var self=this;
  // making search variable a observable with no value initially(this will contain the value which user enters)
  this.search=ko.observable('');
  // places is an observable array with a empty array passed initially
  this.places=ko.observableArray([]);
  var weather=""
  // add a map
  map = new google.maps.Map(document.getElementById('map'), {
    //zoom level of the map (it will change the amout of onformation shown on map)
    zoom: 12,
    // map will be centered around lat and lng
    center:  {lat: 40.7413549, lng: -73.9980244},
    // styles are taken from https://snazzymaps.com/ randomly
    styles:[{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#87a323"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#f69c12"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#fac73a"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#0d7e96"}]}],
    });

  //values of locations are added to places observable array
  locations.forEach(function(loc){
  //every time a  location is added it will have observable values
    self.places.push(new place(loc));
  });

  // adding a marker at defined location
  self.places().forEach(function(place) {
    var marker = new google.maps.Marker({
      // tell marker to show on map
      map: map,
      // position of marker as defined in locations array but assessed from observable array(places)
      position: place.position(),
      // title of marker as defined in locations array but assessed from observable array(places)
      title: place.title(),
      // setting the icon from tke following link
      icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });
    //adding marker to markers array defined globally
    markers.push(marker);
    //adding a new property(marker) to place
    place.marker = marker;
    // on click listener on marker
    marker.addListener('click', function() {
      // setting infowindow on marker
      infoWindow.marker=marker;
      // Set image of all the markers to red
      markers.forEach(function(mark){
      // setting all ther icons to red
      mark.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      });
      // set image of clicked marker to green
      this.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png')
      // using street view api to show the image using the place lat and lng and defining the size
      var streetviewUrl='https://maps.googleapis.com/maps/api/streetview?size=220x120&location='+place.lat()+','+place.lng();
      // using OpenWeatherMap api to get max and min temp of place and show in infowindow
      var weatherUrl='http://api.openweathermap.org/data/2.5/weather?q='+place.title()+'&lat='+place.lat()+'&lon='+place.lng()+'&APPID=302e5c9ce22283a076002344330d532b'
      //$.get function is used and data is passed console.log(data) to see all the information
      $.get(weatherUrl,function(data){
        //make the temperature round up to 2 decimal places
        var temp_min=parseFloat(data.main.temp_min-273).toFixed(2);
        var temp_max=parseFloat(data.main.temp_max-273).toFixed(2);
        weather='<p> Min Temprature: '+temp_min+'&deg;C</p><p> Max Temperature: '+temp_max+'&deg;C</p>'
        //setting the content to infowindow
        infoWindow.setContent('<p>'+place.title()+'</p>'+'<img src='+streetviewUrl+'>'+weather);
      }).error(function(e){
        // adding error functionality (if something  unexpected happens it will show could not load)
        infoWindow.setContent("could not load");
      });
      // infowwindow.open() opens a  infowindow on passed map and at massed marker
      infoWindow.open(map, marker);
      infoWindow.addListener('closeclick',function(){
      //on clicking cross  infowindow will close
      infoWindow.close();
      //marker color changes to red
      infoWindow.marker.setIcon('http://maps.google.com/mapfiles/ms/icons/red-dot.png');
      });
    });
  });

  // filter is a ko.computed because it manipulates values defined before
  this.filter=ko.computed(function(){
    //convering the text in search to lowercase
    input=self.search().toLowerCase();
    // if it doesnot contains anything everything is visible
    if(!input){
      self.places().forEach(function(place){
        place.visibility(true);
        place.marker.setMap(map);
      });
    }
    else{
      self.places().forEach(function(place){
        // if indexOf comparision in if statement is -1 it means nothing matches
        if(place.title().toLowerCase().indexOf(input)!==-1){
          // if something(text) matches it  is visible
          place.visibility(true);
          //if it is visible marker is set to map
          place.marker.setMap(map);
        }
        else{
          //if text doesn't match it  is not visible
          place.visibility(false);
          // marker is set to null
          place.marker.setMap(null);
        }
      });
    }
  });

  // called when item from list is clicked (binded with list items using click binding)
  this.openInfo = function(place) {
    // close any opened info window
    infoWindow.close();
    // triggering the click event on particular marker
    google.maps.event.trigger(place.marker, 'click');
    };
}

var  place=function(loc){
  var self=this;
  //adding values as observables
  this.title=ko.observable(loc.title);
  this.lat=ko.observable(loc.location.lat);
  this.lng=ko.observable(loc.location.lng);
  this.position=ko.observable(loc.location);
  this.visibility=ko.observable(true);
}
// applying binding to viewModel
ko.applyBindings(new viewModel())
