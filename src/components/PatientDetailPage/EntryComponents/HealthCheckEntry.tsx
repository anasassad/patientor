import { Box, Typography } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { Diagnosis, HealthCheckRating } from "../../../types";
import type { HealthCheckEntry } from "../../../types";

const healthColors = {
    [HealthCheckRating.Healthy]: 'green',
    [HealthCheckRating.LowRisk]: 'yellow',
    [HealthCheckRating.HighRisk]: 'orange',
    [HealthCheckRating.CriticalRisk]: 'red'
};

const healthLabels = {
    [HealthCheckRating.Healthy]: 'Healthy',
    [HealthCheckRating.LowRisk]: 'Low Risk',
    [HealthCheckRating.HighRisk]: 'High Risk',
    [HealthCheckRating.CriticalRisk]: 'Critical Risk'
};

const HealthCheckEntry = ({ entry, diagnoses }: { entry: HealthCheckEntry; diagnoses: Diagnosis[] }) => {
    return (
        <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="subtitle1" display="flex">
                {entry.date} <MedicalServicesIcon color="primary" sx={{ ml: 1 }} />
            </Typography>
            <Typography>{entry.description}</Typography>
            {entry.diagnosisCodes && (
                <ul>
                    {entry.diagnosisCodes.map(code => {
                        const diagnosis = diagnoses.find(d => d.code === code);
                        return <li key={code}>{code} {diagnosis ? `- ${diagnosis.name}` : ''}</li>;
                    })}
                </ul>
            )}
            <Typography variant="body2" display="flex" alignItems="center">
                <strong>Health rating:</strong>&nbsp;
                <FavoriteIcon sx={{ color: healthColors[entry.healthCheckRating], verticalAlign: 'middle' }} />
                &nbsp;{healthLabels[entry.healthCheckRating]}
            </Typography>
        </Box>
    );
};

export default HealthCheckEntry;
