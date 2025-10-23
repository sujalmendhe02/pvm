import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // same backend as user site
});

export const registerMachine = (machineId) =>
  API.post("/api/machine/register", { machineId });

export const updateStatus = (machineId, status) =>
  API.post("/api/machine/status", { machineId, status });

export const getQueue = (machineId) =>
  API.get(`/api/machine/queue/${machineId}`);

export const completeJob = (jobId) =>
  API.post("/api/machine/complete", { jobId });
