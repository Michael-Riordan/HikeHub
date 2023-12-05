import { useEffect, useState } from "react";
import noImageIcon from '../assets/no-image-icon.jpg';

export default function ImageSlider({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setCurrentIndex(nextIndex);

        }, 6000);

        return () => clearTimeout(timer);

    }, [currentIndex, images]);

    return (
                <>
                    <img 
                        src={images[currentIndex] != undefined? images[currentIndex] : noImageIcon} 
                        className='rec-area-page-image' 
                        alt='scenic image of hiking trail'
                    />
                </>
    );
}