import {Autocomplete, TextField} from "@mui/material";
import { useEffect, useState } from "react";

export default function StateAutocomplete({ sendStateToMap }) {
    const usStateCodes = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];
      const [selectedState, setSelectedState] = useState([]);

    const handleStateSelect = (event, newValue) => {
        if (newValue) {
            setSelectedState(newValue);
        } else {
            setSelectedState([]);
        }
    }

    useEffect(() => {
        sendStateToMap(selectedState);
    }, [selectedState])
    
    return <Autocomplete 
                multiple
                options={usStateCodes}
                getOptionLabel={(option) => option}
                id='Autocomplete' 
                sx={{width: '80%'}} 
                onChange={handleStateSelect}
                renderInput={(params) => 
                    <TextField 
                    {...params} 
                    label='Filter by State'
                    hiddenLabel={true} 
                    color='success'
                    id='autocomplete-textfield' 
                    />} 
            />
}