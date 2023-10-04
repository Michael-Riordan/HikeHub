import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ParkMap from "./ParkMap";
import ImageSlider from "./ImageSlider";

export default function NatParkPage() {
    const [geoJsonCoordinates, setGeoJsonCoordinates] = useState([]);
    const [images, setImages] = useState([]);
    const [groupedActivities, setGroupedActivities] = useState(null);
    const [keys, setKeys] = useState([]);

    const location = useLocation();
    const park = location.state.selectedPark;
    const userLocation = location.state.userLocation;
    
    
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

        setImages(urls);

    }, [park]);

    useEffect(() => {
        const parkCode = park[0].parkCode;
        const parkCodeQuery = `?parkCode=${parkCode}`;
        let activitiesObject = {};

        const fetchThingsToDo = async () => {
            const response = await fetch(`http://192.168.0.59:3000/api/NatParkThingsToDo${parkCodeQuery}`);
            const jsonResponse = await response.json();
            jsonResponse.data.forEach(activity => {
                const activityType = activity.activities[0].name;
                if (activityType === 'Hiking') {
                    if (activity.latitude === '') {
                        console.log(activity);
                    }
                }
                const activityTitle = activity.title;
                const activityDescription = activity.shortDescription;
                const activityImage = activity.images[0].url;
                const activityLngLat = {lat: activity.latitude, lng: activity.longitude}

                if (!activitiesObject[activityType]) {
                    activitiesObject[activityType] = [];
                }

                activitiesObject[activityType].push({name: activityTitle, description: activityDescription, image: activityImage, coords: activityLngLat});
            })

            setGroupedActivities(activitiesObject);
            setKeys(Object.keys(activitiesObject));
        }
        
        fetchThingsToDo();
    }, [park]);

    return (
        <>
            {
            userLocation == null || park == null? '' : 
            <section id='rec-area-page-body'>
                <section id='rec-area-map'>
                        <ImageSlider images={images}/>
                            <ParkMap 
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
                    </section>
                    <section className='park-activities-section'>
                        <h2 id='activities-header'>Activities in {park[0].fullName}</h2>
                        <ul id='activities-wrapper'>
                            {
                                groupedActivities ?
                                keys.map((key) => {
                                    const activityList = groupedActivities[key];
                                    return (
                                        <div id='activity-name-and-list' key={key}>
                                            <h2 id='activity'>{key}</h2>
                                            <div id='activity-list'>
                                                    {
                                                        activityList.map((activity) => {
                                                            return (
                                                                <Link key={activity.name} id='activity-wrapper' to='/SelectedActivity' state={{activityName: activity.name, latitude: activity.coords.lat, longitude: activity.coords.lng}}>
                                                                    <h1 id='activity-name'>{activity.name}</h1>
                                                                    <img className='activity-image' src={activity.image} />
                                                                    <p id='activity-description'>{activity.description}</p>
                                                                </Link>

                                                            );
                                                        })
                                                    }
                                            </div>
                                        </div>
                                    );
                                })
                                : ''
                            }
                        </ul>
                    </section>
                </section>
            </section>
            }
        </>
    );
}