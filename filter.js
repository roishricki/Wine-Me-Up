
  function filterBy(){
    jQuery('#left-sidebar').empty();
    var leftSideBarEl = document.getElementById('left-sidebar');
    var titleFilterBy = document.createElement('div');
    titleFilterBy.classList.add('txt','title-filterby');
    titleFilterBy.innerText='Filter by:'
    leftSideBarEl.appendChild(titleFilterBy);
    var byRadiusContainer = document.createElement('div');
    leftSideBarEl.append(byRadiusContainer);
    byRadiusContainer.id='by-radius-container'
    var byRadius = document.createElement('input');
    byRadius.type='range';
    byRadius.min='1';
    byRadius.max='250';
    byRadius.value='125';
    byRadius.classList.add('slider');
    byRadius.id= 'by-radius';
    var valueSlider = document.createElement('div');
    valueSlider.id='value-slide';
    valueSlider.innerText=byRadius.value+'km from me';
    byRadius.oninput= function(){
      valueSlider.innerHTML=this.value+'km from me';
    }
    byRadiusContainer.append(valueSlider);
    byRadiusContainer.append(byRadius);
    var setRadiusButton = createButton('SET');
    setRadiusButton.addEventListener('click',setRadiusOnClick);
    byRadiusContainer.append(setRadiusButton);


    setRatingFilter(leftSideBarEl)
    setOpenNowFilter(leftSideBarEl);


    var filterButton = createButton("FILTER");
    filterButton.id='filter-button';
    filterButton.addEventListener('click',onClickFilterButton);
    leftSideBarEl.appendChild(filterButton);
  }


  function onClickFilterButton(){
    if(markersArray.length==0) return;
    markersArray.forEach((marker)=>{marker.setVisible(true)});
    if(filterByObj.radius || filterByObj.openNow || filterByObj.rating){
      markersArray.forEach((marker)=>{
        if(filterByObj.radius){
          var dist = getDistance(currentLocationObj,{lat:marker.internalPosition.lat(),lng:marker.internalPosition.lng()})
          if(dist>filterByObj.radius) marker.setVisible(false);
        }
        if(filterByObj.openNow && filterByObj.includeUndefinedOpeningHours){
            if(placesInfo[marker.placeId]){
              var isOpen = checkOpenNow(placesInfo[marker.placeId].opening_hours.periods);
              if(!isOpen) marker.setVisible(false);
            }
          }
        if(filterByObj.openNow && !filterByObj.includeUndefinedOpeningHours){
          if(placesInfo[marker.placeId]){
            var isOpen = checkOpenNow(placesInfo[marker.placeId].opening_hours.periods);
            if(!isOpen) marker.setVisible(false);
          }else marker.setVisible(false);
        }
        if(filterByObj.rating && filterByObj.rating!='S'){
          if(marker.rating < filterByObj.rating) marker.setVisible(false);
        }
      });
    }
  }

  function checkOpenNow(openingHouers){
    var isOpen = false;
    openingHouers.forEach((item)=>{
      if(item.open.day==new Date().getDay()){
        if(item.open.hours < new Date().getHours() && item.close.hours > new Date().getHours()){
          isOpen = true;
        }
        if(item.open.hours == new Date().getHours() || item.close.hours == new Date().getHours()){
          if(item.open.hours == new Date().getHours() && item.open.minutes<=new Date().getMinutes()){
            isOpen = true;
          }
          if(item.close.hours == new Date().getHours() && item.close.minutes>= new Date().getMinutes()){
            isOpen = true;
          }
        }
      }
    })
    if(isOpen) return true;
    return false;
  }


  function setRatingFilter(leftSidebar){
    var ratingContainer = document.createElement('div');
    ratingContainer.id = 'rating-container';

    var ratingTitle=document.createElement('div');
    ratingTitle.classList.add('txt','rating-title');
    ratingTitle.innerText='RATING';

    var dropDownContainer = document.createElement('div');
    dropDownContainer.id='drop-down-container';

    var dropDownButton = document.createElement('button');
    dropDownButton.id='drop-down-button';
    dropDownButton.classList.add('txt');
    dropDownButton.innerText='SELECT';
    dropDownButton.addEventListener('click',()=>{
      if(dropDownOptionsContainer.classList.contains('show')){
        dropDownOptionsContainer.style.display='none'
        dropDownOptionsContainer.classList.remove('show');
      }else{
        dropDownOptionsContainer.style.display='';
        dropDownOptionsContainer.classList.add('show');
      }
    });

    var dropDownOptionsContainer = document.createElement('div');
    dropDownOptionsContainer.id='drop-down-options-container';
    dropDownOptionsContainer.style.display='none'
    dropDownOptionsContainer.appendChild(setOptionDropDown('Select all'))
    dropDownOptionsContainer.appendChild(setOptionDropDown('5 only'))
    dropDownOptionsContainer.appendChild(setOptionDropDown('4 and up'))
    dropDownOptionsContainer.appendChild(setOptionDropDown('3 and up'))
    dropDownOptionsContainer.appendChild(setOptionDropDown('2 and up'))
    dropDownOptionsContainer.appendChild(setOptionDropDown('1 and up'))
    
    ratingContainer.appendChild(ratingTitle);
    ratingContainer.append(dropDownContainer);
    dropDownContainer.appendChild(dropDownButton);
    dropDownContainer.appendChild(dropDownOptionsContainer);
    leftSidebar.appendChild(ratingContainer);
    windowOnClick(dropDownOptionsContainer);

  }

  function windowOnClick(options){
    // Close the dropdown menu if the user clicks outside of it
    window.onclick = function(event) {
      if (!event.target.matches('#drop-down-button')) {
        if(options.classList.contains('show')){
          options.style.display='none'
          options.classList.remove('show');
        }
      }
    }
  }

  function setOptionDropDown(text){
    var option = document.createElement('a');
    option.classList.add('txt');
    option.href='#';
    option.innerText=text;
    option.addEventListener('click',()=>{
        var buttonEl = document.querySelector('#drop-down-button');
        buttonEl.innerText=option.innerText;
        filterByObj.rating=option.innerText[0];
    })
    return option;
  }

  function setOpenNowFilter(leftSidebar){
    var openNowContainer = document.createElement('div');
    openNowContainer.id='by-opennow-container';

    var openNowEl = document.createElement('div');
    openNowEl.innerText='OPEN NOW';
    openNowEl.classList.add('txt');

    var setOpenNowButton = createButton('SET');
    setOpenNowButton.addEventListener('click',()=>{
      openNowEl.style.color='#5DDC43';
      filterByObj.openNow=true;
      
    })

    var unsetOpenNowButton = createButton('CLEAR');
    unsetOpenNowButton.addEventListener('click',()=>{
      openNowEl.style.color='white';
      filterByObj.openNow=false;
    })


    var checkBoxContainer = document.createElement('div');
    checkBoxContainer.style.display='inline-block';
    var checkBoxTitle = document.createElement('div');
    checkBoxTitle.innerText=`if there aren't opening hours, show it anyway`;
    checkBoxTitle.classList.add('txt');
    checkBoxTitle.style.fontSize='13px';
    checkBoxTitle.style.float='left';
    var checkBoxEl = document.createElement('input');
    checkBoxEl.style.marginLeft='3px'
    checkBoxEl.style.float='left';
    checkBoxEl.type='checkbox';
    checkBoxEl.id='opennow-checkbox';
    checkBoxEl.addEventListener('click',()=>{
      if(checkBoxEl.checked==true){
        filterByObj.includeUndefinedOpeningHours = true;
      }else{
        filterByObj.includeUndefinedOpeningHours = false;
      }
    })
    openNowContainer.appendChild(openNowEl);
    openNowContainer.appendChild(unsetOpenNowButton);
    openNowContainer.appendChild(setOpenNowButton);
    checkBoxContainer.appendChild(checkBoxTitle);
    checkBoxContainer.appendChild(checkBoxEl);
    openNowContainer.appendChild(checkBoxContainer);
    leftSidebar.appendChild(openNowContainer);

  }

  function setRadiusOnClick() {
    if(!isAlreadySetCurrentLocation){
      window.alert('must set current location first!');
      return;
    }
    filterByObj.radius = parseFloat(document.querySelector('#by-radius').value);
    if(jQuery('#by-radius-container .already-set').length>0){
      jQuery('#by-radius-container .already-set')[0].innerText=filterByObj.radius+'km has set!';
      return;
    }
    let radius = document.createElement('div');
    radius.classList.add('already-set','txt');
    radius.innerText=filterByObj.radius+'km has set!'
    jQuery('#by-radius-container')[0].append(radius);
  }
