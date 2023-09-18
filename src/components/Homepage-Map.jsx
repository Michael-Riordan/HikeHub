import { useEffect } from "react";
import mapboxgl, { LngLat } from 'mapbox-gl';

export default function HomepageMap(coordinates) {

    useEffect(() => {
        const userLatitude = coordinates.coordinates.latitude;
        const userLongitude = coordinates.coordinates.longitude;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj',
            center: [userLongitude, userLatitude],
            zoom: 6,
        });
    }, []);

    return (
        <>
            <div id='map' style={{width: '100%', height: '300px'}} />
        </>
    );
}