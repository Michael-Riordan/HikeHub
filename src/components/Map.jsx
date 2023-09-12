import mapboxgl from 'mapbox-gl';
import { useEffect } from 'react';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function Map(coordinates) {

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/michaeljriordan/clmf3bjbc015j01r63fxg8ezj',
            center: [coordinates.longitude, coordinates.latitude],
            zoom: 9,
        })

       map.on('style.load', () => {
            map.addLayer({
                id: 'national-park-boundary',
                type: 'line',
                source: {
                    type: 'geojson',
                    data: coordinates.geojson.geometry,
                },
            });
        })


        return () => {
            map.remove();
        }
    }, [coordinates.latitude, coordinates.longitude, coordinates.geojson])

    return (
        <>
            <div id='map' style={{width: '400px', height: '400px'}} />
        </>
    );
}