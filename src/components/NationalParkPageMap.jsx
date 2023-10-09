import { useState, useEffect } from 'react';
import Map, {Layer, Marker, Popup, Source} from 'react-map-gl'
import treeIcon from '../assets/tree-svgrepo-com.svg'

export default function NationalParkPageMap(coordinates) {
    const [viewport, setViewport] = useState({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        zoom: 10,
    });
    const [routeGeojson, setRouteGeojson] = useState(null);
    const [markerSelected, setMarkerSelected] = useState(false);

    useEffect(() => {
        const userLongitude = coordinates.userLocation.longitude;
        const userLatitude = coordinates.userLocation.latitude;

        const fetchDirections = async () => {
            const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${Number(coordinates.longitude)},${Number(coordinates.latitude)};${userLongitude},${userLatitude}?steps=true&geometries=geojson&access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`);
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            setRouteGeojson(jsonResponse);
        };

        fetchDirections();

    }, [coordinates.userLocation, coordinates.latitude, coordinates.longitude]);

    return (
        <>
            {   
                routeGeojson &&
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
                        <Marker
                            latitude={coordinates.latitude}
                            longitude={coordinates.longitude}
                            onClick={() => setMarkerSelected(true)}
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
                            markerSelected && (
                            <Popup
                                latitude={coordinates.latitude}
                                longitude={coordinates.longitude}
                                closeOnClick={false}
                                onClose={() => setMarkerSelected(false)}
                            >
                                <div 
                                    id='popup-div'
                                >
                                    <img 
                                        id='popup-park-image-park' 
                                        src={coordinates.parkImage} 
                                    />
                                    <h3 id='popup-park-name-park'>{coordinates.parkName}</h3>
                                    <a 
                                        href={`https://www.google.com/maps/dir/${coordinates.userLocation.latitude}, ${coordinates.userLocation.longitude}/${coordinates.latitude}, ${coordinates.longitude}`}
                                        target='_blank'
                                        id='popup-link-park'
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </Popup>
                        )
                    }
                    </Map>
                </>
            }
        </>
    )
}