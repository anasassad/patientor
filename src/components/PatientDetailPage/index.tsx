import { Box, Button, Chip, FormControl, InputLabel, MenuItem, OutlinedInput, Select, TextField, Typography } from "@mui/material";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useParams } from "react-router-dom";
import { Diagnosis, HealthCheckRating, NewEntry, Patient } from "../../types";
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

const entriesType = [
  "HealthCheck", "Hospital", "OccupationalHealthcare"
];

const createEmptyEntry = (type: string): NewEntry => {
  const base = {
    description: "",
    date: "",
    specialist: "",
    diagnosisCodes: []
  };

  switch (type) {
    case "HealthCheck":
      return { ...base, healthCheckRating: HealthCheckRating.Healthy, type: "HealthCheck" };
    case "Hospital":
      return { ...base, discharge: { date: "", criteria: "" }, type: "Hospital" };
    case "OccupationalHealthcare":
      return {
        ...base,
        type: "OccupationalHealthcare",
        employerName: "",
        sickLeave: { startDate: "", endDate: "" }
      };
    default:
      throw new Error("Unsupported entry type");
  }
};

const PatientDetailPage = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [selectedType, setSelectedType] = useState<string>('HealthCheck');
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

  useEffect(() => {
    setEntry(createEmptyEntry(selectedType));
  }, [selectedType]);


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

    switch (entry.type) {
      case "HealthCheck":
        if (name === "healthCheckRating") {
          setEntry({ ...entry, healthCheckRating: Number(value) as HealthCheckRating });
        } else if (name === "diagnosisCodes") {
          const codes = value.split(',').map(code => code.trim()).filter(Boolean);
          setEntry({ ...entry, diagnosisCodes: codes });
        } else {
          setEntry({ ...entry, [name]: value });
        }
        break;

      case "Hospital":
        if (name === "dischargeDate") {
          setEntry({
            ...entry,
            discharge: {
              ...entry.discharge,
              date: value
            }
          });
        } else if (name === "dischargeCriteria") {
          setEntry({
            ...entry,
            discharge: {
              ...entry.discharge,
              criteria: value
            }
          });
        } else if (name === "diagnosisCodes") {
          const codes = value.split(',').map(code => code.trim()).filter(Boolean);
          setEntry({ ...entry, diagnosisCodes: codes });
        } else {
          setEntry({ ...entry, [name]: value });
        }
        break;

      case "OccupationalHealthcare":
        if (name === "employerName") {
          setEntry({ ...entry, employerName: value });
        } else if (name === "sickLeaveStartDate") {
          setEntry({
            ...entry,
            sickLeave: {
              ...(entry.sickLeave || { startDate: "", endDate: "" }),
              startDate: value
            }
          });
        } else if (name === "sickLeaveEndDate") {
          setEntry({
            ...entry,
            sickLeave: {
              ...(entry.sickLeave || { startDate: "", endDate: "" }),
              endDate: value
            }
          });
        } else if (name === "diagnosisCodes") {
          const codes = value.split(',').map(code => code.trim()).filter(Boolean);
          setEntry({ ...entry, diagnosisCodes: codes });
        } else {
          setEntry({ ...entry, [name]: value });
        }
        break;

      default:
        break;
    }
  };


  const resetForm = () => {
    setSelectedType("HealthCheck");
    setEntry({
      type: "HealthCheck",
      description: "",
      date: "",
      specialist: "",
      healthCheckRating: HealthCheckRating.Healthy,
      diagnosisCodes: []
    });
  };

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
          id="outlined-select-entries-type"
          select
          label="Select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          helperText="Please select your entry"
        >
          {entriesType.map((type, index) => (
            <MenuItem key={index} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
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
        {entry.type === "HealthCheck" && (
          <TextField
            fullWidth
            required
            variant="standard"
            id="healthcheckrating"
            name="healthCheckRating"
            label="HealthCheck Rating"
            type="number"
            margin="normal"
            value={entry.healthCheckRating}
            onChange={handleOnChange}
          />
        )}
        {entry.type === "Hospital" && (
          <>
            <TextField
              fullWidth
              required
              variant="standard"
              id="dischargedate"
              name="dischargeDate"
              label="Discharge Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={entry.discharge.date}
              onChange={handleOnChange}
            />
            <TextField
              fullWidth
              required
              variant="standard"
              id="dischargecriteria"
              name="dischargeCriteria"
              label="Discharge Criteria"
              type="text"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={entry.discharge.criteria}
              onChange={handleOnChange}
            />
          </>
        )}
        {entry.type === "OccupationalHealthcare" && (
          <>
            <TextField
              fullWidth
              required
              variant="standard"
              id="employername"
              name="employerName"
              label="Employer Name"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={entry.employerName}
              onChange={handleOnChange}
            />
            <TextField
              fullWidth
              variant="standard"
              id="sickleavestartdate"
              name="sickLeaveStartDate"
              label="Sick Leave Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={entry.sickLeave?.startDate}
              onChange={handleOnChange}
            />
            <TextField
              fullWidth
              variant="standard"
              id="sickleaveendDate"
              name="sickLeaveEndDate"
              label="Sick Leave End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              margin="normal"
              value={entry.sickLeave?.endDate}
              onChange={handleOnChange}
            />
          </>
        )}
        <FormControl fullWidth margin="normal">
          <InputLabel id="diagnosiscodeslabel">Diagnosis Codes</InputLabel>
          <Select
            labelId="diagnosiscodeslabel"
            id="diagnosiscodes"
            multiple
            name="diagnosisCodes"
            value={entry.diagnosisCodes}
            onChange={(e) => {
              const {
                target: { value },
              } = e;
              setEntry({
                ...entry,
                diagnosisCodes: typeof value === 'string' ? value.split(',') : value,
              });
            }}
            input={<OutlinedInput id="selectmultiplechip" label="Diagnosis Codes" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((code) => (
                  <Chip key={code} label={code} />
                ))}
              </Box>
            )}
          >
            {diagnoses.map((diag) => (
              <MenuItem key={diag.code} value={diag.code}>
                {diag.code} — {diag.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
