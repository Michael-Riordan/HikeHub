import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Map from "./Map";
import ImageSlider from "./ImageSlider";

export default function NatParkPage() {
    const location = useLocation();
    const [park, setPark] = useState(location.state.selectedPark);
    const [geoJsonCoordinates, setGeoJsonCoordinates] = useState([]);
    const [images, setImages] = useState([]);
    const [userLocation, setUserLocation] = useState(location.state.userLocation);
    const [parkActivities, setParkActivities] = useState([]);
    console.log(park, userLocation);

    useEffect(() => {

        const parkCode = park[0].parkCode;
        const parkCodeQuery = `?parkCode=${parkCode}`
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
        const parkImages = park[0].images;
        parkImages.forEach(image => {
            urls.push(image.url);
        });

        const activities = [];
        console.log(park[0]);
        park[0].activities.forEach((activity) => {
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
                                latitude={park[0].latitude}
                                longitude={park[0].longitude}
                                geojson={geoJsonCoordinates}
                                type={'nationalPark'}
                                userLocation={userLocation}
                            />
                </section> 
                <section id='park-information'>
                    <section className='park-page-name-and-description-wrapper'>
                        <h1 className='park-page-name'>{park[0].fullName}</h1>  
                        <p className='park-description'>{park[0].description}</p>
                        <section className='park-activities-section'>
                            <h1 id='activities-header'>Activities in {park[0].fullName}</h1>
                            <ul id='activities-wrapper'>
                                {
                                    parkActivities.map((activity) => {
                                        return (
                                            <div id='activity' key={activity.name}>
                                                {activity.name}
                                                
                                            </div>
                                        );
                                    })
                                }
                            </ul>
                        </section>
                    </section>
                </section>
            </section>
            }
        </>
    );
}