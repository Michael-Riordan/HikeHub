import {Autocomplete, TextField} from "@mui/material";

export default function StateAutocomplete() {
    const usStateCodes = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
      ];
    
    return <Autocomplete 
                multiple
                options={usStateCodes}
                getOptionLabel={(option) => option}
                id='Autocomplete' 
                sx={{width: '80%'}} 
                renderInput={(params) => 
                    <TextField 
                    {...params} 
                    label='Filter by State'
                    hiddenLabel={true} 
                    id='autocomplete-textfield' 
                    />} 
            />
}