
var Map = (function(){

  //Set up and initialize map

  var mapOptions, map, service, currentLocationMarker;
  
  // Define map options
  var mapOptions = {
    minZoom:12,
    zoom: 16,
    maxZoom: 19,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false
  };

  var gMap = function(){};

  gMap.prototype.initialize = function(){
    // Get current location or default to Market/Embarcadero
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        curLat = position.coords.latitude;
        curLong = position.coords.longitude;
        mapOptions.center = new google.maps.LatLng(curLat, curLong);
        buildMap();
      },
      function(){
        setDefaultLocation();
      });
    } else {
      setDefaultLocation();
    }
  }

  function setDefaultLocation(){
    mapOptions.center = new google.maps.LatLng(37.79496, -122.394358);
    buildMap();
  }

  function buildMap(){
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    service = new google.maps.places.PlacesService(map);
    $('.search-box-container').spin(false);
    $('.input-container').show();
  }

  // Set event handlers
  $('#search').on('click', function(){
    var searchText = getUserInput();
    if ( searchText.length > 0 ) {
      executeSearch(searchText);
    }
  });

  $('#search-input').on('keypress', function(e){
    var searchText = getUserInput();
    if ( e.which === 13 && searchText.length > 0 ) {
      executeSearch(searchText);
      return false;
    }
  });

  $('#places-list').on('click', 'li', function(){
    var id = $(this).attr('data-id');
    viewPlaceOnMap(id);
  });

  $('.hide-map').on('click', function(){
    toggleMap(false);
  });

  // Search and display results
  function getUserInput(){
    return $('.search-box-container input').val();
  }

  function clearUserInput(){
    $('.search-box-container input').val('');
  }

  function executeSearch(query) {
    var request = {
      location: mapOptions.center,
      radius: '50',
      query: query
    }
    service.textSearch(request, processSearchResults);
  }

  var currentResults;
  function processSearchResults(results){
    currentResults = {};
    if ( google.maps.places.PlacesServiceStatus.OK ) {
      for ( var i = 0; i < results.length; i++ ) {
        if ( i === 10 ) { break; }
        currentResults[results[i].id] = results[i];
      }
      displayResults();
    }
  }

  function displayResults(){
    $('#places-list').empty();
    if ( $.isEmptyObject(currentResults) ) {
      $('#places-list').append('<li class="no-results"><div>No results found</div></li>'); 
      return;
    } 
    for ( var key in currentResults ) {
      var place = currentResults[key];
      var imgUrl;
      if ( place.photos ) {
        imgUrl = place.photos[0].getUrl({'maxWidth': 90, 'maxHeight': 90 });
      } else {
        imgUrl = 'http://goo.gl/j5Apls';  //default image
      }
      var item = '<li data-id="' + place.id + '">\
                  <div class="pic-container"><img src="' + imgUrl +'"></img></div>\
                  <div class="place-info">\
                  <div class="place-name">' + place.name + '</div>\
                  <div class="place-address">' + place.formatted_address + '<i class="fa fa-map-marker"></i></div>\
                  <div class="place-rating">Rating: ' + place.rating + '</div>\
                  </div>\
                  </li>';      

      $('#places-list').append(item);    
      if ( !mapHidden ) { $('#places-list li').addClass('collapse'); }
    }
  }

  function viewPlaceOnMap(id) {
    var place = currentResults[id];
    var placeLocation = place.geometry.location
    var location = new google.maps.LatLng(placeLocation.k, placeLocation.D);
    if ( !$.isEmptyObject(currentLocationMarker) ){ currentLocationMarker.setMap(null); }
    currentLocationMarker = new google.maps.Marker({
      position: location,
      map: map,
      title: place.name,
    });
    currentLocationMarker.setMap(map);
    map.panTo(location);
    toggleMap(true);
  }

  var mapHidden = true;
  function toggleMap(show){
    if ( show ) {
      $('.map-container').removeClass('map-container-hide');
      $('.search-results-container').removeClass('results-container-full');
      $('.search-results-container').addClass('results-container-side');
      $('#places-list li').addClass('collapse');
      mapHidden = false;
    } else {
      $('.map-container').addClass('map-container-hide');
      $('.search-results-container').removeClass('results-container-side');
      $('.search-results-container').addClass('results-container-full');
      $('#places-list li').removeClass('collapse');
      mapHidden = true;
    }
  }

  return gMap;
})();