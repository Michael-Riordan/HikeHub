import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Map from "./Map";

export default function RecAreaPage() {
    const location = useLocation();
    const [recAreaID, setRecAreaID] = useState(location.state.selectedRecArea);
    const [selectedRecArea, setSelectedRecArea] = useState(null);
    const [selectedRecAreaImages, setSelectedRecAreaImages] = useState([]);
    const [recAreaCoordinates, setRecAreaCoordinates] = useState(null);
    const [fetchedCoordinates, setFetchedCoordinates] = useState(null);
    const [recAreaGeoJson, setRecAreaGeoJson] = useState([]);
    const [recAreaDescription, setRecAreaDescription] = useState('');
    
    useEffect(() => {

        //get correct image for selected recArea
        const recAreas = location.state.recAreas;
        const allRecAreaImages = location.state.recAreaImages;
        const recAreaImages = allRecAreaImages.filter((images) => images.RECDATA[0].EntityID === recAreaID);
        setSelectedRecAreaImages(recAreaImages);
        const selectedArea = recAreas.filter((area) => area.RecAreaID === recAreaID);
        setSelectedRecArea(selectedArea);
        
        const tempElement = document.createElement('div');
        tempElement.innerHTML = selectedArea[0].RecAreaDescription;
        const cleanRecAreaDescription = tempElement.textContent;
        console.log(cleanRecAreaDescription);
        setRecAreaDescription(cleanRecAreaDescription);
        
        //some recAreas provide coords as 0,0 if lacking data - in this case code will use fetched coords via address;
        if (selectedArea[0].RecAreaLongitude === 0 && selectedArea[0].RecAreaLatitude === 0) {
            fetchCoordinatesByAddress(selectedArea[0].RecAreaName)
        } else {
            console.log('setting from original')
            setRecAreaCoordinates({longitude: selectedArea[0].RecAreaLongitude, latitude: selectedArea[0].RecAreaLatitude});
        }
        
        //valid GEOJSON contains lowercase keys
        const recAreaCoords = selectedArea[0].GEOJSON;
        const lowerCasedCoords = {};
        for (const key in recAreaCoords) {
            lowerCasedCoords[key.toLowerCase()] = recAreaCoords[key];
        }
        setRecAreaGeoJson(lowerCasedCoords);
    }, [recAreaID])

    const fetchCoordinatesByAddress = async (recAreaName) => {
        const addressQuery = `?address=${recAreaName}`;
        const result = await fetch(`http://192.168.0.59:3000/api/geocoding${addressQuery}`);
        const jsonResult = await result.json();
        const latitude = jsonResult.results[0].geometry.location.lat;
        const longitude = jsonResult.results[0].geometry.location.lng;
        setRecAreaCoordinates({longitude: longitude, latitude: latitude});
    }

    
    return (
        <>
            {
                selectedRecArea == null || selectedRecAreaImages == null  || recAreaCoordinates == null ? '' :
                <section id='rec-area-page-body'>
                    <section id='rec-area-map'>
                        <img src={selectedRecAreaImages[0].RECDATA[0].URL} id='rec-area-page-image'/>
                        <Map 
                            latitude={recAreaCoordinates.latitude}
                            longitude={recAreaCoordinates.longitude}
                            geojson={recAreaGeoJson}
                            type={'recreationArea'}
                        />
                    </section>       
                    <section id='rec-area-info'>
                        <h1 className='park-page-name'>{selectedRecArea[0].RecAreaName}</h1>
                        <p>{recAreaDescription}</p>
                    </section>
                </section>
            }
        </>
    );
}