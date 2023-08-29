import SlideShow from "./SlideShow";
import HikingTrail1 from '../assets/Hiking-Trail-1.jpg'
import HikingTrail2 from '../assets/Hiking-Trail-2.jpg'
import HikingTrail3 from '../assets/Hiking-Trail-3.jpg'

export default function HomePage() {
    const images = [
        HikingTrail1,
        HikingTrail2,
        HikingTrail3,
    ]

    return (
        <section id='homepage-body'>
            <SlideShow images={images}/>
        </section>
    );
}