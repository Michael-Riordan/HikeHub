import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState, useCallback, useRef } from "react";

export default function AdventureAutocomplete({ onData }) {
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState('');
    const [selectedActivityID, setSelectedActivityID] = useState(null);
    const [loadedMore, setLoadedMore] = useState(false);
    const [currentCount, setCurrentCount] = useState(null);
    const [totalCount, setTotalCount] = useState(null);
    const listboxRef = useRef(null);

    const sendDataToParent = () => {
        const data = selectedActivity;
        onData(data);
    }

    const handleAdventureSelect = (event, newValue) => {
        if (newValue) {
            setSelectedActivity(newValue);
            setSelectedActivityID(newValue.activityID);
        } else {
            setSelectedActivity('');
            setSelectedActivityID(null);
        }
    }

    const loadMoreActivities = useCallback( async () => {
        let offset;

        loadedMore ? offset = 100 : offset = 50;

        const additionalActivities = [];
        const response = await fetch(`http://localhost:3000/api/activities?offset=${offset}`);
        const jsonResponse = await response.json();
        jsonResponse.RECDATA.forEach((activity) => {
            additionalActivities.push({
                activityName: activity.ActivityName,
                activityID: activity.ActivityID,
            })
        })
        setCurrentCount((prevCount) => prevCount + jsonResponse.METADATA.RESULTS.CURRENT_COUNT);
        setActivities((prevActivities) => [...prevActivities, ...additionalActivities]);
        setLoadedMore(true);
    });

    const handleScroll = () => {
        if (
            listboxRef.current &&
            listboxRef.current.scrollTop + listboxRef.current.clientHeight >= 
            listboxRef.current.scrollHeight
        ) {
            if (currentCount == null || currentCount < totalCount) {
                loadMoreActivities();
            }
        }
    }

    useEffect(() => {
        const activityList = [];

        const fetchActivities = async () => {
            const response = await fetch('http://localhost:3000/api/activities');
            const jsonResponse = await response.json();
            jsonResponse.RECDATA.forEach((activity) => {
                activityList.push({
                    activityName: activity.ActivityName,
                    activityID: activity.ActivityID,
                });
            });
            setActivities(activityList);
            setCurrentCount(jsonResponse.METADATA.RESULTS.CURRENT_COUNT);
            setTotalCount(jsonResponse.METADATA.RESULTS.TOTAL_COUNT);
        }

        fetchActivities();
    }, []);

    useEffect(() => {
        sendDataToParent();
    }, [selectedActivity]);

    return <Autocomplete 
                options={activities}
                getOptionLabel={(option) => option.activityName}
                id='Autocomplete' 
                sx={{width: 400}} 
                onChange={handleAdventureSelect}
                ListboxProps={{
                    ref: listboxRef,
                    onScroll: handleScroll,
                }}
                renderInput={(params) => 
                    <TextField {...params} 
                        label='Scroll for all Adventures' 
                        color="success" 
                        hiddenLabel={true} 
                        variant="filled" 
                        id='autocomplete-textfield' 
                    />} 
            />
}