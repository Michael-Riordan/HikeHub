import { Autocomplete, TextField } from "@mui/material";

export default function NationalParkAutocomplete(parks) {

    const handleSelection = (event) => {
        console.log(event);
    }

    return <Autocomplete 
                multiple
                options={parks.parks}
                getOptionLabel={(park) => park.fullName}
                id='Autocomplete' 
                sx={{width: '80%'}} 
                renderInput={(params) => 
                    <TextField 
                    {...params} 
                    label='Search by Park'
                    hiddenLabel={true} 
                    id='autocomplete-textfield'
                    onChange={(e) => handleSelection(e)} 
                    />} 
            />
}