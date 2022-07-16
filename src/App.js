import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [map, setMap] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [directionsService, setDirService] = useState(null);
  const [directionsRender, setDirRender] = useState(null);
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
          console.log('nope');
          setMap(
            new window.google.maps.Map(document.getElementById('map'), options)
          );
        }
      );
    } else {
      console.log('get not supported');
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
  return (
    <div className="App">
      <input id="origin-input" placeholder="Location 1" />
      <input id="destination-input" placeholder="Location 2" />
      <div id="map"></div>
      <div id="floating-panel"></div>
      {/* <Inputs />
      <MapPannel /> */}
    </div>
  );
}

export default App;
