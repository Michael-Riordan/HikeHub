import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Map from "./Map";
import ImageSlider from "./ImageSlider";

export default function NatParkPage() {
    const location = useLocation();
    const [park, setPark] = useState(location.state.selectedPark);
    const [geoJsonCoordinates, setGeoJsonCoordinates] = useState([]);
    const [images, setImages] = useState([]);
    const [userLocation, setUserLocation] = useState(location.state.userCoordinates);
    const [parkActivities, setParkActivities] = useState([]);

    useEffect(() => {

        const parkCodeQuery = `?parkCode=${park.parkCode}`
        const fetchGeoJSONCoordinates = async () => {
            const response = await fetch(`http://192.168.0.59:3000/api/NationalParkGeoJson${parkCodeQuery}`);
            const jsonResponse = await response.json();
            setGeoJsonCoordinates(jsonResponse);
        }

        if (park != null) {
            fetchGeoJSONCoordinates();
        }
    }, [park]);

    useEffect(() => {
        const urls = [];
        const parkImages = park.images;
        parkImages.forEach(image => {
            urls.push(image.url);
        });

        const activities = [];
        park.activities.forEach((activity) => {
            activities.push(activity);
        })
        setParkActivities(activities);

        setImages(urls);

    }, [park]);

    return (
        <>
            {
            userLocation == null || park == null? '' : 
            <section id='rec-area-page-body'>
                <section id='rec-area-map'>
                        <ImageSlider images={images}/>
                            <Map 
                                latitude={park.latitude}
                                longitude={park.longitude}
                                geojson={geoJsonCoordinates}
                                type={'nationalPark'}
                                userLocation={userLocation}
                            />
                </section> 
                <section id='park-information'>
                    <section className='park-page-name-and-description-wrapper'>
                        <h1 className='park-page-name'>{park.fullName}</h1>  
                        <p className='park-description'>{park.description}</p>
                    </section>
                    <section className='park-activities-wrapper'>
                        {
                            parkActivities.map((activity) => {
                                return (
                                    <div>{activity.name}</div>
                                );
                            })
                        }
                    </section>
                </section>
            </section>
            }
        </>
    );
}