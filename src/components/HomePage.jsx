import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import { useEffect, useState } from "react";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);
    const [userTown, setUserTown] = useState(null);
    const [userState, setUserState] = useState(null);
    const [recAreas, setRecAreas] = useState([]);
    console.log(userLocation);

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
                const result = await fetch(`http://localhost:3000/api/geolocation${coordinateQuery}`);
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
        const images = [];

        const fetchRecAreas = async () => {
            const coordinateQuery = `?coordinates=${encodeURIComponent(JSON.stringify(userLocation))}`
            const result = await fetch(`http://localhost:3000/api/recAreas${coordinateQuery}`);
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

    /*useEffect(() => {
        const urls = [];

        const FetchRecAreaImg = async (id) => {
            const result = await fetch(`https://ridb.recreation.gov/api/v1/recareas/${id}/media?limit=50&offset=0&apikey=9bf6a5ef-ff3a-406f-8c75-8663720bc514`)
            const jsonResult = await result.json();
            console.log(jsonResult);
        }

        recAreas.forEach(recArea => {
            FetchRecAreaImg(recArea.RecAreaID);
        })
    }, [recAreas])
    */

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <h1 id='info-section-header'>All Your Adventures In One Place</h1>
                <section id='adventures-section'>
                    <h2 id='adventures-header'>Recreation Areas Near You</h2>
                    <div id='activities-wrapper'>
                        {
                            recAreas.map((recArea) => {
                                return (
                                    <>
                                        <h1>{recArea.RecAreaName}</h1>
                                    </>
                                );
                            })
                        }
                    </div>
                </section>
            </section>
        </section>
    );
}