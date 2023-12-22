import React, { useState, useEffect, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import { TripsLayer } from "@deck.gl/geo-layers";
import { Map } from "react-map-gl";

import Slider from "@mui/material/Slider";
import "../css/trip.css";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: 126.55,
  latitude: 33.35,
  zoom: 10,
  minZoom: 5,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const minTime = 420;
const maxTime = 960;
const animationSpeed = 4;
const manageLoc = [[126.564177703051, 33.5139995322362]];
const mapStyle = "mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc";
const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

const returnAnimationTime = (time) => {
  if (time > maxTime) {
    return minTime;
  } else {
    return time + 0.01 * animationSpeed;
  }
};

const addZeroFill = (value) => {
  const valueString = value.toString();
  return valueString.length < 2 ? "0" + valueString : valueString;
};

const returnAnimationDisplayTime = (time) => {
  const hour = addZeroFill(parseInt((Math.round(time) / 60) % 24));
  const minute = addZeroFill(Math.round(time) % 60);
  return [hour, minute];
};

const totalVehicle = (trip) => {
  const veh_ids = [];
  Object.values(trip).forEach((v) => {
    const veh_id = v.vehicle_id;
    veh_ids.push(veh_id);
  });

  const unique_veh_id = [...new Set(veh_ids)];
  return unique_veh_id.length;
};

const getPoint = (time, data) => {
  const arr = [];
  Object.values(data).forEach((v) => {
    const vehicle_id = v.vehicle_id;
    const path = v.path;
    const timestamp = v.timestamp;
    const [start, end] = timestamp;

    if (time >= start && time <= end) {
      arr.push({
        vehicle_id: vehicle_id,
        path: path,
        timestamp: timestamp,
      });
    }
  });
  return arr;
};

const currVehicle = (time, trip) => {
  const vehicle = [];
  let count = 0;

  Object.values(trip).forEach((v) => {
    const veh_id = v.vehicle_id;
    const timestamp = v.timestamps;
    const start = timestamp[0];
    const end = timestamp[timestamp.length - 1];

    if (veh_id in Object.keys(vehicle)) {
      const minStart = vehicle[veh_id]["start"];
      const maxEnd = vehicle[veh_id]["end"];
      if (minStart > start) {
        vehicle[veh_id]["start"] = start;
      }
      if (maxEnd < end) {
        vehicle[veh_id]["end"] = end;
      }
    } else {
      vehicle.push({
        veh_id: veh_id,
        start: start,
        end: end,
      });
    }
  });

  Object.values(vehicle).forEach((v) => {
    const start = v.start;
    const end = v.end;
    if (time >= start && time <= end) {
      count += 1;
    }
  });
  return count;
};

const currItem = (time, item) => {
  return item.filter((d) => d.timestamp[0] <= time && d.timestamp[1] >= time)
    .length;
};

const Trip = (props) => {
  const [time, setTime] = useState(minTime);
  const [animation] = useState([]);

  const item = getPoint(time, props.data.items_information_230801);

  const totalVehicleNum = totalVehicle(props.data.jeju_delivery_trip_8_230801);
  const totalItemNum = props.data.items_information_230801.length;
  const currVehicleNum = currVehicle(
    time,
    props.data.jeju_delivery_trip_8_230801
  );
  const currItemNum = currItem(time, item);

  const animate = useCallback(() => {
    setTime((time) => returnAnimationTime(time));
    animation.id = window.requestAnimationFrame(animate);
  }, [animation]);

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation, animate]);

  const layers = [
    new TripsLayer({
      id: "trip",
      data: props.data.jeju_delivery_trip_8_230801,
      getPath: (d) => d.trips,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) => props.color[d.vehicle_id],
      opacity: 0.5,
      widthMinPixels: 7,
      lineJointRounded: false,
      trailLength: 5,
      currentTime: time,
      shadowEnabled: false,
    }),
    new ScatterplotLayer({
      id: "item",
      data: item,
      getPosition: (d) => [d.path[0], d.path[1]],
      getFillColor: (d) => props.color[d.vehicle_id],
      getRadius: (d) => 50,
      opacity: 1,
      pickable: false,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
    }),
    new IconLayer({
      id: "manageLoc",
      data: manageLoc,
      sizeScale: 30,
      iconAtlas:
        "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: (d) => "marker",
      getSize: (d) => 1,
      getPosition: (d) => [d[0], d[1]],
      getColor: (d) => [255, 255, 0],
      opacity: 0.9,
      pickable: false,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
    }),
  ];

  const SliderChange = (value) => {
    const time = value.target.value;
    setTime(time);
  };

  const [hour, minute] = returnAnimationDisplayTime(time);

  return (
    <div className="trip-container" style={{ position: "relative" }}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map mapStyle={mapStyle} mapboxAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
      <h1 className="time">TIME : {`${hour} : ${minute}`}</h1>
      <div className="subtext">
        <div>
          - 총 운행하는 차량 수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
          {totalVehicleNum}대
        </div>
        <div>
          - 총
          배송량&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
          {totalItemNum}개
        </div>
        <div>
          - 현재 운행하는 차량 수&nbsp;&nbsp;&nbsp;&nbsp;: {currVehicleNum}대
        </div>
        <div>
          - 남은
          배송량&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:{" "}
          {currItemNum}개
        </div>
      </div>
      <Slider
        id="slider"
        value={time}
        min={minTime}
        max={maxTime}
        onChange={SliderChange}
        track="inverted"
      />
    </div>
  );
};

export default Trip;
