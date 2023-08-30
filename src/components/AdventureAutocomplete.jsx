import { Autocomplete } from "@mui/material";
import { TextField } from "@mui/material";

export default function AdventureAutocomplete() {
    const adventures = [
        'Hiking',
        'Biking',
        'Camping',
        'Fishing',
    ]

    return <Autocomplete renderInput={(params) => <TextField {...params} label='Adventures' color="success" />} options={adventures} id='Autocomplete'/>
}