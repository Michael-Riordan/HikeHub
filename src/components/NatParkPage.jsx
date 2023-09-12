import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Map from "./Map";

export default function NatParkPage() {
    const location = useLocation();
    const [park, setPark] = useState(location.state);
    const [geoJsonCoordinates, setGeoJsonCoordinates] = useState([]);

    useEffect(() => {
        
        const parkCodeQuery = `?parkCode=${park.parkCode}`
        const fetchGeoJSONCoordinates = async () => {
            const response = await fetch(`http://192.168.0.59:3000/api/NationalParkGeoJson${parkCodeQuery}`);
            const jsonResponse = await response.json();
            setGeoJsonCoordinates(jsonResponse);
        }
        fetchGeoJSONCoordinates();
    }, []);

    return (
        <>
            <h1>{park.fullName}</h1>
            <Map 
                latitude={park.latitude}
                longitude={park.longitude}
                geojson={geoJsonCoordinates}
            />
        </>
    );
}