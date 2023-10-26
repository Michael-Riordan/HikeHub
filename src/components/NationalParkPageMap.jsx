import { useState, useEffect } from 'react';
import Map, {Layer, Marker, Popup, Source} from 'react-map-gl'
import treeIcon from '../assets/tree-svgrepo-com.svg'
import cabin from '../assets/cabin-svgrepo-com.svg'

export default function NationalParkPageMap(coordinates) {
    const [viewport, setViewport] = useState({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        zoom: 10,
    });
    const [routeGeojson, setRouteGeojson] = useState(null);
    const [markerSelected, setMarkerSelected] = useState(null);

    const visitorCenters = coordinates.visitorCenters;
    const park = coordinates.park[0];

    useEffect(() => {
        const userLongitude = coordinates.userLocation.longitude;
        const userLatitude = coordinates.userLocation.latitude;

        const fetchDirections = async () => {
            let visitorCenterCoords;
            markerSelected ? visitorCenterCoords = {latitude: markerSelected.latitude, longitude: markerSelected.longitude} 
            : 
            visitorCenterCoords = {latitude: visitorCenters[0].latitude, longitude: visitorCenters[0].longitude}

            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${Number(visitorCenterCoords.longitude)},${Number(visitorCenterCoords.latitude)};${userLongitude},${userLatitude}?steps=true&geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`);
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            jsonResponse.code === 'Ok' ? setRouteGeojson(jsonResponse) : setRouteGeojson(null);
        };
        
        if (visitorCenters.length > 0) {
            fetchDirections();
        }

    }, [coordinates.userLocation, coordinates.latitude, coordinates.longitude, visitorCenters, markerSelected]);

    return (
        <>
            <Map
                initialViewState={viewport}
                style={{width: '50vw', height: '50vh',}}
                mapStyle={'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj'}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
            > 
                <Source
                    type='geojson'
                    data={coordinates.geojson.geometry}
                >
                    <Layer
                        id='national-park-boundary'
                        type='fill'
                        paint={{
                            "fill-color": 'rgba(255, 255, 126, 1)',
                            "fill-opacity": 0.5,
                        }}
                    />
                </Source>
                {
                    routeGeojson && (

                        <Source 
                            type='geojson'
                            data={routeGeojson.routes[0].geometry}
                        >
                            <Layer
                                id='route'
                                type='line'
                                layout={{
                                    "line-join": 'round',
                                    "line-cap": 'round',
                                }}
                                paint={{
                                    "line-color": 'blue',
                                    "line-width": 5,
                                    "line-opacity": 0.75,
                                }}
                            />
                        </Source>
                    
                        )
                }
                <Marker
                    latitude={coordinates.latitude}
                    longitude={coordinates.longitude}
                    onClick={() => setMarkerSelected(park)}
                >
                    <img
                        src={treeIcon}
                        style={{
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                        }}
                    />
                </Marker>
                {
                    visitorCenters.map((center) => {
                        return (
                            <Marker
                                key={center.name}
                                latitude={center.latitude}
                                longitude={center.longitude}
                                onClick={() => setMarkerSelected(center)}
                            >
                                <img 
                                    src={cabin}
                                    style={{
                                        width: '25px',
                                        height: '25px',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Marker>
                        );
                    })
                    
                }
                {
                    markerSelected && (
                    <Popup
                        latitude={markerSelected.latitude}
                        longitude={markerSelected.longitude}
                        closeOnClick={false}
                        onClose={() => setMarkerSelected(null)}
                    >
                        <div 
                            id='popup-div'
                        >
                            <img 
                                id='popup-park-image-park' 
                                src={markerSelected.images.length === 0 ? coordinates.parkImage : markerSelected.images[0].url} 
                            />
                            <h3 id='popup-park-name-park'>{markerSelected.fullName != undefined ? markerSelected.fullName : markerSelected.name}</h3>
                            <a 
                                href={`https://www.google.com/maps/dir/${coordinates.userLocation.latitude}, ${coordinates.userLocation.longitude}/${coordinates.latitude}, ${coordinates.longitude}`}
                                target='_blank'
                                id='popup-link-park'
                            >
                                Get Directions
                            </a>
                            {
                                routeGeojson && (
                                    <>
                                        <p>Duration: {routeGeojson.routes[0].duration} seconds.</p>
                                        <p>Distance: {routeGeojson.routes[0].distance} meters.</p>
                                    </>
                                )
                            }
                        </div>
                    </Popup>
                )
            }
            </Map>
        </>
    );
}