import { Entry, Diagnosis } from "../../types";
import HospitalEntry from "./EntryComponents/HospitalEntry";
import HealthCheckEntry from "./EntryComponents/HealthCheckEntry";
import OccupationalHealthcareEntry from "./EntryComponents/OccupationalHealthcareEntry";

const assertNever = (value: never): never => {
    throw new Error(`Unhandled entry type: ${JSON.stringify(value)}`);
};

const EntryDetails: React.FC<{ entry: Entry, diagnoses: Diagnosis[] }> = ({ entry, diagnoses }) => {
    switch (entry.type) {
        case "Hospital":
            return <HospitalEntry entry={entry} diagnoses={diagnoses} />;
        case "HealthCheck":
            return <HealthCheckEntry entry={entry} diagnoses={diagnoses} />;
        case "OccupationalHealthcare":
            return <OccupationalHealthcareEntry entry={entry} diagnoses={diagnoses} />;
        default:
            return assertNever(entry);
    }
};

export default EntryDetails;
