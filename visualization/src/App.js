import React, { useEffect, useState } from 'react';
import Splash from './component/Splash';
import Main from './component/Main';
import './css/app.css';

const axios = require('axios');

function randomColor(count) {
  const min = Math.ceil(0);
  const max = Math.floor(255);

  const color = []

  while (color.length !== count) {
    const r = Math.floor(Math.random() * (max - min)) + min;
    const b = Math.floor(Math.random() * (max - min)) + min;
    const g = Math.floor(Math.random() * (max - min)) + min;
    const c = [r, g, b];
    if (!(c in color)) {
      color.push(c)
    }
  }
  return color;
}

function getData(type) {
  const url = `https://raw.githubusercontent.com/HNU209/Jeju-delivery-management-system/main/result_data/${type}.json`;
  const response = axios.get(url);
  return response.then(res => res.data)
}

export default function App() {
  const [load, setLoad] = useState(false);
  const [trip, setTrip] = useState();
  const [item, setItem] = useState();

  const color = randomColor(10);

  useEffect(() => {
    async function getFetchData() {
      const trip = await getData('jeju_delivery_trip_8');
      const item = await getData('items_information');

      if (trip && item) {
        setTrip(trip);
        setItem(item);
        setLoad(true);
      };
    };

    getFetchData();
  }, []);

  return (
    <div className="App">
      {load ? <Main trip={trip} item={item} color={color}/> : <Splash/>}
    </div>
  );
}