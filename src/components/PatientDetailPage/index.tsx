import { Box, Typography } from "@mui/material";
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { useParams } from "react-router-dom";
import { Patient } from "../../types";
import { useEffect, useState } from "react";
import patientService from "../../services/patients";
import axios from "axios";

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
    </div>
  );
};

export default PatientDetailPage;
