import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Map from "./Map";
import ImageSlider from "./ImageSlider";

export default function NatParkPage() {
    const location = useLocation();
    const [park, setPark] = useState(location.state);
    const [geoJsonCoordinates, setGeoJsonCoordinates] = useState([]);
    const [images, setImages] = useState([]);

    useEffect(() => {
        
        const parkCodeQuery = `?parkCode=${park.parkCode}`
        const fetchGeoJSONCoordinates = async () => {
            const response = await fetch(`http://192.168.0.59:3000/api/NationalParkGeoJson${parkCodeQuery}`);
            const jsonResponse = await response.json();
            setGeoJsonCoordinates(jsonResponse);
        }
        fetchGeoJSONCoordinates();
    }, []);

    useEffect(() => {
        const urls = [];
        const parkImages = park.images;
        parkImages.forEach(image => {
            urls.push(image.url);
        });

        setImages(urls);
        console.log(urls);

    }, []);

    return (
        <>
            <section id='rec-area-page-body'>
                    <section id='rec-area-map'>
                        <ImageSlider images={images}/>
                        <Map 
                            latitude={park.latitude}
                            longitude={park.longitude}
                            geojson={geoJsonCoordinates}
                            type={'nationalPark'}
                        />
                    </section> 
                    <h1 className='park-page-name'>{park.fullName}</h1>  
            </section>
        </>
    );
}