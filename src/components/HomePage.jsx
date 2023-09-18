import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import NoImageIcon from '../assets/no-image-icon.jpg'
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    console.log(allNationalParks);

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

    useEffect(() => {
        const storedImageData = JSON.parse(sessionStorage.getItem('recAreaImages'));
        const storedAllImagesData = JSON.parse(sessionStorage.getItem('allRecImages'));

        //fetches each img related to a rec area specified by id
        const fetchRecAreaImg = async (id, name) => {
            const IdQuery = `?id=${id}`
            const results = await fetch(`http://192.168.0.59:3000/api/recAreaImg${IdQuery}`)
            const jsonResults = await results.json();
            if (jsonResults.RECDATA.length > 0) {
                const title = jsonResults.RECDATA[0].Title;
                const imageURL = jsonResults.RECDATA[0].URL;
                const recAreaID = id;
                const titleAndImage = {
                    recAreaName: name,
                    title: title,
                    imageURL: imageURL,
                    recAreaID: recAreaID,
                }
                setAllRecAreaImages((prevImages) => [...prevImages, jsonResults]);
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

    useEffect(() => {
        const storedData = JSON.parse(sessionStorage.getItem('nationalParks'));
        
        //fetches national parks by state code
        const fetchNationalParks = async () => {
            const stateCodeQuery = `?stateCode=${userState}`
            const results = await fetch (`http://192.168.0.59:3000/api/NationalParks${stateCodeQuery}`);
            const jsonResults = await results.json();
            setNationalParksByArea(jsonResults.data);
            sessionStorage.setItem('nationalParks', JSON.stringify(jsonResults.data));
        } 
        
        if (storedData && storedData.length > 0) {
            setNationalParksByArea(storedData);
            setDataFetched(true);
        } else if (!dataFetched) {
            fetchNationalParks();
        }

    }, [userState, dataFetched]);

    useEffect(() => {

        const fetchAllParks = async () => {
            //const results = await fetch (`https://developer.nps.gov/api/v1/parks?apikey`);
            const jsonResults = await results.json();
            setTotalParks(jsonResults.total);
            setParkCount((prevCount) => prevCount + jsonResults.count);
            setAllNationalParks((prevResults)=> [...prevResults, jsonResults]);
        }

        if (parkCount === 0) {
            fetchAllParks();
        }

    }, [allNationalParks, parkCount, totalParks]);

    useEffect(() => {

        // sessionStorage set on the last change of dependency array;
        sessionStorage.setItem('recAreaImages', JSON.stringify(recAreaImages));
        sessionStorage.setItem('allRecImages', JSON.stringify(allRecAreaImages));

    }, [allRecAreaImages, recAreaImages]);

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <h1 id='info-section-header'>Adventures Near You</h1>
                <section id='national-parks-section'>
                    <h2 id='adventures-header'>National Parks In {userState}</h2>
                    <div id='homepage-near-you-wrapper'>
                        {
                            nationalParksByArea.length > 0 ?
                            nationalParksByArea.map((park) => {
                                let parkImage;
                                let parkImageTitle;
                                if (park.images[0] != undefined) {
                                    parkImage = park.images[0].url;
                                    parkImageTitle = park.images[0].title;
                                } else {
                                    parkImage = NoImageIcon;
                                    parkImageTitle = `No Image Available for ${park.fullName}`
                                }
                                return (
                                    <Link 
                                        id='areaAndImage' 
                                        key={park.fullName}
                                        to='/NatParkPage' 
                                        state={{
                                            selectedPark: park,
                                            userCoordinates: userLocation,
                                        }}
                                    >
                                        <img src={parkImage} alt={`${park.fullName} photo`} className='recAreaImage'/>
                                        <h1 id='rec-area-name'>{park.fullName}</h1>
                                    </Link>
                                );
                            }) : ''
                        }
                    </div>
                </section>
                <section id='adventures-section'>
                    <h2 id='adventures-header'>Recreation Areas In {userState}</h2>
                    <div id='homepage-near-you-wrapper'>
                        {
                            recAreaImages.map((recArea) => {
                                const storedRecAreas = JSON.parse(sessionStorage.getItem('recAreas'));
                                return (
                                    <Link id='areaAndImage' 
                                          key={recArea.recAreaID}
                                          to='/RecAreaPage'
                                          state={{selectedRecArea: recArea.recAreaID, 
                                                  recAreas: storedRecAreas == null ? recAreas : storedRecAreas, 
                                                  recAreaImages: allRecAreaImages,
                                                  userCoordinates: userLocation,
                                                }}
                                    >
                                        <img src={recArea.imageURL} alt='rec area image' className='recAreaImage'/>
                                        <h1 id='rec-area-name'>{recArea.recAreaName}</h1>
                                    </Link>
                                );
                            })
                        }
                    </div>
                </section>
                <section>
                    {   
                    userLocation != null ?
                        <HomepageMap coordinates={userLocation}/>
                    : ''
                    }
                </section>
            </section>
        </section>
    );
}