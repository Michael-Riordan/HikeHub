import { useState } from "react";
import { useLocation } from "react-router-dom";
import ActivityMap from "./ActivityMap";

export default function SelectedActivity() {
    const location = useLocation();
    const activityObj = location.state.activityObj;
    const activityName = location.state.activityName;
    const latitude = location.state.latitude;
    const longitude = location.state.longitude;
    const image = location.state.image;
    const name = location.state.activityName;
    const userLocation = location.state.userLocation;
    const parkAddress = location.state.parkAddress;
    const parkLatLng = location.state.parkLatLng;
    console.log(activityObj);

    const cleanText = (dirtyText) => {
        return dirtyText.replace(/<[^>]*>/g, '');
    }

    const descriptionAvailable = (description) => {
        return description !== '';
    }

    return (
        <>
            <ActivityMap 
                coords={
                    {
                     lat: latitude, 
                     lng: longitude, 
                     image: image, 
                     name: name, 
                     userLocation: userLocation, 
                     parkLatLng: {lat: parkLatLng.lat, lng: parkLatLng.lng},
                     parkAddress: parkAddress,
                    }
                }
            />
            <h1 id='activities-header'>{activityName}</h1>
            <div id='activity-info-wrapper'>
                <h2 className='activity-descriptor'>Seasons:</h2>
                { 
                    descriptionAvailable(activityObj.season.join(', ')) ?
                    <p className='activity-info'>{activityObj.season.join(', ')}</p> :
                    <p className='activity-info'>No seasonal information available.</p>
                }
                <h2 className='activity-descriptor'>Duration:</h2>
                {
                    descriptionAvailable(activityObj.duration) ? 
                    <p className='activity-info'>{cleanText(activityObj.duration)}</p> :
                    <p className='activity-info'>No duration information available.</p>
                }
                {
                    descriptionAvailable(activityObj.durationDescription) ? 
                    <p className='activity-info'>{cleanText(activityObj.durationDescription)}</p> :
                    ''      
                }
                <h2 className='activity-descriptor'>Pets:</h2>
                { descriptionAvailable(activityObj.petsDescription) ? 
                    <p className='activity-info'>{cleanText(activityObj.petsDescription)}</p> :
                    <p className='activity-info'>No pet accessibility information available.</p>
                }
                <h2 className='activity-descriptor'>Description:</h2>
                {
                    descriptionAvailable(activityObj.longDescription) ?
                    <p className='activity-info'>{cleanText(activityObj.longDescription)}</p> :
                    <p className='activity-info'>No description currently available.</p>
                }
            </div>
        </>
    );
}