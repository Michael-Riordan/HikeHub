import { useEffect, useState } from "react";

export default function SlideShow({images}) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => prevIndex === 0 ? 1 : prevIndex === 1 ? 2 : 0)
    }

    useEffect(() => {
        const interval = setInterval(goToNext, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [currentIndex]);

    return (
        <section 
            className={'homepage-header-section'}
            style={{ backgroundImage: `url(${images[currentIndex]})`,
                     backgroundPosition: 'center',
                     backgroundSize: 'cover'}}
        >
            <div id='homepage-content'>
                <div className='header-overlay'>
                    <h1 id='homepage-header'>Plan Your Adventure</h1>
                </div>
            </div>
        </section>
    );
}