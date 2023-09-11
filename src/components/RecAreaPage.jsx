import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RecAreaPage() {
    const location = useLocation();
    const [recAreaID, setRecAreaID] = useState(location.state.selectedRecArea);
    const [selectedRecArea, setSelectedRecArea] = useState(null);
    const [selectedRecAreaImages, setSelectedRecAreaImages] = useState([]);
    
    useEffect(() => {
        const recAreas = location.state.recAreas;
        const allRecAreaImages = location.state.recAreaImages;
        const recAreaImages = allRecAreaImages.filter((images) => images.RECDATA[0].EntityID === recAreaID);
        setSelectedRecAreaImages(recAreaImages);
        const selectedArea = recAreas.filter((area) => area.RecAreaID === recAreaID);
        setSelectedRecArea(selectedArea);
    }, [recAreaID])

    return (
        <>
            {
                selectedRecArea == null || selectedRecAreaImages == null ? '' :
                <section id='rec-area-page-header'>
                    <h1>{selectedRecArea[0].RecAreaName}</h1>
                    <img src={selectedRecAreaImages[0].RECDATA[0].URL} id='rec-area-page-image'/>
                </section>
            }
        </>
    );
}