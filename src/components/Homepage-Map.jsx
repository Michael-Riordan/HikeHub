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
    const [viewport, setViewport] = useState({
        latitude: coordinates.userLocation.latitude,
        longitude: coordinates.userLocation.longitude,
        zoom: 6,
    });
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [selectedParkImage, setSelectedParkImage] = useState(null);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [filteredParkCoordinates, setFilteredParkCoordinates] = useState(coordinates.parkCoordinates);
    const [filteredParks, setFilteredParks] = useState(parks);
    const [selectedState, setSelectedState] = useState([]);
    const [parksByState, setParksByState] = useState([]);
    const [parksByActivities, setParksByActivities] = useState([]);
    const [selectedNationalParks, setSelectedNationalParks] = useState([]);
    const [parksBySelectedPark, setParksBySelectedPark] = useState([]);

    const handleActivitySelection = (activities) => {
        setSelectedActivities(activities);
    }

    const handleStateSelection = (states) => {
        setSelectedState(states);
    }

    const handleNationalParkSelection = (selectedParks) => {
        setSelectedNationalParks(selectedParks);
    }

    const filterCoords = (parksToFilter, coordsToFilter) => {
        const filteredCoords = [];
        parksToFilter.forEach(park => {
            coordsToFilter.forEach(coord => {
                if (park.fullName === coord.parkName) {
                    filteredCoords.push(coord);
                }
            })
        })
        console.log(filteredCoords);
        return filteredCoords;
    }

    //future code for refactoring.
    /*const filteredParks = (filtered, filter) => {
        filtered.forEach((item) => {
            filter.forEach((filter) => {
                if (item.)
            })
        })
    }
    */

    useEffect(() => {
        if (selectedMarker) {
            const selectedPark = allParks.filter((park) => park.fullName === selectedMarker.parkName);
            selectedPark[0].images.length > 0 ?
            setSelectedParkImage(selectedPark[0].images[0].url) :
            setSelectedParkImage(noImageIcon);
        }
    }, [selectedMarker])

    useEffect(() => {
        //filters out the parks that do not have all elements of selected activities in their respective activity array.

        if (selectedActivities.length > 0) {
            const filteredParksByActivities = allParks.filter((park) => {
                const parkActivityNames = park.activities.map((activity) => activity.name);
                return selectedActivities.every((activity) => parkActivityNames.includes(activity.activityName));
            });

            setParksByActivities(filteredParksByActivities);
        } else {
            setParksByActivities([]);
        }
    }, [selectedActivities]);

    useEffect(() => {
        if (selectedState.length > 0) {
            const filteredParksByState = allParks.filter((park) => {
                return selectedState.every((state) => park.states.includes(state));
            });
            setParksByState(filteredParksByState);
        } else {
            setParksByState([]);
        }
    }, [selectedState]);

    useEffect(() => {
        if (selectedNationalParks.length > 0) {
            const parkByName = [];
            allParks.forEach((park) => {
                selectedNationalParks.forEach((selectedPark) => {
                    if (park.fullName === selectedPark.fullName) {
                        parkByName.push(park);
                    }
                })
            })
            setParksBySelectedPark(parkByName);
        } else {
            setParksBySelectedPark(allParks);
        }
    }, [selectedNationalParks])

    useEffect(() => {
        if (parksByActivities.length > 0 && parksByState.length > 0 ) {
            const filteredParksByActivitiesAndState = [];
            parksByActivities.forEach(park => {
                parksByState.forEach(state => {
                    if (park.fullName === state.fullName) {
                        filteredParksByActivitiesAndState.push(park);
                    }
                })
            })
            if (selectedNationalParks.length === 0) {
                const filteredCoordsByFilteredParks = filterCoords(filteredParksByActivitiesAndState, allParkCoordinates);
                setFilteredParks(filteredParksByActivitiesAndState);
                setFilteredParkCoordinates(filteredCoordsByFilteredParks);
            } else {
                const selectedParksWithFilters = [];
                filteredParksByActivitiesAndState.forEach(park => {
                    parksBySelectedPark.forEach(selection => {
                        if (park.fullName === selection.fullName) {
                            selectedParksWithFilters.push(park);
                        }
                    })
                })
                const selectedParkWithFiltersCoords = filterCoords(selectedParksWithFilters, allParkCoordinates);
                setFilteredParkCoordinates(selectedParkWithFiltersCoords);
                setFilteredParks(selectedParksWithFilters);
            }
        } else if (parksByState.length > 0) {
            if (selectedNationalParks.length === 0) {
                const filteredCoordsByState = filterCoords(parksByState, allParkCoordinates);
                setFilteredParkCoordinates(filteredCoordsByState);
                setFilteredParks(parksByState);
            } else {
                const selectedParksWithStateFilter = [];
                parksByState.forEach(park => {
                    parksBySelectedPark.forEach(selection => {
                        if (park.fullName === selection.fullName) {
                            selectedParksWithStateFilter.push(park);
                        }
                    })
                })
                const selectedParkWithStateFilterCoords = filterCoords(selectedParksWithStateFilter, allParkCoordinates);
                setFilteredParkCoordinates(selectedParkWithStateFilterCoords);
                setFilteredParks(selectedParksWithStateFilter);
            }

        } else if (parksByActivities.length > 0) {
            if (selectedNationalParks.length === 0) {
                const filteredCoordsByActivities = filterCoords(parksByActivities, allParkCoordinates);
                setFilteredParkCoordinates(filteredCoordsByActivities);
                setFilteredParks(parksByActivities);  
            } else {
                const selectedParksWithActivityFilter = [];
                parksByActivities.forEach(park => {
                    parksBySelectedPark.forEach(selection => {
                        if (park.fullName === selection.fullName) {
                            selectedParksWithActivityFilter.push(park);
                        }
                    })
                })
                const selectedParksWithActivityFilterCoords = filterCoords(selectedParksWithActivityFilter, allParkCoordinates);
                setFilteredParkCoordinates(selectedParksWithActivityFilterCoords);
                setFilteredParks(selectedParksWithActivityFilter);
            }
        } else {
            if (selectedNationalParks.length === 0) {
                setFilteredParkCoordinates(allParkCoordinates);
                setFilteredParks(parksBySelectedPark);
            } else {
                const selectedParksNoFilters = filterCoords(parksBySelectedPark, filteredParkCoordinates);
                setFilteredParks(parksBySelectedPark);
                setFilteredParkCoordinates(selectedParksNoFilters);
            }
        }
    }, [parksByState, parksByActivities, parksBySelectedPark]);


    return (
        <div id='map-and-list'>
            <div id='filter-and-list-wrapper'>
                <div id='filters-wrapper'>
                    <StateAutocomplete sendStateToMap={handleStateSelection}/>
                    <AdventureAutocomplete sendActivityToMap={handleActivitySelection} />
                    <NationalParkAutocomplete parks={parks} sendNationalParksToMap={handleNationalParkSelection}/>
                </div>
                <div id='list'>
                    {
                        filteredParks.map((park) => {
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
                    filteredParkCoordinates.map((coords) => {
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
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setSelectedMarker(coords)}
                                    >
                                    <img
                                        src={treeIcon}
                                        style={{
                                            width: '25px',
                                            height: '25px',
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