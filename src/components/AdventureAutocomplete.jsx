import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";

export default function AdventureAutocomplete({ sendActivityToMap }) {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState([]);
    const [selectedActivityID, setSelectedActivityID] = useState(null);

    const handleAdventureSelect = (event, newValue) => {
        if (newValue) {
            setSelectedActivity(newValue);
            setSelectedActivityID(newValue.activityID);

        } else {
            setSelectedActivity('');
            setSelectedActivityID(null);
        }
    }

    useEffect(() => {
        sendActivityToMap(selectedActivity)
    }, [selectedActivity])

    useEffect(() => {
        const activityList = [];

        const fetchActivities = async () => {
            const response = await fetch('http://192.168.0.59:3000/api/activities');
            const jsonResponse = await response.json();
            jsonResponse.data.forEach((activity) => {
                activityList.push({
                    activityName: activity.name,
                    activityID: activity.id,
                });
            });
            setActivities(activityList);
        }

        fetchActivities();
    }, []);

    return <Autocomplete 
                multiple
                options={activities}
                getOptionLabel={(option) => option.activityName}
                id='Autocomplete' 
                sx={{width: '80%'}} 
                onChange={handleAdventureSelect}
                renderInput={(params) => 
                    <TextField 
                        {...params} 
                        label='Filter by Adventures' 
                        color='success'
                        hiddenLabel={true} 
                        id='autocomplete-textfield' 
                    />} 
            />
}