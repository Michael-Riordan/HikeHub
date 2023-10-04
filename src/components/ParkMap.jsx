import mapboxgl from 'mapbox-gl';
import { useEffect, useState } from 'react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function ParkMap(coordinates) {
    const [routeGeojson, setRouteGeojson] = useState(null);
    const [routeSteps, setRouteSteps] = useState([]);

    useEffect(() => {
        const typeOfLocation = coordinates.type === 'nationalPark' ? 'nationalPark' : 'recreationArea'; 
        const zoom = coordinates.type === 'nationalPark' ? 6 : 6;
        
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj',
            center: [coordinates.longitude, coordinates.latitude],
            zoom: zoom,
        })

       //conditionally render map layer based off type of type of location (rec area data is point instead of boundary);
       typeOfLocation === 'nationalPark' ?

       map.on('style.load', () => {
            map.addLayer({
                id: 'national-park-boundary',
                type: 'fill',
                source: {
                    type: 'geojson',
                    data: coordinates.geojson.geometry,
                },
                paint: {
                    "fill-color": 'rgba(255, 255, 126, 1)',
                    "fill-opacity": 0.5,
                }
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
        });

        map.on('style.load', () => {
            map.addLayer({
                id: 'route',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: routeGeojson.routes[0].geometry,
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': 'blue',
                    'line-width': 5,
                    'line-opacity': 0.75,
                }
            });
        });

        map.on('style.load', () => {
            map.addLayer({
                id: 'point',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: routeGeojson.waypoints[1].location
                                }
                            }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': 'blue',
                }
            })
        })

        return () => {
            map.remove();
        }
    }, [coordinates.latitude, coordinates.longitude, coordinates.geojson, routeGeojson])

    useEffect(() => {
        const userLongitude = coordinates.userLocation.longitude;
        const userLatitude = coordinates.userLocation.latitude;

        const fetchDirections = async () => {
            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${Number(coordinates.longitude)},${Number(coordinates.latitude)};${userLongitude},${userLatitude}?steps=true&geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`);
            const jsonResponse = await response.json();
            setRouteGeojson(jsonResponse);
            const steps = jsonResponse.routes[0].legs[0].steps;
            setRouteSteps(steps)
        }
        fetchDirections();
    }, [coordinates.userLocation, coordinates.latitude, coordinates.longitude])

    return (
        <>
            <div id='map' style={{width: '50vw', height: '50vh'}}/>
        </>
    );
}