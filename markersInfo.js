var firstInit = false;

function setPlacesInfoArray(){
  markersArray.forEach((marker,index)=> {
    
    places.forEach((place)=>{
      if(place.geometry.location.lng()==marker.position.lng() && place.geometry.location.lat()==marker.position.lat())
      {
        marker.placeId=place.place_id;
        var request = {
          placeId: place.place_id,
          fields: ['opening_hours']
        }
        if(placesInfo[place.place_id]==undefined){
          var service = new google.maps.places.PlacesService(map);
          setTimeout(()=>{
            service.getDetails(request,(place,status)=>{
              if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.opening_hours
              ) {
                  placesInfo[marker.placeId]=place;
               }
               else if(status == 'OVER_QUERY_LIMIT'){
                console.log(status);
               }else if(!place.opening_hours){
                console.log('this place has not opening_hours');
                console.log(marker.placeId)
                placesInfo[marker.placeId]=false;
               }else if(!place){
                console.log('place undefined');
                placesInfo[marker.placeId]=false;
               }
            });
          },3000);
        }
      }
    })
  })
}

function setMarkersDetails(){
  markersArray.forEach((marker)=> {
    places.forEach((place)=>{
      if(place.geometry.location.lng()==marker.position.lng() && place.geometry.location.lat()==marker.position.lat())
      {
        marker.placeId=place.place_id;
        marker.rating = place.rating;
      }
    })
  })
}

function dropWineryList(){
  if(firstInit){
      markersArray.forEach((marker)=>{
        marker.setVisible(true);
        marker.setAnimation(google.maps.Animation.DROP);
      })
      document.getElementById('searchTextField').disabled=false;
      document.getElementById('search').disabled=false;
      document.getElementById('clear-markers').disabled=false; 
      document.getElementById('favorites').disabled=false; 
      document.getElementById('wishlist').disabled=false;
      document.getElementById('filter').disabled=false;
      document.getElementById('favorites').style.filter='none'; 
      document.getElementById('wishlist').style.filter='none'; 
      document.getElementById('filter').style.filter='none';
      document.getElementById('drop-button').disabled=true;
      return;
    }
    document.getElementById('drop-button').disabled=true;
    var i = 0;
     wineryList.forEach((location)=>{
       i++;
       setTimeout(()=>{
         var newMarker = new google.maps.Marker({
           position: { lat:location['x'], lng:location['y'] },
           map: map,
           icon:image,
           animation: google.maps.Animation.DROP
         });
         if(!markersArray.includes(newMarker)) markersArray.push(newMarker);
         places.forEach((place)=>{
           var placeID;
           if(place.geometry.location.lng()==newMarker.position.lng() && 
           place.geometry.location.lat()==newMarker.position.lat() ){
             placeID=place.place_id;
             var request = {
               placeId: placeID,
               fields: ['ALL']
             };
             newMarker.addListener('click',()=>{
               map.setZoom(12);
               map.setCenter(newMarker.getPosition());
               var service = new google.maps.places.PlacesService(map);
               service.getDetails(request,(place,status)=>{
                 if (
                   status === google.maps.places.PlacesServiceStatus.OK &&
                   place &&
                   place.geometry &&
                   place.geometry.location
                 ) {
                   getDetailsOnMap(place,newMarker)
                  }
               });
             })
           }
         })
        },i*50)
     })
     setTimeout(()=>{
      document.getElementById('searchTextField').disabled=false;
      document.getElementById('search').disabled=false;
      document.getElementById('clear-markers').disabled=false; 
      document.getElementById('favorites').disabled=false; 
      document.getElementById('wishlist').disabled=false;
      document.getElementById('filter').disabled=false;
      document.getElementById('favorites').style.filter='none'; 
      document.getElementById('wishlist').style.filter='none'; 
      document.getElementById('filter').style.filter='none';
      setMarkersDetails();
      },wineryList.size*50);
      firstInit=true;
   }

   function getDetailsOnMap(place,marker){
    jQuery('#left-sidebar').empty();
    const content = document.createElement("div");
    content.classList.add('info-box');
    const nameElement = document.createElement("h2");
    nameElement.classList.add('info-title','txt');
    nameElement.textContent = place.name;
    content.appendChild(nameElement);
    //title
    if(currentLocationObj.hasOwnProperty('lat')){
      var distFrom = document.createElement("h3");
      distFrom.classList.add('dist-from','txt');
      distFrom.innerText=`${getDistance(currentLocationObj,{lat:place.geometry.location.lat(),lng:place.geometry.location.lng()
      })} km from you!`
      content.appendChild(distFrom);
    }

    setOpeningHours(place)
    setPhoneNumber(place)
    setRating(place)
    setAddress(place)

    var wishEl = document.createElement('img');
    wishEl.id='wish';
    wishEl.src = "./wishlist.png";
    var wishText = document.createElement('div');
    wishText.classList.add('txt');
    wishText.innerText='Add To Wish List';
    var wishContainer = document.createElement('div');
    wishContainer.classList.add('center-on-page');
    if(wishListWinery.includes(marker)) wishEl.style.filter='none';
    wishEl.addEventListener("click",function(){wishOnClick(marker)} , false);

    var heartText=document.createElement('div');
    heartText.classList.add('txt');
    heartText.innerText='Add To Favorites';
    var heartContainer = document.createElement('div');
    heartContainer.classList.add('center-on-page');
    var heartEl = document.createElement('img');
    heartEl.id='heart';
    heartEl.src='./Love_Heart_symbol.svg.png'
    if(favoriteWineryList.includes(marker)) heartEl.style.filter='none';
    heartEl.addEventListener("click",function(){heartOnClick(marker)} , false);
    heartContainer.append(heartEl);
    heartContainer.append(heartText);
    wishContainer.append(wishEl);
    wishContainer.append(wishText);
    content.append(heartContainer);
    content.append(wishContainer);
    infowindow.setContent(content);
    infowindow.open(map, marker);
}

   function setAddress(place){
    if(!place.formatted_address) return;
    if(document.querySelector('.address')){
      addressEl=document.querySelector('.address')
    }else{
      var addressEl = document.createElement('div');
      addressEl.classList.add('txt','address');
    }
    addressEl.innerText='Address: '+place.formatted_address+'\n\n';
    if(!document.querySelector('.address')) document.querySelector('#left-sidebar').append(addressEl);
  }

  function setRating(place){
    if(!place.rating) return;
    if(document.querySelector('.rating')){
      ratingEl=document.querySelector('.rating');
    }else{
      var ratingEl = document.createElement('div');
      ratingEl.classList.add('txt','rating');
    }
    ratingEl.innerText='Rating: '+place.rating+'/5 ('+place.user_ratings_total+')\n\n';
    if(!document.querySelector('.rating')) document.querySelector('#left-sidebar').append(ratingEl);
  }

  function setPhoneNumber(place){
    if(!place.formatted_phone_number)return;
    if(document.querySelector('.phone')){
      phoneEl = document.querySelector('.phone')
    }else{
      var phoneEl = document.createElement('div')
      phoneEl.classList.add('phone','txt');
    }
    phoneEl.innerText=`Phone: ${place.formatted_phone_number+'\n'}`
    if(!document.querySelector('.phone')) document.querySelector('#left-sidebar').append(phoneEl);
  }


  function setOpeningHours(place){
    
    if(!place) return;
    days=[
      {day:'Sunday',open:'',close:''},
      {day:'Monday',open:'',close:''},
      {day:'Tuesday',open:'',close:''},
      {day:'Wednesday',open:'',close:''},
      {day:'Thursday',open:'',close:''},
      {day:'Friday',open:'',close:''},
      {day:'Saturday',open:'',close:''}]
      
      
      if(!document.querySelector('.opening-hours')){
        var openingHours = document.createElement('div');
      openingHours.classList.add('txt','opening-hours','open');
      }else{
        var openingHours = document.querySelector('.opening-hours')
      }
    place.opening_hours?.periods.forEach((day)=>{
      days[day.open.day].open=day.open.time;
      days[day.close.day].close=day.close.time;
    })
    days.forEach((day)=>{
      if(day.open=='') day.open='Close'
      if(day.close=='') day.close='Close'
    })
    var content=[];
    days.forEach((day)=>{
      var openHour= day.open.substring(0,2) + ':' +day.open.substring(2,4);
      var closeHour= day.close.substring(0,2) + ':' +day.close.substring(2,4);
      var cont=day.day+': Open: '+openHour+' Close: ' + closeHour+ '\n\n';
      if(day.open=='Close'){
        cont = day.day+': Close\n\n';
      }
      content.push(cont);
    })
    openingHours.innerText = 
    '\n'+ content[0]+content[1]+content[2]+content[3]+content[4]+content[5]+content[6];
    var counter=0;
    days.forEach((day)=>{
      if(day.open=='Close') counter++;
    })
    if(counter==7) openingHours.innerText ='Opening Hours:\n**Not Available**\n\n\n\n';

    var openingHoursTitle = createButton('Opening Hours');
    openingHoursTitle.classList.add('txt','close','title-opening-hours');
    openingHours.style.display = 'none';

    var clickHereDecreption = document.createElement('div');
    clickHereDecreption.classList.add('txt');
    clickHereDecreption.innerText='click here'

    openingHoursTitle.addEventListener('click',()=>{
      if(openingHoursTitle.classList.contains('close')){
        openingHours.style.display = '';
        openingHoursTitle.classList.remove('close');
      }else{
        openingHours.style.display = 'none';
        openingHoursTitle.classList.add('close');
      }
    })
    if(!document.querySelector('.opening-hours')){
      if(counter!=7) document.querySelector("#left-sidebar").append(openingHoursTitle) 
      else if(openingHours.style.display=='none') openingHoursTitle.click();
      document.querySelector("#left-sidebar").append(openingHours);
    } 
  }