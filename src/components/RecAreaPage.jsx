import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function RecAreaPage() {
    const location = useLocation();
    const [recAreaID, setRecAreaID] = useState(location.state);
    console.log(location.state);

    return (
        <h1>Hello World {recAreaID}</h1>
    );
}