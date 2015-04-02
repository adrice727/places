
var MapService = (function(){

  //Set up and initialize map
  var mapOptions, map, service;
  
  var mapService = function(){};

  mapService.prototype.initialize = function(options){
    var deferred = $.Deferred();
    mapOptions = options.settings;
    setLocation()
    .then(buildMap)
    .then(function(){
      deferred.resolve();
    });

    return deferred.promise();
  };

  mapService.prototype.getMapsObject = function(type) {
    if ( type === 'map' ) {
      return map;
    } else if ( type === 'places' ) {
      return service;
    }
  };

  function setLocation() {
    var deferred = $.Deferred();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var curLat = position.coords.latitude;
        var curLong = position.coords.longitude;
        mapOptions.center = new google.maps.LatLng(curLat, curLong);
        deferred.resolve();
      },
      function(){
        setDefaultLocation().then(function(){
          deferred.resolve();
        });
      });
    } else {
        setDefaultLocation().then(function(){
          deferred.resolve();
        });
    }
    return deferred.promise();
  }

  function setDefaultLocation(){
    var deferred = $.Deferred();
    var location = mapOptions.defaultLocation;
    mapOptions.center = new google.maps.LatLng(location.lat, location.lang);
    return deferred.resolve();
  }

  function buildMap(){
    var deferred = $.Deferred();
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    service = new google.maps.places.PlacesService(map);
    return deferred.resolve();
  }

  return mapService;
})();