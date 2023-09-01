import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'
import { useEffect } from "react";

export default function HomePage() {
    const [userLocation, setUserLocation] = useState(null);

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

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
            <section id='hikehub-info-section'>
                <h1 id='info-section-header'>All Your Adventures In One Place</h1>
            </section>
        </section>
    );
}