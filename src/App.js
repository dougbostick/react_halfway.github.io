import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function App() {
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [directionsService, setDirService] = useState(null);
  const [directionsRender, setDirRender] = useState(null);
  const [lastLat, setLastLat] = useState(0);
  const [lastLng, setLastLng] = useState(0);
  const nearByPlaces = []


// console.log('dest, origin', dest, origin)

  useEffect(() => {
    if (origin) {
      new window.google.maps.Marker({
        position: origin.geometry.location,
        title: origin.name,
        map: map,
      });
    }
  }, [origin]);


  useEffect(() => {
    if (dest) {
      new window.google.maps.Marker({
        position: dest.geometry.location,
        title: dest.name,
        map: map,
      });
    }
  }, [dest]);


  useEffect(() => {
    const location = {
      lat: 40.0,
      lng: -79.0,
    };
    const options = {
      center: location,
      zoom: 12,
    };
    if (navigator.geolocation) {
      console.log('geo is here');
      navigator.geolocation.getCurrentPosition(
        (loc) => {
         
          location.lat = loc.coords.latitude;
          location.lng = loc.coords.longitude;

          setMap(
            new window.google.maps.Map(document.getElementById('map'), options)
          );
        },
        (err) => {
          console.log('nope', err);
          setMap(
            new window.google.maps.Map(document.getElementById('map'), options)
          );
        }
      );
    } else {
      console.log('geo not supported');
      setMap(
        new window.google.maps.Map(document.getElementById('map'), options)
      );
    }
    const autocompleteOrigin = new window.google.maps.places.Autocomplete(
      document.getElementById('origin-input'),
      {
        componentRestrictions: { country: ['us'] },
        fields: ['geometry', 'name'],
        // types: ["establishment"],
      }
    );
    const autocompleteDest = new window.google.maps.places.Autocomplete(
      document.getElementById('destination-input'),
      {
        componentRestrictions: { country: ['us'] },
        fields: ['geometry', 'name'],
        // types: ["establishment"],
      }
    );
    autocompleteOrigin.addListener('place_changed', () => {
      setOrigin(autocompleteOrigin.getPlace());
    });
    autocompleteDest.addListener('place_changed', () => {
      setDest(autocompleteDest.getPlace());
    });
    setDirService(new window.google.maps.DirectionsService());
    setDirRender(new window.google.maps.DirectionsRenderer());
  }, []);


  useEffect(() => {
    if (map) {
      const control = document.getElementById('floating-panel');
      map.controls[window.google.maps.ControlPosition.TOP_CENTER].push(control);
    }
  }, [map]);



  const findLastStep = (halfWay, dir) => {
    let total = 0;
    let newSteps = [];
    for (let i = 0; i < dir.length; i++) {
      let step = dir[i];
      newSteps.push(step);
      total += step.distance.value;
      if (total > halfWay) {
        // console.log(i);
        // console.log(newSteps);
        return newSteps;
      }
    }
  };

  function calculateAndDisplayRoute(directionsService, directionsRenderer) {
    directionsService
      .route({
        origin: {
          query: origin.name,
        },
        destination: {
          query: dest.name,
          // query: "Amarillo",
        },
        //refactor for other modes of transport
        travelMode: window.google.maps.TravelMode.WALKING,
      })
      .then((response) => {
        console.log('response', response);
        const steps = response.routes[0].legs[0].steps;
        const distance = response.routes[0].legs[0].distance.value;
        const half = distance / 2;
        let newSteps = findLastStep(half, steps);
        // console.log(distance, half);
        // console.log(steps);
        console.log(newSteps);
  
        response.routes[0].legs[0].steps = newSteps;
        //console.log(destination);
        const last = newSteps[newSteps.length - 1];
        console.log('last', last);
        console.log('last lat', last.start_location.lat());
        console.log('last lat', last.start_location.lng());
        setLastLat(last.start_location.lat());
        setLastLng(last.start_location.lng());
        // window.localStorage.setItem('lastLat', JSON.stringify(lastLat));
        // window.localStorage.setItem('lastLng', JSON.stringify(lastLng));
        new window.google.maps.Marker({
          position: last.end_location,
          map: map,
        });
        directionsRenderer.setMap(map);
        directionsRenderer.setDirections(response);
      })
      .catch((e) => window.alert('Directions request failed due to ' + e.status));
    //second setting of directions
    // directionsService
    //   .route({
    //     origin: {
    //       query: origin.name,
    //     },
    //     destination: {
    //       // query: new destination,
    //       query: "Central Park",
    //     },
    //     travelMode: google.maps.TravelMode.WALKING,
    //   })
    //   .then((response) => {
    //     console.log("second response", response);
    //     directionsRenderer.setMap(map);
    //     directionsRenderer.setDirections(response);
    //   })
    //   .catch((e) => window.alert("Directions request failed due to " + status));
  }

  async function findPlaces (lat, lng) {
    // const placesDiv = document.querySelector('#places');
    // while (placesDiv.firstChild) {
    //   placesDiv.removeChild(placesDiv.firstChild);
    // }
    try {
      await axios
        .get(
          `https://protected-brook-77403.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}%2C${lng}&radius=500&type=restaurant&key=AIzaSyD-WH-LKszQqhEgiEEcjqdc2v3OBmcPBd0`
        )
        .then((response) => {
          console.log(response.data);
          const places = response.data.results;
          const service = new window.google.maps.places.PlacesService(map);
          places.forEach((place) => {
            const request = {
              placeId: place.place_id,
              fields: ['url', 'website'],
            };

            service.getDetails(request, callback);

            function callback(_place, status) {
              if (status == window.google.maps.places.PlacesServiceStatus.OK) {
                console.log('place', place);
                let nearByPlace = {
                  name: place.name,
                  url: _place.url,
                  website: _place.website,
                }
                nearByPlaces.push(nearByPlace);
                console.log(nearByPlaces)
                // info = document.createElement('div');
                // info.innerHTML = place.name;
                // info.innerHTML += `<a href="${_place.url}" target="_blank">Listing</a>`;
                // info.innerHTML += `<a href="${_place.website}" target="_blank">Website</a>`;
                // // info.innerHTML += `<button onClick=takeMe(${place.name})>Take Me There</button>`;
                // placesDiv.appendChild(info);
                // // takeMe = (place) => {
                // //   console.log(`take me to ${place}`);
                // // };
              }
            }
          });
        });
    } catch (err) {
      console.log(err);
    }
  };

const nearByPlacesDiv = nearByPlaces?.map((place) => {
  return (
    <div>
      <div>
        {place.name}
      </div>
      <div>
        {place.url}
      </div>
      <div>
        {place.website}
      </div>
    </div>
  )
})
  return (
    <div className="App">
      <input id="origin-input" placeholder="Location 1" />
      <input id="destination-input" placeholder="Location 2" />
      <button onClick={()=>calculateAndDisplayRoute(directionsService, directionsRender)}>
        Halfway Point
      </button>
      <button onClick={()=>findPlaces(lastLat, lastLng)}>
        Find Places
      </button>
      <div className="nearby-places-div" style={{alignContent: "right"}}>
        {nearByPlacesDiv}
      </div>
      <div id="map" style={{height: '500px', width: '500px'}}></div>
      <div id="floating-panel"></div>
      {/* <Inputs />
      <MapPannel /> */}
    </div>
  );
}

export default App;
