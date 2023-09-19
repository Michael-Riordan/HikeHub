import { useEffect, useState } from "react";
import Map, {Marker} from 'react-map-gl';
import treeIcon from '../assets/tree-svgrepo-com.svg';

export default function HomepageMap({coordinates, parks}) {
    const [allParkCoordinates, setAllParkCoordinates] = useState(coordinates.parkCoordinates);
    const [allParks, setAllParks] = useState(parks);
    const [viewport, setViewport] = useState({
        latitude: coordinates.userLocation.latitude,
        longitude: coordinates.userLocation.longitude,
        zoom: 4,
    });

    console.log(allParks);

    const handleParkClick = (event, parkName) => {
        const selectedPark = allParks.filter((park) => park.fullName === parkName);
        console.log(selectedPark);
    }

    return (
        <>
            <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                initialViewState={viewport}
                style={{width: '100%', height: '400px'}}
                mapStyle={'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj'}
            >
                {
                    allParkCoordinates.map((coords) => {
                        return (
                            <Marker
                                key={coords.parkName}
                                latitude={Number(coords.latitude)}
                                longitude={Number(coords.longitude)}
                                >
                                <img
                                    src={treeIcon}
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        opacity: '.7',
                                        cursor: 'pointer',
                                    }}
                                    onClick={(e) => handleParkClick(e, coords.parkName)}
                                />
                            </Marker>
                        );
                    })
                }
            </Map>
        </>
    );
}