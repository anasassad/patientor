import { Box, Typography } from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import { Diagnosis } from "../../../types";
import type { OccupationalHealthcareEntry } from "../../../types";

const OccupationalHealthcareEntry = ({ entry, diagnoses }: { entry: OccupationalHealthcareEntry; diagnoses: Diagnosis[] }) => {
  return (
    <Box key={entry.id} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mt: 2 }}>
      <Typography variant="subtitle1" display="flex">
        {entry.date} <WorkIcon color="primary" sx={{ mx: 1 }} /> <strong>{entry.employerName}</strong>
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
      {entry.sickLeave && (
        <Typography variant="body2">
          <strong>Sick leave:</strong> {entry.sickLeave.startDate} to {entry.sickLeave.endDate}
        </Typography>
      )}
    </Box>
  );
};

export default OccupationalHealthcareEntry;
