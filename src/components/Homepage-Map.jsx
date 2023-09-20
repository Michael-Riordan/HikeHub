import { useEffect, useState } from "react";
import Map, {Marker, Popup} from 'react-map-gl';
import treeIcon from '../assets/tree-svgrepo-com.svg';
import noImageIcon from '../assets/no-image-icon.jpg';
import AdventureAutocomplete from "./AdventureAutocomplete";
import StateAutocomplete from "./StateAutocomplete";
import NationalParkAutocomplete from "./NationalParkAutocomplete";

export default function HomepageMap({coordinates, parks}) {
    const [allParkCoordinates, setAllParkCoordinates] = useState(coordinates.parkCoordinates);
    const [allParks, setAllParks] = useState(parks);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [viewport, setViewport] = useState({
        latitude: coordinates.userLocation.latitude,
        longitude: coordinates.userLocation.longitude,
        zoom: 6,
    });
    const [selectedParkImage, setSelectedParkImage] = useState(null);
    const [selectedActivities, setSelectedActivities] = useState(null);

    const handleActivitySelection = (activities) => {
        setSelectedActivities(activities);
    }

    useEffect(() => {
        if (selectedMarker) {
            const selectedPark = allParks.filter((park) => park.fullName === selectedMarker.parkName);
            selectedPark[0].images.length > 0 ?
            setSelectedParkImage(selectedPark[0].images[0].url) :
            setSelectedParkImage(noImageIcon);
        }
    }, [selectedMarker])

    useEffect(() => {
        const filteredParks = []
        if (selectedActivities && selectedActivities.length > 0) {
            allParks.forEach(park => {
                park.activities.forEach(parkActivity => {
                    selectedActivities.forEach(activity => {
                        if (parkActivity.name === activity.activityName) {
                            filteredParks.push(park);
                        }
                    })
                })
            })
        }
        console.log(filteredParks);
    }, [selectedActivities]);

    return (
        <div id='map-and-list'>
            <div id='filter-and-list-wrapper'>
                <div id='filters-wrapper'>
                    <StateAutocomplete />
                    <AdventureAutocomplete sendActivityToMap={handleActivitySelection} />
                    <NationalParkAutocomplete parks={parks} />
                </div>
                <div id='list'>
                    {
                        allParks.map((park) => {
                            let image;
                            park.images.length > 0 ? image = park.images[0].url : image = noImageIcon;
                            return (
                                <div id='park-and-info'>
                                    <img id='park-image' src={image} />
                                    <h2 id='park-name'>{park.fullName}</h2>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                initialViewState={viewport}
                style={{width: '100%', height: '600px',}}
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
                                <div 
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        opacity: '.7',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedMarker(coords)}
                                    >
                                    <img
                                        src={treeIcon}
                                        style={{
                                            width: '20px',
                                            height: '20px',
                                            opacity: '.8',
                                            cursor: 'pointer',
                                        }}
                                    />
                                </div>
                            </Marker>
                        );
                    })
                }
                { selectedMarker && (
                        <Popup
                            latitude={Number(selectedMarker.latitude)}
                            longitude={Number(selectedMarker.longitude)}
                            onClose={() => setSelectedMarker(null)}
                            closeOnClick={false}
                        >
                            <div id='popup-div'>
                                <img id='popup-park-image' src={selectedParkImage} />
                                <h3 id='popup-park-name'>{selectedMarker.parkName}</h3>
                            </div>
                        </Popup>
                )}
            </Map>
        </div>
    );
}