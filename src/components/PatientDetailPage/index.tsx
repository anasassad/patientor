import { Box, Button, TextField, Typography } from "@mui/material";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useParams } from "react-router-dom";
import { Diagnosis, HealthCheckEntry, HealthCheckRating, NewEntry, Patient } from "../../types";
import React, { SyntheticEvent, useEffect, useState } from "react";
import patientService from "../../services/patients";
import diagnosisService from "../../services/diagnoses";
import axios from "axios";
import EntryDetails from "./EntryDetails";

const fieldMessages: Record<string, string> = {
  description: "Please provide a short description.",
  date: "Please enter a valid date in the format YYYY-MM-DD.",
  specialist: "Please provide the specialist's name.",
  diagnosisCodes: "Diagnosis codes must be valid codes (e.g., A10, B20).",
  healthCheckRating: "Health rating must be a number from 0 (Healthy) to 3 (Critical).",
};

interface ZodSubError {
  issues: {
    path: string[];
    message: string;
  }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapZodUnionErrorsForHealthCheck(error: any): string[] {
  if (!error || !Array.isArray(error.unionErrors)) return ["Unknown validation error"];

  // Find the first sub-error that matches "HealthCheck" type
  const healthCheckErrors = error.unionErrors.find((sub: ZodSubError) =>
    sub.issues.some(issue =>
      issue.path[0] === "type" && issue.message.includes("HealthCheck")
    ) || sub.issues.every(issue => issue.path[0] !== "type")
  );

  if (!healthCheckErrors) return ["Invalid input for HealthCheck entry."];

  // Map messages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return healthCheckErrors.issues.map((issue: { path: any[]; message: any; }) => {
    const field = issue.path[0];
    return fieldMessages[field] || issue.message;
  });
}
const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [entry, setEntry] = useState<NewEntry>({
    type: "HealthCheck",
    description: "",
    date: "",
    specialist: "",
    healthCheckRating: HealthCheckRating.Healthy,
    diagnosisCodes: []
  });
  const [error, setError] = useState<string | string[] | undefined>();

  useEffect(() => {
    const fetchPatientById = async () => {
      try {
        const patient = await patientService.getPatientById(id);
        const diagnoses = await diagnosisService.getAll();

        setDiagnoses(diagnoses);
        setPatient(patient);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const backendError = error.response?.data?.error;

          if (Array.isArray(backendError) && backendError[0]?.code === "invalid_union") {
            const messages = mapZodUnionErrorsForHealthCheck(backendError[0]);
            setError(messages);
          } else {
            setError("An error occurred while fetching patient details.");
          }
        } else {
          setError("Unexpected error occurred.");
        }
      }

    };

    void fetchPatientById();
  }, [id]);

  if (!patient) {
    return (<Box>
      {typeof error === 'string' && (
        <Typography color="error">{error}</Typography>
      )}
      {typeof error === 'object' && error.map((e, i) => (
        <Typography key={i} color="error">{e}</Typography>
      ))}
    </Box>);
  }

  const addEntryToPatient = async (event: SyntheticEvent) => {
    event.preventDefault();
    if (!id) return;

    try {
      const newPatient = await patientService.addEntry(id, entry);
      setPatient(prev => prev ? newPatient : prev);
      resetForm();
      setError(undefined);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendError = error.response?.data?.error;

        if (Array.isArray(backendError) && backendError[0]?.code === "invalid_union") {
          const messages = mapZodUnionErrorsForHealthCheck(backendError[0]);
          setError(messages);
        } else {          
          setError(error.response?.data.error[0].message || "Failed to add entry.");
        }
      } else {
        setError("Unexpected error occurred.");
      }
    }
  };

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (entry.type === "HealthCheck") {
      if (name === "healthCheckRating") {
        setEntry({ ...entry, [name]: Number(value) as HealthCheckRating });
      } else if (name === "diagnosisCodes") {
        const codes = value.split(',').map(code => code.trim()).filter(Boolean);
        setEntry({ ...entry, diagnosisCodes: codes });
      } else {
        setEntry({ ...entry, [name]: value });
      }
    }
  };

  const resetForm = () => {
    setEntry({
      type: "HealthCheck",
      description: "",
      date: "",
      specialist: "",
      healthCheckRating: HealthCheckRating.Healthy,
      diagnosisCodes: []
    });
  };

  console.log(error);


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
      <Box>
      {typeof error === 'string' && (
        <Typography color="error">{error}</Typography>
      )}
      {typeof error === 'object' && error.map((e, i) => (
        <Typography key={i} color="error">{e}</Typography>
      ))}
    </Box>
      <Box component="form" autoComplete="off" onSubmit={addEntryToPatient} my={2}>

        <TextField
          fullWidth
          required
          variant="standard"
          id="description"
          name="description"
          label="Description"
          margin="normal"
          value={entry.description}
          onChange={handleOnChange}
        />
        <TextField
          fullWidth
          variant="standard"
          id="date"
          name="date"
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          margin="normal"
          value={entry.date}
          onChange={handleOnChange}
        />
        <TextField
          fullWidth
          required
          variant="standard"
          id="specialist"
          name="specialist"
          label="Specialist"
          margin="normal"
          value={entry.specialist}
          onChange={handleOnChange}
        />
        <TextField
          fullWidth
          required
          variant="standard"
          id="healthcheckrating"
          name="healthCheckRating"
          label="Healthcheck Rating"
          type="number"
          margin="normal"
          // This is not safe and it's for temporary uses
          value={(entry as HealthCheckEntry).healthCheckRating}
          onChange={handleOnChange}
        />
        <TextField
          fullWidth
          required
          variant="standard"
          id="diagnosiscodes"
          name="diagnosisCodes"
          label="Diagnosis Codes"
          margin="normal"
          value={entry.diagnosisCodes?.join(", ")}
          onChange={handleOnChange}
        />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button type="submit" variant="contained">Add</Button>
          <Button type="button" onClick={resetForm} variant="contained">Cancel</Button>
        </Box>
      </Box>

      <Box mt={4}>
        <Typography variant="h6">Entries</Typography>
        {patient.entries.map((entry) => {
          return <EntryDetails key={entry.id} entry={entry} diagnoses={diagnoses} />;
        })}
      </Box>
    </div>
  );
};

export default PatientDetailPage;
