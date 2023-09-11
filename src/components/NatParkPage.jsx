import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function NatParkPage() {
    const location = useLocation();
    const [park, setPark] = useState(location.state);

    /*useEffect(() => {

        const fetchNationalPark = async () => {
            const response = await fetch('')
        }

    })
    */

    return (
        <h1>Hello World {park.fullName}</h1>
    );
}