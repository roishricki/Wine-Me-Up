
const wineryList=new Set();
var markersArray =[];
var places = [];
var favoriteWineryList=[];
var wishListWinery=[];
var dropFlag = false;
const image = "./wine.png";
var infowindow;
var currentLocationMarker=false;
var currentLocationObj={};
var isAlreadySetCurrentLocation=false;
var filterByObj={
  radius:false,
  openNow:false,
  rating:false,
  includeUndefinedOpeningHours:false,
}

function clearMap(){
  var button=document.querySelector('#clear-markers')
  jQuery('#left-sidebar').empty();
  filterByObj={
    radius:false,
    openNow:false,
    rating:false,
    includeUndefinedOpeningHours:false,
  }
  button.disabled=true;
  document.getElementById('searchTextField').disabled=true;
  document.getElementById('search').disabled=true;
  document.getElementById('clear-markers').disabled=true; 
  document.getElementById('favorites').disabled=true; 
  document.getElementById('wishlist').disabled=true;
  document.getElementById('filter').disabled=true;
  document.getElementById('favorites').style.filter='grayscale(1)'; 
  document.getElementById('wishlist').style.filter='grayscale(1)'; 
  document.getElementById('filter').style.filter='grayscale(1)'; 
  document.getElementById('drop-button').disabled=false;
  markersArray.forEach((marker)=>{
    marker.setVisible(false);
  })
}

function setMarkersVisibleAgain(){
  markersArray.forEach((marker,index)=>{
    setTimeout(()=>{
      marker.setVisible(true);
    },index*75)
  })
}


  function createWineryList(result){
      var obj={};
      obj['x'] = result.geometry.location.lat();
      obj['y'] = result.geometry.location.lng();
      obj['place_id']=result.place_id
      wineryList.add(obj);
  }
  


  function wishOnClick(marker){
    if((event.target.style.filter=='none')) {
      event.target.style.filter='grayscale(1)'
      var index= wishListWinery.indexOf(marker);
      if (index > -1) {
        wishListWinery.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
    else {
      event.target.style.filter='none';
      wishListWinery.push(marker)
    }
  }
  function heartOnClick(marker){
    if((event.target.style.filter=='none')) {
      event.target.style.filter='grayscale(1)'
      var index= favoriteWineryList.indexOf(marker);
      if (index > -1) {
        favoriteWineryList.splice(index, 1); // 2nd parameter means remove one item only
      }
    }
    else {
      event.target.style.filter='none';
      favoriteWineryList.push(marker)
    }
  }

  function showFavoriteWinery(){
    if(favoriteWineryList.length==0){
      markersArray.forEach((marker)=>{
        marker.setVisible(false);
      })
    }else{
      markersArray.forEach((marker)=>{
        if(!favoriteWineryList.includes(marker)) marker.setVisible(false);
        else{marker.setVisible(true);}
      })
    }
  }
  function showWishWinery(){
    markersArray.forEach((marker)=>{
      if(!wishListWinery.includes(marker)) marker.setVisible(false);
      else{marker.setVisible(true);}
    })
  }


  function getLocation() {
    if(currentLocationObj.hasOwnProperty('lat')) return showPosition();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }
  function showPosition(position) {
    if(!isAlreadySetCurrentLocation){
      currentLocationObj.lat = position.coords.latitude;
      currentLocationObj.lng = position.coords.longitude;
    }
    map.setCenter(new google.maps.LatLng(currentLocationObj.lat, currentLocationObj.lng));
    map.setZoom(12);
    if(!isAlreadySetCurrentLocation){
      currentLocationMarker = new google.maps.Marker({
        position: currentLocationObj,
        map: map,
        icon:'./mylocation.png',
        animation: google.maps.Animation.DROP
      });
    }
    isAlreadySetCurrentLocation=true;
  }


  var rad = function(x) {
    return x * Math.PI / 180;
  };
  
  function getDistance(p1, p2) {
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
      Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return parseFloat(d/1000).toFixed(2); // returns the distance in meter
  };