import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";

export default function AdventureAutocomplete({ sendActivityToMap }) {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState([]);

    const handleAdventureSelect = (event, newValue) => {
        if (newValue) {
            setSelectedActivity(newValue);

        } else {
            setSelectedActivity([]);
        }
    }

    useEffect(() => {
        sendActivityToMap(selectedActivity)
    }, [selectedActivity])

    useEffect(() => {
        const activityList = [];

        const fetchActivities = async () => {
            const response = await fetch('https://national-park-application-c44bb8f1d790.herokuapp.com/api/activities');
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