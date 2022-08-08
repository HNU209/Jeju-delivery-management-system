import React, { useEffect, useState } from 'react';
import Trip from './Trip';
import '../css/main.css';

function totalVehicle(trip) {
  const veh_ids = [];
  Object.values(trip).forEach(v => {
    const veh_id = v.vehicle_id;
    veh_ids.push(veh_id);
  })

  const unique_veh_id = [...new Set(veh_ids)];
  return unique_veh_id.length;
}

export default function Main(props) {
  const range = 5;
  const minTime = 420;
  const maxTime = 960;
  const [time, setTime] = useState(minTime);

  const trip = props.trip;
  const item = props.item;
  const color = props.color;

  const totalVehicleNum = totalVehicle(trip);
  const totalItemNum = item.length;

  useEffect(() => {

  })

  return (
    <div className="container">
      <Trip trip={trip} item={item} totalVehicleNum={totalVehicleNum} totalItemNum={totalItemNum} color={color} minTime={minTime} maxTime={maxTime} time={time} setTime={setTime}></Trip>
    </div>
  );
}