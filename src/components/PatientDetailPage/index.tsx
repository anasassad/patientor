import { Box, Typography } from "@mui/material";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useParams } from "react-router-dom";
import { Patient } from "../../types";
import { useEffect, useState } from "react";
import patientService from "../../services/patients";
import axios from "axios";

const assertNever = (value: never): never => {
  throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
};

const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchPatientById = async () => {
      try {
        const patient = await patientService.getPatientById(id);
        setPatient(patient);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.error || "An error occurred while fetching patient details.");
        } else {
          setError("Unexpected error occurred.");
        }
      }

    };

    void fetchPatientById();
  }, [id]);

  if (!patient) {
    return (<Typography variant="h6" color="error" align="center">
      {error}
    </Typography>);
  }

  return (
    <div className="App">
      <Box display="flex" alignItems="center" justifyContent="center">
        <Typography align="center" variant="h5">
          {patient.name} {patient.gender === 'male' ? <MaleIcon color="primary" /> : <FemaleIcon sx={{ color: "pink" }} />}
        </Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          <strong>SSN:</strong> {patient.ssn}
        </Typography>
        <Typography variant="body1">
          <strong>Occupation:</strong> {patient.occupation}
        </Typography>
      </Box>
      <Box mt={4}>
        <Typography variant="h6">Entries</Typography>
        {patient.entries.map((entry) => {
          switch (entry.type) {
            case "Hospital":
              return (
                <Box key={entry.id} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mt: 2 }}>
                  <Typography sx={{ mb: 2 }}><strong>{entry.date}</strong> - {entry.description}</Typography>
                  {entry.diagnosisCodes && (
                    <ul>
                      {entry.diagnosisCodes.map((code, index) => (
                        <li key={index}>{code}</li>
                      ))}
                    </ul>
                  )}
                  <Typography variant="body2"><strong>Discharge: </strong>{entry.discharge.date} ({entry.discharge.criteria})</Typography>
                </Box>
              );

            case "HealthCheck":
              return (
                <Box key={entry.id} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mt: 2 }}>
                  <Typography sx={{ mb: 2 }}><strong>{entry.date}</strong> - {entry.description}</Typography>
                  {entry.diagnosisCodes && (
                    <ul>
                      {entry.diagnosisCodes.map((code, index) => (
                        <li key={index}>{code}</li>
                      ))}
                    </ul>
                  )}
                  <Typography variant="body2"><strong>Health rating: </strong>{entry.healthCheckRating}</Typography>
                </Box>
              );

            case "OccupationalHealthcare":
              return (
                <Box key={entry.id} sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2, mt: 2 }}>
                  <Typography sx={{ mb: 2 }}><strong>{entry.date}</strong> - {entry.description}</Typography>
                  {entry.diagnosisCodes && (
                    <ul>
                      {entry.diagnosisCodes.map((code, index) => (
                        <li key={index}>{code}</li>
                      ))}
                    </ul>
                  )}
                  <Typography variant="body2"><strong>Employer: </strong> {entry.employerName}</Typography>
                  {entry.sickLeave && (
                    <Typography variant="body2"><strong>Sick leave: </strong> {entry.sickLeave.startDate} to {entry.sickLeave.endDate}</Typography>
                  )}
                </Box>
              );

            default:
              return assertNever(entry);
          }
        })}

      </Box>

    </div>
  );
};

export default PatientDetailPage;
