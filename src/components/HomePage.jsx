import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import { useEffect, useRef, useState } from "react";
import HomepageMap from "./Homepage-Map";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);
    const [userState, setUserState] = useState(null);
    const [allNationalParks, setAllNationalParks] = useState([]);
    const [totalParks, setTotalParks] = useState(0);
    const [parkCount, setParkCount] = useState(0);
    const [allParkCoordinates, setAllParkCoordinates] = useState([]);
    const dbName = 'WanderAmericaDB';
    const dbVersion = 5;

    //useRef below prevents useEffect with parkCount dependency to fetch on initial render- 
    const isFirstRender = useRef(true);
    
    const images = [
        HikingTrail1,
        HikingTrail2,
        HikingTrail3,
    ];
    
    const fetchAllParks = async () => {
    
        const countQuery = `?startCount=${parkCount}`;
        const response = await fetch(`https://national-park-application-c44bb8f1d790.herokuapp.com/api/AllNationalParks${countQuery}`);
        const jsonResponse = await response.json();
        setParkCount((prevCount) => Number(prevCount) + Number(jsonResponse.limit));
        setTotalParks(Number(jsonResponse.total));
        setAllNationalParks((prevResponse)=> [...prevResponse, ...jsonResponse.data]);
    };
    
    useEffect(() => {
        
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(location);
            })
        } else {
            setUserLocation('unavailable');
        }
    }, []);

    useEffect(() => {

        //fetches user location based off of users geolocation 
        if (userLocation != null && userState == null) {
            const fetchLocation = async () => {
                const coordinateQuery = `?coordinates=${encodeURIComponent(JSON.stringify(userLocation))}`
                const result = await fetch(`https://national-park-application-c44bb8f1d790.herokuapp.com/api/geolocation${coordinateQuery}`);
                const jsonResult = await result.json();
                const state = jsonResult.plus_code.compound_code.split(' ')[2].replace(',', '');
                setUserState(state);
            }
            fetchLocation();
        }

    }, [userLocation, userState]);

    useEffect(() => {
        /*
            To prevent the initial double call to fetchAllParks in development env:
            - During the initial mount, parkCount is initialized with 0 by useState.
            - Without the isFirstRender ref, the useEffect would run fetchAllParks
            twice on initial mount with parkCount at 0, resulting in duplicate objects.
            (Reasoning: <React.StrictMode> invokes render method twice in development)
        */
        /* 
            the below switch statements take into account that in a development environment
            react will render the page twice on the initial mount (due to <React.StrictMode>)
            *production only renders once on initial mount*
        */
        
        //checking for all parks in indexedDB database -
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['AllParks'], 'readwrite');
            const store = transaction.objectStore('AllParks');
            const getRequest = store.get(1);

            getRequest.onsuccess = (event) => {
                setAllNationalParks(event.target.result.object);
            };

            getRequest.onerror = (event) => {
                console.error('Error getting indexedDB database:', event.target.error);
            }

            getRequest.oncomplete = (event) => {
                db.close();
            }
        }


        if (allNationalParks.length === 0) {
            switch (import.meta.env.VITE_NODE_ENV) {
                case ('development'):
                    if (!isFirstRender.current) {
                        if (parkCount < totalParks || totalParks === 0) {
                            console.log('calling');
                            fetchAllParks();
                        }
                    } else {
                        isFirstRender.current = false;
                    }
                    break;
                    
                case ('production'): 
                    if (parkCount < totalParks || totalParks === 0) {
                        console.log('calling');
                        fetchAllParks();                    
                    }
                    break;
            }
        }

    }, [parkCount, totalParks]);

    useEffect(() => {
        const allParkCoords = [];
        if (allNationalParks.length === totalParks && totalParks !== 0) {
            let parkURL;
            allNationalParks.forEach(park => {
                if (park.images.length > 0) {
                    parkURL = park.images[0].url;
                }
                const parkCoords = {parkName: park.fullName, latitude: park.latitude, longitude: park.longitude, parkImage: parkURL,}
                allParkCoords.push(parkCoords);
            })
            setAllParkCoordinates(allParkCoords);
        }
    }, [allNationalParks]);

    useEffect(() => {
        //Working with indexedDB to cache all parks to avoid re-calling parks api on load screen

        if (allNationalParks.length === totalParks && totalParks !== 0) {
            const request = indexedDB.open(dbName, dbVersion);

            request.onerror = (event) => {
                console.log('Database error:', event.target.errorCode);
            }

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const storeName = 'AllParks';
                if (!db.objectStoreNames.contains(storeName)) {
                    console.log('creating store')
                    db.createObjectStore(storeName, {keyPath: 'id', autoIncrement: true});
                }
            }
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['AllParks'], 'readwrite');
                const store = transaction.objectStore('AllParks');
                const result = store.get(1);
                
                if (!result.object) {
                    const allParks = { id: 1, name: 'parksObject', object: allNationalParks};
                    const addRequest = store.add(allParks);
    
                    addRequest.onerror = (event) => {
                        addRequest.oncomplete = (event) => {
                            db.close();
                        }
    
                        if (event.target.error.message === 'Key already exists in the object store.') {
    
                            return;
    
                        } else {
    
                            console.error('Error adding parks to DB:', event.target.error);
    
                        }
                    }
                    
                    addRequest.onsuccess = (event) => {
    
                        console.log('Successfully added all parks to DB');
    
                    }
    
                    addRequest.oncomplete = (event) => {
                        db.close();
                    }
                }
            }
        }

    }, [allNationalParks, totalParks]);

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <section id='map-section'>
                    {
                    allParkCoordinates.length > 0 && allNationalParks.length > 0 ?
                        <HomepageMap 
                            coordinates={{userLocation: userLocation, parkCoordinates: allParkCoordinates}}
                            parks={allNationalParks}
                        />
                        :
                        <>
                            <div className='loading-circle'>
                                <div className='circle-inner' />
                            </div>
                            <div id='loading-text-wrapper'>
                                <p id='loading-text'>
                                    Loading Map<span id='loading-dots'>...</span>
                                </p>
                            </div>
                        </>
                    }
                    
                </section>
            </section>
        </section>
    );
}