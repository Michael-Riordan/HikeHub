import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Map } from "react-map-gl";

export default function SelectedActivity() {
    const location = useLocation();
    const activityName = location.state.activityName;
    const latitude = location.state.latitude;
    const longitude = location.state.longitude;

    return (
        <>
            <h1>{activityName}, {latitude}, {longitude}</h1>
            <Map 
                latitude={park[0].latitude}
                longitude={park[0].longitude}
                geojson={geoJsonCoordinates}
                type={'nationalPark'}
                userLocation={userLocation}
            />
        </>
    );
}