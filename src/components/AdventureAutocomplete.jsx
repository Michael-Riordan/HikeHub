import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState, useCallback } from "react";

export default function AdventureAutocomplete() {
    const [activities, setActivities] = useState([]);

    const handleAdventureSelect = () => {
        console.log('selected');
    }

    useEffect(() => {
        const activityList = [];

        const fetchActivities = async () => {
            console.log('fetching');
            const response = await fetch('https://ridb.recreation.gov/api/v1/activities?limit=50&offset=0&apikey=9bf6a5ef-ff3a-406f-8c75-8663720bc514');
            const jsonResponse = await response.json();
            jsonResponse.RECDATA.forEach((activity) => {
                activityList.push(activity.ActivityName);
            });
            setActivities(activityList);
        }

        fetchActivities();
    }, []);

    return <Autocomplete sx={{width: 400}} renderInput={(params) => <TextField {...params} label='Adventures' color="success" hiddenLabel={true} variant="filled" id='autocomplete-textfield'/>} options={activities} id='Autocomplete' />
}