export { default as RegistrationTable } from "./components/RegistrationTable";
export { default as RegistrationApproval } from "./components/RegistrationApproval";
export { default as RegisterCompanyStepper } from "./components/RegisterCompanyStepper";
export { default as UploadZone } from "./components/UploadZone";
export { default as StepperHeader } from "./components/StepperHeader";
export { default as MyRegistrationView } from "./components/MyRegistrationView";

export {
  requestGetRegistrations,
  requestGetRegistrationDetail,
  requestGetMyRegistration,
  requestUpdateRegistrationStatus,
  requestSubmitRegistration,
} from "./api/registration.api";
