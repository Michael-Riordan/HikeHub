import mapboxgl from 'mapbox-gl';
import { useEffect, useState } from 'react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Map(coordinates) {

    useEffect(() => {
        const typeOfLocation = coordinates.type === 'nationalPark' ? 'nationalPark' : 'recreationArea'; 
        const zoom = coordinates.type === 'nationalPark' ? 9 : 12;
        
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj',
            center: [coordinates.longitude, coordinates.latitude],
            zoom: zoom,
        })

       //conditionally render map layer based off type of type of location (rec area data is not of type park boundary);
       typeOfLocation === 'nationalPark' ?

       map.on('style.load', () => {
            map.addLayer({
                id: 'national-park-boundary',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: coordinates.geojson.geometry,
                },
            });
        })
        
        :

        map.on('style.load', () => {
            map.addLayer({
                id: 'recreation-area-point',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: coordinates.geojson,
                },
                paint: {
                    'circle-radius': 20,
                    'circle-color': 'yellow',
                    'circle-opacity': 0.5,
                },
            });
        })


        return () => {
            map.remove();
        }
    }, [coordinates.latitude, coordinates.longitude, coordinates.geojson])

    return (
        <>
            <div id='map' style={{width: '50vw', height: '50vh'}}/>
        </>
    );
}