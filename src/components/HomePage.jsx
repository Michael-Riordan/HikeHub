import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import { useEffect, useRef, useState } from "react";
import HomepageMap from "./Homepage-Map";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);
    const [userState, setUserState] = useState(null);
    const [recAreas, setRecAreas] = useState([]);
    const [recAreaImages, setRecAreaImages] = useState([]);
    const [nationalParksByArea, setNationalParksByArea] = useState([]);
    const [allNationalParks, setAllNationalParks] = useState([]);
    const [allRecAreaImages, setAllRecAreaImages] = useState([]);
    const [dataFetched, setDataFetched] = useState(false);
    const [totalParks, setTotalParks] = useState(0);
    const [parkCount, setParkCount] = useState(0);
    const [allParkCoordinates, setAllParkCoordinates] = useState([]);
    const [allParkImages, setAllParkImages] = useState([]);

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
                sessionStorage.setItem('userLocation', JSON.stringify(location));
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
                const result = await fetch(`http://192.168.0.59:3000/api/geolocation${coordinateQuery}`);
                const jsonResult = await result.json();
                const state = jsonResult.plus_code.compound_code.split(' ')[2].replace(',', '');
                setUserState(state);
                sessionStorage.setItem('userState', state);
            }
            fetchLocation();
        } else {
            setUserState(sessionStorage.getItem('userState'));
        }

    }, [userLocation, userState]);

    /*
    useEffect(() => {
        const areas = [];

        const fetchRecAreas = async () => {
            const stateCodeQuery= `?stateCode=${userState}`;
            const result = await fetch(`http://192.168.0.59:3000/api/recAreas${stateCodeQuery}`);
            const jsonResult = await result.json();
            jsonResult.RECDATA.forEach(recArea => {
                areas.push(recArea);
            })
            setRecAreas(areas);
            sessionStorage.setItem('recAreas', JSON.stringify(areas));
        }

        if (userLocation != null) {
            fetchRecAreas();
        }

    }, [userLocation, userState]);
    */

    /*useEffect(() => {
        const storedImageData = JSON.parse(sessionStorage.getItem('recAreaImages'));
        const storedAllImagesData = JSON.parse(sessionStorage.getItem('allRecImages'));

        //fetches each img related to a rec area specified by id
        const fetchRecAreaImg = async (id, name) => {
            const IdQuery = `?id=${id}`
            const response = await fetch(`http://192.168.0.59:3000/api/recAreaImg${IdQuery}`)
            const jsonResponse = await response.json();
            if (jsonResponse.RECDATA.length > 0) {
                const title = jsonResponse.RECDATA[0].Title;
                const imageURL = jsonResponse.RECDATA[0].URL;
                const recAreaID = id;
                const titleAndImage = {
                    recAreaName: name,
                    title: title,
                    imageURL: imageURL,
                    recAreaID: recAreaID,
                }
                setAllRecAreaImages((prevImages) => [...prevImages, jsonResponse]);
                setRecAreaImages((prevArray) => [...prevArray, titleAndImage]);
            }
        }
        
        if (storedImageData && storedImageData.length > 0) {
            setAllRecAreaImages(storedAllImagesData)
            setRecAreaImages(storedImageData);
        } else {
            recAreas.forEach(recArea => {
                console.log('fetching image data');
                fetchRecAreaImg(recArea.RecAreaID, recArea.RecAreaName);
            }) 
        }
    }, [recAreas]);
    */

    useEffect(() => {
        const storedNationalParkData = JSON.parse(sessionStorage.getItem('nationalParks'));
        
        //fetches national parks by state code
        const fetchNationalParks = async () => {
            const stateCodeQuery = `?stateCode=${userState}`
            const response = await fetch (`http://192.168.0.59:3000/api/NationalParks${stateCodeQuery}`);
            const jsonResponse = await response.json();
            setNationalParksByArea(jsonResponse.data);
            sessionStorage.setItem('nationalParks', JSON.stringify(jsonResponse.data));
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
        const response = await fetch(`http://192.168.0.59:3000/api/AllNationalParks${countQuery}`);
        const jsonResponse = await response.json();
        setParkCount((prevCount) => Number(prevCount) + Number(jsonResponse.limit));
        setTotalParks(Number(jsonResponse.total));
        setAllNationalParks((prevResponse)=> [...prevResponse, ...jsonResponse.data]);

    }

    useEffect(() => {
        const cachedImageURLs = sessionStorage.getItem('parkImageURLs');
        
        if (cachedImageURLs) {

            const parsedImagesCache = JSON.parse(cachedImageURLs);
            setAllParkImages(parsedImagesCache);

        } else {

            const parkImageURLs = [];
            if (parkCount > totalParks) {
                allNationalParks.forEach((park) => {
                    const parkName = park.fullName;
                    const parkImagesArr = park.images;
                    parkImageURLs.push({name: parkName, images: parkImagesArr })
                });
                
                setAllParkImages(parkImageURLs);
                sessionStorage.setItem('parkImageURLs', JSON.stringify(parkImageURLs));
            }

        }
    }, [allNationalParks]);

    useEffect(() => {
        /*
            Prevent the initial double call to fetchAllParks:
            - During the initial render, parkCount is initialized with 0 by useState.
            - Without the isFirstRender ref, the useEffect would run fetchAllParks
            twice on initial render with parkCount at 0, resulting in duplicate objects.
        */

        const cachedAllParks = sessionStorage.getItem('allParks');

        if (cachedAllParks && JSON.parse(cachedAllParks).length > 0) {

            const parsedAllParks = JSON.parse(cachedAllParks);
            setAllNationalParks(parsedAllParks)

        } else {
            if (!isFirstRender.current) {
                if (parkCount < totalParks || totalParks === 0) {
                    console.log('calling');
                    fetchAllParks();
                }
            } else {
                isFirstRender.current = false;
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
                allNationalParks.forEach(park => {
                    const parkCoords = {parkName: park.fullName, latitude: park.latitude, longitude: park.longitude}
                    allParkCoords.push(parkCoords);
                })

                setAllParkCoordinates(allParkCoords);
                sessionStorage.setItem('allParkCoords', JSON.stringify(allParkCoords));

            }

        }

    }, [allNationalParks]);

    useEffect(() => {

        if (parkCount > totalParks) {

            sessionStorage.setItem('allParks', JSON.stringify(allNationalParks));

        }

    }, [parkCount, totalParks]);

    /*useEffect(() => {

        // sessionStorage set on the last change of dependency array;
        sessionStorage.setItem('recAreaImages', JSON.stringify(recAreaImages));
        sessionStorage.setItem('allRecImages', JSON.stringify(allRecAreaImages));

    }, [allRecAreaImages, recAreaImages]);
    */

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <h1 id='homepage-info-header'>Discover Your Next Destination</h1>
                <section id='map-section'>
                    { 
                    userLocation != null && allParkCoordinates.length > 0 && allNationalParks.length > 0 && allParkImages.length > 0?
                        <HomepageMap 
                            coordinates={{userLocation: userLocation, parkCoordinates: allParkCoordinates}}
                            parks={allNationalParks}
                            images={allParkImages}
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