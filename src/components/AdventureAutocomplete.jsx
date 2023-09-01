import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState, useCallback } from "react";

export default function AdventureAutocomplete({ onData }) {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState('');

    const sendDataToParent = () => {
        const data = selectedActivity;
        onData(data);
    }

    const handleAdventureSelect = (event) => {
        event.target.value != null ? setSelectedActivity(event.target.value) : setSelectedActivity('');
    }

    useEffect(() => {
        const activityList = [];

        const fetchActivities = async () => {
            console.log('fetching');
            const response = await fetch('http://localhost:3000/api/activities');
            const jsonResponse = await response.json();
            jsonResponse.RECDATA.forEach((activity) => {
                activityList.push(activity.ActivityName);
            });
            setActivities(activityList);
        }

        fetchActivities();
    }, []);

    useEffect(() => {
        sendDataToParent();
    }, [selectedActivity]);

    return <Autocomplete 
                id='Autocomplete' 
                sx={{width: 400}} 
                renderInput={(params) => 
                    <TextField {...params} 
                        label='Adventures' 
                        color="success" 
                        hiddenLabel={true} 
                        variant="filled" 
                        id='autocomplete-textfield' 
                        onSelect={handleAdventureSelect}
                    />} options={activities} 
            />
}