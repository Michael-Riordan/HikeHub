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
    const [nationalParksByArea, setNationalParksByArea] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [totalParks, setTotalParks] = useState(0);
    const [parkCount, setParkCount] = useState(0);
    const [allParkCoordinates, setAllParkCoordinates] = useState([]);

    //useRef below prevents useEffect with parkCount dependency to fetch on initial render- 
    const isFirstRender = useRef(true);

    const images = [
        HikingTrail1,
        HikingTrail2,
        HikingTrail3,
    ];

    useEffect(() => {
        const storedLocation = JSON.parse(sessionStorage.getItem('userLocation'));

        if (storedLocation != null) {
            setUserLocation(storedLocation);
        } else if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setUserLocation(location);
                //sessionStorage.setItem('userLocation', JSON.stringify(location));
            })
        } else {
            console.log('Geolocation not available');
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
                sessionStorage.setItem('userState', state);
            }
            fetchLocation();
        } /*else {
            setUserState(sessionStorage.getItem('userState'));
        }*/

    }, [userLocation, userState]);

    useEffect(() => {
        const storedNationalParkData = JSON.parse(sessionStorage.getItem('nationalParks'));
        
        //fetches national parks by state code
        const fetchNationalParks = async () => {
            const stateCodeQuery = `?stateCode=${userState}`
            const response = await fetch (`https://national-park-application-c44bb8f1d790.herokuapp.com/api/NationalParks${stateCodeQuery}`);
            const jsonResponse = await response.json();
            setNationalParksByArea(jsonResponse.data);
            //sessionStorage.setItem('nationalParks', JSON.stringify(jsonResponse.data));
        } 
        
        if (storedNationalParkData && storedNationalParkData.length > 0) {
            setNationalParksByArea(storedNationalParkData);
            setDataFetched(true);
        } else if (!dataFetched) {
            fetchNationalParks();
        }

    }, [userState, dataFetched]);

    const fetchAllParks = async () => {

        const countQuery = `?startCount=${parkCount}`;
        const response = await fetch(`https://national-park-application-c44bb8f1d790.herokuapp.com/api/AllNationalParks${countQuery}`);
        const jsonResponse = await response.json();
        setParkCount((prevCount) => Number(prevCount) + Number(jsonResponse.limit));
        setTotalParks(Number(jsonResponse.total));
        setAllNationalParks((prevResponse)=> [...prevResponse, ...jsonResponse.data]);

    }

    useEffect(() => {
        /*
            Prevent the initial double call to fetchAllParks during development:
            - During the initial mount, parkCount is initialized with 0 by useState.
            - Without the isFirstRender ref, the useEffect would run fetchAllParks
            twice on initial mount with parkCount at 0, resulting in duplicate objects.
            (<React.StrictMode> invokes render method twice in development)
        */

        const cachedAllParks = sessionStorage.getItem('allParks');

        if (cachedAllParks && JSON.parse(cachedAllParks).length > 0) {

            const parsedAllParks = JSON.parse(cachedAllParks);
            setAllNationalParks(parsedAllParks)

        } else {
            /* 
                the below switch statements take into account that in a development environment
                react will render the page twice on the initial mount (due to <React.StrictMode>)
            */
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
        const allParkCoordsCache = sessionStorage.getItem('allParkCoords');

        if (allParkCoordsCache) {
            const parsedParkCoordsCache = JSON.parse(allParkCoordsCache);
            setAllParkCoordinates(parsedParkCoordsCache);
        } else {

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
                //sessionStorage.setItem('allParkCoords', JSON.stringify(allParkCoords));

            }

        }

    }, [allNationalParks]);

    const checkStorageSizeOfObj = (obj) => {
        const str = JSON.stringify(obj);
        const encoder = new TextEncoder();
        return encoder.encode(str).length;
    }

    const getTotalSizeInBytes = (arr) => {
        let totalSize = 0;
        for (const obj of arr) {
            totalSize += checkStorageSizeOfObj(obj);
        }

        console.log(totalSize);
    }

    /*useEffect(() => {

        if (parkCount > totalParks) {
            console.log('setting all parks to session storage');
            sessionStorage.setItem('allParks', JSON.stringify(allNationalParks));
            getTotalSizeInBytes(allNationalParks);

        }

    }, [parkCount, totalParks]);
    */

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <section id='map-section'>
                    { 
                    userLocation != null && allParkCoordinates.length > 0 && allNationalParks.length > 0 ?
                        <HomepageMap 
                            coordinates={{userLocation: userLocation, parkCoordinates: allParkCoordinates}}
                            parks={allNationalParks}
                        />
                        :
                        <div className='loading-circle'>
                            <div className='circle-inner' />
                        </div>
                    }
                    
                </section>
            </section>
        </section>
    );
}