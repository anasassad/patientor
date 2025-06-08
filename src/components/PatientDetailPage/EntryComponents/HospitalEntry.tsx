import { Box, Typography } from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { Diagnosis } from "../../../types";
import type { HospitalEntry } from "../../../types";

const HospitalEntry = ({ entry, diagnoses }: { entry: HospitalEntry; diagnoses: Diagnosis[] }) => {
  return (
    <Box sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mt: 2 }}>
      <Typography variant="subtitle1" display="flex">
        {entry.date} <LocalHospitalIcon color="error" sx={{ ml: 1 }} />
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
      <Typography variant="body2">
        <strong>Discharge:</strong> {entry.discharge.date} ({entry.discharge.criteria})
      </Typography>
    </Box>
  );
};

export default HospitalEntry;
