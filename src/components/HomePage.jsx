import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import { useEffect, useState } from "react";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);
    const [userTown, setUserTown] = useState(null);
    const [userState, setUserState] = useState(null);

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
                const state = jsonResult.results[7].formatted_address.split(' ')[1].replace(',', '');
                setUserState(state);
                setUserTown(town);
            }
            fetchLocation();
        }

    }, [userLocation]);

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='homepage-info-section'>
                <h1 id='info-section-header'>All Your Adventures In One Place</h1>
                <section id='adventures-section'>
                    <h2 id='adventures-header'>Activities Near You</h2>
                    <div id='adventures-wrapper'>

                    </div>
                </section>
            </section>
        </section>
    );
}