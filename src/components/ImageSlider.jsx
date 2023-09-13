import { useEffect, useState } from "react";
import noImageIcon from '../assets/no-image-icon.jpg';

export default function ImageSlider({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(nextIndex);

        }, 8000)

        return () => clearTimeout(timer);

    }, [currentIndex, images])

    return (
                <>
                    <img 
                        src={images[currentIndex] != undefined? images[currentIndex] : noImageIcon} 
                        id='rec-area-page-image' 
                    />
                </>
    );
}