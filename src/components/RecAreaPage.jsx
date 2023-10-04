import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ParkMap from "./ParkMap";
import ImageSlider from "./ImageSlider";

export default function RecAreaPage() {
    const location = useLocation();
    const [recAreaID, setRecAreaID] = useState(location.state.selectedRecArea);
    const [selectedRecArea, setSelectedRecArea] = useState(null);
    const [selectedRecAreaImages, setSelectedRecAreaImages] = useState([]);
    const [recAreaCoordinates, setRecAreaCoordinates] = useState(null);
    const [fetchedCoordinates, setFetchedCoordinates] = useState(null);
    const [recAreaGeoJson, setRecAreaGeoJson] = useState([]);
    const [recAreaDescription, setRecAreaDescription] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    
    useEffect(() => {

        const userCoordinates = location.state.userCoordinates;
        setUserLocation(userCoordinates);
        //get correct image for selected recArea
        const URLs = [];
        const recAreas = location.state.recAreas;
        const allRecAreaImages = location.state.recAreaImages;
        const recAreaImages = allRecAreaImages.filter((images) => images.RECDATA[0].EntityID === recAreaID);
        recAreaImages[0].RECDATA.forEach(image => {
            URLs.push(image.URL);
        });
        setSelectedRecAreaImages(URLs);
        const selectedArea = recAreas.filter((area) => area.RecAreaID === recAreaID);
        setSelectedRecArea(selectedArea);
        
        const tempElement = document.createElement('div');
        tempElement.innerHTML = selectedArea[0].RecAreaDescription;
        const cleanRecAreaDescription = tempElement.textContent;
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
    
    useEffect(() => {
        const facilities = [];
        
        const fetchFacilitiesByRecArea = async () => {
            const response = await fetch(`https://ridb.recreation.gov/api/v1/recareas/${recAreaID}/facilities?limit=50&offset=0&apikey=9bf6a5ef-ff3a-406f-8c75-8663720bc514`)
            const jsonResponse = await response.json();
            console.log(jsonResponse);
        }

        fetchFacilitiesByRecArea();
    }, []);
    
    
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
                selectedRecArea == null || selectedRecAreaImages == null  || recAreaCoordinates == null || userLocation == null ? '' :
                <section id='rec-area-page-body'>
                    <section id='rec-area-map'>
                        <ImageSlider images={selectedRecAreaImages} />
                        <ParkMap 
                            latitude={recAreaCoordinates.latitude}
                            longitude={recAreaCoordinates.longitude}
                            geojson={recAreaGeoJson}
                            type={'recreationArea'}
                            userLocation={userLocation}
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