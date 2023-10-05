import { useState } from "react";
import { useLocation } from "react-router-dom";
import ActivityMap from "./ActivityMap";

export default function SelectedActivity() {
    const location = useLocation();
    const activityName = location.state.activityName;
    const latitude = location.state.latitude;
    const longitude = location.state.longitude;
    const image = location.state.image;
    const name = location.state.activityName;
    const userLocation = location.state.userLocation;
    const parkAddress = location.state.parkAddress;
    const parkLatLng = location.state.parkLatLng;

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
        </>
    );
}