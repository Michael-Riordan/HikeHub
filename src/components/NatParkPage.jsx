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
    const [thingsToDo, setThingsToDo] = useState([]);
    const [fetchingThingsToDo, setFetchingThingsToDo] = useState(true);
    const [groupedActivities, setGroupedActivities] = useState(null);
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
        park[0].activities.forEach((activity) => {
            activities.push(activity);
        })
        setParkActivities(activities);

        setImages(urls);

    }, [park]);

    useEffect(() => {
        const parkCode = park[0].parkCode;
        const parkCodeQuery = `?parkCode=${parkCode}`;
        let activitiesObject = {};

        const fetchThingsToDo = async () => {
            const response = await fetch(`http://192.168.0.59:3000/api/NatParkThingsToDo${parkCodeQuery}`);
            const jsonResponse = await response.json();
            setThingsToDo(jsonResponse);
            jsonResponse.data.forEach(activity => {
                const activityType = activity.activities[0].name;
                const activityTitle = activity.title;
                const activityDescription = activity.shortDescription;
                const activityImage = activity.images[0].url;

                if (!activitiesObject[activityType]) {
                    activitiesObject[activityType] = [];
                }

                activitiesObject[activityType].push({name: activityTitle, description: activityDescription, image: activityImage});
            })

            setGroupedActivities(activitiesObject);
        }
        
        fetchThingsToDo();
        setFetchingThingsToDo(false);
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
                                    thingsToDo ?
                                    thingsToDo.data.map((activity) => {
                                        return (
                                            <div id='activity' key={activity.id}>
                                                <h2>{activity.activities[0].name}</h2>
                                                <img id='activity-image' src={activity.images[0].url} />
                                                <p id='activity-description'>{activity.shortDescription}</p>
                                            </div>
                                        );
                                    })
                                    : ''
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