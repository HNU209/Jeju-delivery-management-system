import React, { useEffect, useState, useCallback } from 'react';
import Loading from './components/Splash';
import Trip from './components/Trip';

import "mapbox-gl/dist/mapbox-gl.css";
import './css/app.css';

const App = () => {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const color = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [255, 255, 0],
    [0, 255, 255],
    [255, 0, 255],
    [255, 255, 255],
  ];

  const requestData = useCallback(async (type) => {
    const res = await fetch(`data/${type}.json`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: "application/json"
      },
    });

    const data = await res.json();
    setData((prev) => ({ ...prev, [type]: data }));
  }, []);

  const totalRequestData = useCallback(async () => {
    await requestData('items_information_230801');
    await requestData('jeju_delivery_trip_8_230801');
    setLoaded(true);
  }, [])

  useEffect(() => {
    totalRequestData();
  }, []);

  return (
    <div className="container">
      {!loaded && <Loading /> }
      {loaded && <Trip data={data} color={color} />}
    </div>
  );
}

export default App;