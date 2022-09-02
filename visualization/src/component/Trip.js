import React, { useState, useEffect } from 'react';
import { StaticMap } from 'react-map-gl';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { PolygonLayer, ScatterplotLayer, IconLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import Slider from '@mui/material/Slider';
import '../css/trip.css'

const MAPBOX_TOKEN = `pk.eyJ1Ijoic3BlYXI1MzA2IiwiYSI6ImNremN5Z2FrOTI0ZGgycm45Mzh3dDV6OWQifQ.kXGWHPRjnVAEHgVgLzXn2g`; // eslint-disable-line

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

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70],
};

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: 126.55,
  latitude: 33.35,
  zoom: 10,
  minZoom: 5,
  maxZoom: 16,
  pitch: 20,
  bearing: 0,
};

const landCover = [
  [
    [-74.0, 40.7],
    [-74.02, 40.7],
    [-74.02, 40.72],
    [-74.0, 40.72],
  ],
];

const ICON_MAPPING = {
  marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
};

function getPoint(time, data) {
  const arr = [];
  Object.values(data).forEach(v => {
    const vehicle_id = v.vehicle_id;
    const path = v.path;
    const timestamp = v.timestamp;
    const [start, end] = timestamp;

    if ((time >= start) && (time <= end)) {
      arr.push({
        'vehicle_id': vehicle_id,
        'path': path,
      })
    }
  })
  return arr
}

function currVehicle(time, trip) {
  const vehicle = [];
  let count = 0;

  Object.values(trip).forEach(v => {
    const veh_id = v.vehicle_id;
    const timestamp = v.timestamps;
    const start = timestamp[0];
    const end = timestamp[timestamp.length-1];

    if (veh_id in Object.keys(vehicle)) {
      const minStart = vehicle[veh_id]['start'];
      const maxEnd = vehicle[veh_id]['end'];
      if (minStart > start) {
        vehicle[veh_id]['start'] = start;
      }
      if (maxEnd < end) {
        vehicle[veh_id]['end'] = end;
      }
    } else {
      vehicle.push({
        'veh_id' : veh_id,
        'start' : start,
        'end' : end
    })};
  })

  Object.values(vehicle).forEach(v => {
    const start = v.start;
    const end = v.end;
    if ((time >= start) && (time <= end)) {
      count += 1;
    }
  })
  return count;
}

function currItem(time, item) {
  let count = 0;

  Object.values(item).forEach(v => {
    const ts = v.timestamp;
    const start = ts[0];
    const end = ts[1];

    if ((time >= start) && (time <= end)) {
      count += 1;
    }
  })
  return count;
}

function renderLayers(props) {
  const theme = DEFAULT_THEME;
  const time = props.time;
  const trip = props.trip;
  const color = props.color;
  const item = getPoint(time, props.item);

  // console.log(color)
  const manageLoc = [[126.564177703051, 33.5139995322362]];

  return [
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      getPolygon: (f) => f,
      stroked: false,
      getFillColor: [0, 0, 0, 0],
    }),
    new TripsLayer({
      id: 'trip',
      data: trip,
      getPath: (d) => d.trips,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) => color[d.vehicle_id],
      opacity: 0.5,
      widthMinPixels: 7,
      lineJointRounded: false,
      trailLength: 5,
      currentTime: time,
      shadowEnabled: false,
    }),
    new ScatterplotLayer({
      id: 'item',
      data: item,
      getPosition: (d) => [d.path[0], d.path[1]],
      getFillColor: (d) => color[d.vehicle_id],
      getRadius: (d) => 50,
      opacity: 1,
      pickable: false,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
    }),
    new IconLayer({
      id: 'manageLoc',
      data: manageLoc,
      sizeScale: 30,
      iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
      iconMapping: ICON_MAPPING,
      getIcon: (d) => 'marker',
      getSize: d => 1,
      getPosition: (d) => [d[0], d[1]],
      getColor: d => [255, 255, 0],
      opacity: 0.9,
      pickable: false,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
    }),
  ];
}

export default function Trip(props) {
  const minTime = props.minTime;
  const maxTime = props.maxTime;

  const animationSpeed = 4;
  const time = props.time;

  const trip = props.trip;
  const item = props.item;
  const color = props.color;

  const totalVehicleNum = props.totalVehicleNum;
  const totalItemNum = props.totalItemNum;
  const currVehicleNum = currVehicle(time, trip);
  const currTimeNum = currItem(time, item);

  const [animationFrame, setAnimationFrame] = useState('');
  const viewState = undefined;
  const mapStyle = 'mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc';
  
  function animate() {
    props.setTime(time => {
      if (time > maxTime) {
        return minTime;
      } else {
        return time + (0.01) * animationSpeed;
      }
    })
    const af = window.requestAnimationFrame(animate);
    setAnimationFrame(af);
  }

  function SliderChange(value) {
    props.setTime(value.target.value)
  }

  useEffect(() => {
    props.setTime(time)
  }, [time])

  useEffect(() => {
    animate()
    return () => window.cancelAnimationFrame(animationFrame);
  }, [])

  return (
    <div className="trip-container" style={{position:'relative'}}>
      <DeckGL
        layers={renderLayers({'trip':trip, 'item':item, 'color':color, 'time':time})}
        effects={DEFAULT_THEME.effects}
        viewState={viewState}
        controller={true}
        initialViewState={INITIAL_VIEW_STATE}
      >
        <StaticMap
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
      <h1 className="time">
        TIME : {(String(parseInt(Math.round(time) / 60) % 24).length === 2) ? parseInt(Math.round(time) / 60) % 24 : '0'+String(parseInt(Math.round(time) / 60) % 24)} : {(String(Math.round(time) % 60).length === 2) ? Math.round(time) % 60 : '0'+String(Math.round(time) % 60)}
      </h1>
      <div className='subtext'>
        <div>- 총 운행하는 차량 수&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {totalVehicleNum}대</div>
        <div>- 총 배송량&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {totalItemNum}개</div>
        <div>- 현재 운행하는 차량 수&nbsp;&nbsp;&nbsp;&nbsp;: {currVehicleNum}대</div>
        <div>- 남은 배송량&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {currTimeNum}개</div>
      </div>
      <Slider id="slider" value={time} min={minTime} max={maxTime} onChange={SliderChange} track="inverted"/>
    </div>
  );
}