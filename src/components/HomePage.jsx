import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import NoImageIcon from '../assets/no-image-icon.jpg'
import { useEffect, useState } from "react";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);
    const [userTown, setUserTown] = useState(null);
    const [userState, setUserState] = useState(null);
    const [recAreas, setRecAreas] = useState([]);
    const [recAreaImages, setRecAreaImages] = useState([]);
    const [nationalParksByArea, setNationalParksByArea] = useState([]);

    const images = [
        HikingTrail1,
        HikingTrail2,
        HikingTrail3,
    ]

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
            const coordinateQuery = `?coordinates=${encodeURIComponent(JSON.stringify(userLocation))}`
            const result = await fetch(`http://192.168.0.59:3000/api/recAreas${coordinateQuery}`);
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

        const fetchRecAreaImg = async (id) => {
            const IdQuery = `?id=${id}`
            const results = await fetch(`http://192.168.0.59:3000/api/recAreaImg${IdQuery}`)
            const jsonResults = await results.json();
            if (jsonResults.RECDATA.length > 0) {
                const title = jsonResults.RECDATA[0].Title;
                const imageURL = jsonResults.RECDATA[0].URL;
                const recAreaID = id;
                const titleAndImage = {
                    title: title,
                    imageURL: imageURL,
                    recAreaID: recAreaID,
                }
                URLS.push(titleAndImage);
                setRecAreaImages(URLS);
            }

        }

        recAreas.forEach(recArea => {
            fetchRecAreaImg(recArea.RecAreaID);
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
                <h1 id='info-section-header'>All Outdoor Adventures In One Place</h1>
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
                                    <div id='areaAndImage'>
                                        <h1 id='rec-area-name'>{park.fullName}</h1>
                                        <img src={parkImage} alt={`${park.fullName} photo`} className='recAreaImage'/>
                                        <p id='image-title'>{parkImageTitle}</p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </section>
                <section id='adventures-section'>
                    <h2 id='adventures-header'>Recreation Areas Near {userTown}</h2>
                    <div id='homepage-near-you-wrapper'>
                        {
                            recAreas.map((recArea) => {
                                let imageLink;
                                let imageTitle;
                                recAreaImages.forEach(image => {
                                    if (image.recAreaID === recArea.RecAreaID) {
                                        imageLink = image.imageURL;
                                        imageTitle = image.title;
                                   } else {
                                    imageLink = NoImageIcon;
                                   }
                                })
                                return (
                                    <div id='areaAndImage'>
                                        <h1 key={recArea.RecAreaID} id='rec-area-name'>{recArea.RecAreaName}</h1>
                                        <a href={imageLink} key={recArea.RecAreaName}>
                                            <img src={imageLink} alt='rec area image' className='recAreaImage'/>
                                        </a>
                                        <p id='image-title'>{imageLink === NoImageIcon? `No Image Available for ${recArea.RecAreaName}` : imageTitle}</p>
                                    </div>
                                );
                            })
                        }
                    </div>
                </section>
            </section>
        </section>
    );
}