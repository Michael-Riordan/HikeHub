import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import NoImageIcon from '../assets/no-image-icon.jpg'
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);
    const [userTown, setUserTown] = useState(null);
    const [userState, setUserState] = useState(null);
    const [recAreas, setRecAreas] = useState([]);
    const [recAreaImages, setRecAreaImages] = useState([]);
    const [nationalParksByArea, setNationalParksByArea] = useState([]);
    const [selectedNationalParkID, setSelectedNationalParkID] = useState(null);

    const navigate = useNavigate();

    const images = [
        HikingTrail1,
        HikingTrail2,
        HikingTrail3,
    ]

    const handleNationalParkClick = (id) => {
        navigate('/NatParkPage')
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
            console.log('Geolocation not available');
        }
    }, []);

    useEffect(() => {
        if (userLocation != null) {
            const fetchLocation = async () => {
                const coordinateQuery = `?coordinates=${encodeURIComponent(JSON.stringify(userLocation))}`
                const result = await fetch(`http://192.168.0.59:3000/api/geolocation${coordinateQuery}`);
                const jsonResult = await result.json();
                const town = jsonResult.results[7].formatted_address.split(' ')[0].replace(',', '');
                const state = jsonResult.plus_code.compound_code.split(' ')[2].replace(',', '');
                setUserState(state);
                setUserTown(town);
            }
            fetchLocation();
        }

    }, [userLocation]);

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
        }

        if (userLocation != null) {
            fetchRecAreas();
        }

    }, [userLocation, userState])

    useEffect(() => {
        const URLS = [];

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
                setRecAreaImages((prevArray) => [...prevArray, titleAndImage]);
            }
        }
        
        recAreas.forEach(recArea => {
            fetchRecAreaImg(recArea.RecAreaID, recArea.RecAreaName);
        })
    }, [recAreas])

    useEffect(() => {

        const fetchNationalParks = async () => {
            const stateCodeQuery = `?stateCode=${userState}`
            const results = await fetch (`http://192.168.0.59:3000/api/NationalParks${stateCodeQuery}`);
            const jsonResults = await results.json();
            setNationalParksByArea(jsonResults.data);
        } 

        fetchNationalParks();

    }, [userState]);

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <h1 id='info-section-header'>Adventures Near You</h1>
                <section id='national-parks-section'>
                    <h2 id='adventures-header'>National Parks In {userState}</h2>
                    <div id='homepage-near-you-wrapper'>
                        {
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
                                        onClick={() => {
                                            handleNationalParkClick(park.id);
                                        }} 
                                        key={park.fullName}
                                        to='/NatParkPage' 
                                        state={park.parkCode}
                                    >
                                        <h1 id='rec-area-name'>{park.fullName}</h1>
                                        <img src={parkImage} alt={`${park.fullName} photo`} className='recAreaImage'/>
                                        <p id='image-title'>{parkImageTitle}</p>
                                    </Link>
                                );
                            })
                        }
                    </div>
                </section>
                <section id='adventures-section'>
                    <h2 id='adventures-header'>Recreation Areas Near {userTown}</h2>
                    <div id='homepage-near-you-wrapper'>
                        {
                            recAreaImages.map((recArea) => {
                                return (
                                    <Link id='areaAndImage' 
                                          key={recArea.recAreaID}
                                          to='/RecAreaPage'
                                          state={recArea.recAreaID}
                                    >
                                        <h1 id='rec-area-name'>{recArea.recAreaName}</h1>
                                        <img src={recArea.imageURL} alt='rec area image' className='recAreaImage'/>
                                        <p id='image-title'>{recArea.title}</p>
                                    </Link>
                                );
                            })
                        }
                    </div>
                </section>
            </section>
        </section>
    );
}