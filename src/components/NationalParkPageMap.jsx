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
    const [timeToDestination, setTimeToDestination] = useState('');
    const [distanceToDestination, setDistanceToDestination] = useState('')

    const visitorCenters = coordinates.visitorCenters;
    const park = coordinates.park[0];

    const isPlural = (num) => {
        return num > 1;
    }

    const convertToDays = (hours) => {
        const days = hours / 24;
        return days;
    }

    const convertTime = (seconds) => {
        //incomplete - need to refine for exact number
        console.log(seconds);
        let remainingHours = 0;
        let remainingMinutes = 0;
        let daysPlural;

        const hours = (seconds / 60) / 60;
        const minutes = (hours % 1) * 60;

        let days = convertToDays(Math.floor(hours));
        days > 1 ? remainingHours = (days % 1) * 24 : remainingHours = Math.floor(hours);

        if (days >= 1) {
            daysPlural = isPlural(Math.floor(days));
        }

        const hoursPlural = remainingHours > 0 ? isPlural(Math.round(remainingHours)) : isPlural(Math.floor(hours));
        const minutesPlural = isPlural(Math.round(minutes));

        const daysDescriptor = daysPlural ? 'days' : 'day';
        const hourDescriptor = hoursPlural ? 'hours' : 'hour';
        const minutesDescriptor = minutesPlural ? 'minutes' : 'minute';



        
        const durationString = Math.floor(days) > 0 ? 
        `${Math.floor(days)} ${daysDescriptor}, ${Math.round(remainingHours)} ${hourDescriptor}, ${Math.round(minutes)} ${minutesDescriptor}` :
        `${Math.floor(hours)} ${hourDescriptor}, ${Math.round(minutes)} ${minutesDescriptor}`

        setTimeToDestination(durationString);
    }

    const convertToMiles = (meters) => {
        const metersPerMile = 1609.344
        const miles = (meters / metersPerMile).toFixed(1);
        const mileDescriptor = isPlural(miles) ? 'miles' : 'mile';
        setDistanceToDestination(`${miles} ${mileDescriptor}`);
    }

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
            if (jsonResponse.code === 'Ok') {
                convertToMiles(jsonResponse.routes[0].distance);
                convertTime(jsonResponse.routes[0].duration);
                setRouteGeojson(jsonResponse);

            }
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
                                        <p>Duration: {timeToDestination}</p>
                                        <p>Distance: {distanceToDestination}</p>
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