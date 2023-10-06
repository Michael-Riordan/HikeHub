import { useState } from "react";
import Map, {Marker, Popup} from 'react-map-gl';
import treeIcon from '../assets/tree-svgrepo-com.svg'

export default function ActivityMap({coords}) {

    const [viewport, setViewport] = useState({
        latitude: coords.lat === '' ? coords.parkLatLng.lat : coords.lat,
        longitude: coords.lng === '' ? coords.parkLatLng.lng : coords.lng,
        zoom: 6,
    });
    const [markerSelected, setMarkerSelected] = useState(true);
    const directionsPointer = coords.lat === '' ? encodeURI(coords.parkAddress.line2) : `${coords.parkLatLng.lat},${coords.parkLatLng.lng}`;

    return (
            <Map
                initialViewState={viewport}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                style={{width: '100%', height: '600px',}}
                mapStyle={'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj'}
            >
                <Marker
                    latitude={Number(coords.parkLatLng.lat)}
                    longitude={Number(coords.parkLatLng.lng)}
                    onClick={() => setMarkerSelected(true)}
                >
                    <img
                        src={treeIcon}
                        style={{
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                        }}
                    />
                </Marker>
                {
                    markerSelected && (
                        <Popup
                            latitude={coords.lat === '' ? coords.parkLatLng.lat : Number(coords.lat)}
                            longitude={coords.lng === '' ? coords.parkLatLng.lng : Number(coords.lng)}
                            closeOnClick={false}
                            onClose={() => setMarkerSelected(false)}
                        >
                            <div id='popup-div'>
                                <img id='popup-park-image' src={coords.image} />
                                <h3 id='popup-park-name'>{coords.name}</h3>
                                <a 
                                    href={`https://www.google.com/maps/dir/${coords.userLocation.latitude}, ${coords.userLocation.longitude}/${directionsPointer}`}
                                    target='_blank'
                                    id='popup-link'
                                >
                                    Get Directions
                                </a>
                            </div>
                        </Popup>
                    )
                }
            </Map>
        );
}