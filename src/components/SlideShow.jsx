import { useEffect, useState } from "react";
import AdventureAutocomplete from "./AdventureAutocomplete";

export default function SlideShow({images}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedActivity, setSelectedActivity] = useState('');

    const goToNext = () => {
        setCurrentIndex((prevIndex) => prevIndex === 0 ? 1 : prevIndex === 1 ? 2 : 0)
    }

    const onDataReceived = (data) => {
        setSelectedActivity(data);
    }

    useEffect(() => {
        const interval = setInterval(goToNext, 4000);

        return () => {
            clearInterval(interval);
        };
    }, [currentIndex]);

    return (
        <section 
            className={'homepage-header-section'}
        >
            {images.map((imageSrc, index) => (
                <img
                    key={index}
                    src={imageSrc}
                    alt={`Slide ${index}`}
                    className={`slideshow-image ${index === currentIndex ? 'active zoomed' : ''}`} 
                />
            ))}
            <div id='homepage-content'>
                <div className='header-overlay'>
                    <h1 id='homepage-header'>Plan Your Adventure</h1>
                    <div id='search-prompt'>
                        <AdventureAutocomplete onData={onDataReceived}/>
                    </div>
                </div>
            </div>
        </section>
    );
}