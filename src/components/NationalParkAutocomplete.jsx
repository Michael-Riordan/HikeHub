import { Autocomplete, TextField } from "@mui/material";
import { useEffect, useState } from "react";

export default function NationalParkAutocomplete({parks, sendNationalParksToMap }) {
    const [selectedNationalParks, setSelectedNationalParks] = useState([]);

    const handleParkSelection = (event, newValue) => {
        if (newValue) {
            setSelectedNationalParks(newValue);
        } else {
            setSelectedNationalParks([]);
        }
    }

    useEffect(() => {
        sendNationalParksToMap(selectedNationalParks);
    }, [selectedNationalParks]);

    return <Autocomplete 
                multiple
                options={parks}
                getOptionLabel={(parks) => parks.fullName}
                id='Autocomplete' 
                sx={{width: '80%'}} 
                onChange={handleParkSelection}
                renderInput={(params) => 
                    <TextField 
                    {...params} 
                    label='Search by Park'
                    hiddenLabel={true} 
                    color='success'
                    id='autocomplete-textfield' 
                    />} 
            />
}