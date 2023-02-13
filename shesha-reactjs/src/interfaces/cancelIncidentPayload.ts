export interface ICancelIncidentPayload {
  incidentId?: string;
  reasonForCancellation: number;
  text: string;
}
