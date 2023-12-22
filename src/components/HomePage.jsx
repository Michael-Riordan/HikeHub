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
    const serverEndPoint = import.meta.env.VITE_HEROKU_ENDPOINT;
    const dbName = 'IDB';
    const dbVersion = 1;
    //useRef below prevents useEffect with parkCount dependency to fetch on initial render- 
    const isFirstRender = useRef(true);
    
    const images = [
        HikingTrail1,
        HikingTrail2,
        HikingTrail3,
    ];
    
    /*
    below useEffect is used to download park images from API provided url 
    and place them inside of a folder in the server side application folder

    useEffect(() => {
        let urls = [];

        const downloadImages = async (urls) => {  
            fetch('http://localhost:3000/api/imageDownloader', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls: urls}),
            })
        }


        allParkCoordinates.forEach(coord => {
            const url = coord.parkImage;
            urls.push(url);
        });

        downloadImages(urls);

    }, [allParkCoordinates]);
    */
    
    const fetchAllParks = async () => {
    
        const countQuery = `?startCount=${parkCount}`;
        const response = await fetch(`${serverEndPoint}/api/AllNationalParks${countQuery}`);
        const jsonResponse = await response.json();
        setParkCount((prevCount) => Number(prevCount) + Number(jsonResponse.limit));
        setTotalParks(Number(jsonResponse.total));
        setAllNationalParks((prevResponse)=> [...prevResponse, ...jsonResponse.data]);
    }
    
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
                const result = await fetch(`${serverEndPoint}/api/geolocation${coordinateQuery}`);
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

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const storeName = 'AllParks';
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, {keyPath: 'id', autoIncrement: true});
            }
        }
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['AllParks'], 'readwrite');
            const store = transaction.objectStore('AllParks');
            const getParks = store.get(1);
            getParks.onsuccess = (event) => {
                if (!event.target.result) {
                    switch (import.meta.env.VITE_NODE_ENV) {
                        case ('development'):
                            if (!isFirstRender.current) {
                                if (parkCount < totalParks || totalParks === 0) {
                                    ('calling');
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
                } else {
                    const transaction = db.transaction(['AllParks'], 'readwrite');
                    const store = transaction.objectStore('AllParks');
                    const getParks = store.get(1);
    
                    getParks.onsuccess = (event) => {
                        setAllNationalParks(event.target.result.object);
                    };
        
                    getParks.onerror = (event) => {
                        console.error('Error getting parks:', event.target.error);
                    }
    
                    const getCoords = store.get(2);
                    
                    getCoords.onsuccess = (event) => {
                        setAllParkCoordinates(event.target.result.object)
                    }
    
                    getCoords.onerror = (event) => {
                        console.error('Error getting park coords:', event.target.error)
                    }
    
                    getCoords.oncomplete = (event) => {
                        db.close();
                    }
                }   
            }
        }

        request.onerror = (event) => {
            console.error('DB error:', event.target.error);
        }

    }, [parkCount, totalParks]);

    useEffect(() => {
        const allParkCoords = [];
        if (allNationalParks.length === totalParks && totalParks !== 0) {
            let parkURL;
            allNationalParks.forEach(park => {
                if (park.images.length > 0) {
                    parkURL = park.images[0].url;
                    //let downloadQuery = `?url=${parkURL}`
                    //fetch(`http://localhost:3000/api/imageDownloader${downloadQuery}`)
                }
                const parkCoords = {parkName: park.fullName, latitude: park.latitude, longitude: park.longitude, parkImage: parkURL,}
                allParkCoords.push(parkCoords);
            })
            setAllParkCoordinates(allParkCoords);
        }
    }, [allNationalParks]);

    useEffect(() => {
        if (allParkCoordinates.length === allNationalParks.length && allParkCoordinates.length !== 0) {
            const request = indexedDB.open(dbName, dbVersion);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['AllParks'], 'readwrite');
                const store = transaction.objectStore('AllParks');

                cacheData(1, store, 'allParks', allNationalParks);
                cacheData(2, store, 'allParkCoords', allParkCoordinates);

                transaction.oncomplete = () => {
                    db.close();
                }
            }

            request.onerror = (event) => {
                console.error('Error opening DB:', event.target.error);
            }
        }

    }, [allParkCoordinates, allNationalParks, totalParks]);

    /*
    useEffect(() => {
        const fetchParkImages = async () => {
            const response = await fetch('http://localhost:3000/api/parkImages');
            const jsonResponse = await response.json();
            console.log(jsonResponse);
        }

        fetchParkImages();
        
    }, [allNationalParks, allParkCoordinates])
    */
    

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <section id='map-section'>
                    {
                    allNationalParks.length > 0 && allParkCoordinates.length > 0 ?
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
                                    Getting map ready<span id='loading-dots'>...</span>
                                </p>
                            </div>
                        </>
                    }
                    
                </section>
            </section>
        </section>
    );
}

function cacheData(id, store, name, data) {
    //caches data in indexDB
    const result = store.get(id);
    result.onsuccess = (event) => {
        if (!event.target.result) {
            const dataToCache = { id: id, name: name, object: data };
            const addRequest = store.add(dataToCache);

            addRequest.onerror = (event) => {
                if (event.target.error.name !== 'ConstraintError') {
                    console.error(`Error adding ${name} to DB:`, event.target.error);
                }
            };

            addRequest.onsuccess = (event) => {
                console.log(`Successfully added ${name} to DB`);
            };
        }
    };
}