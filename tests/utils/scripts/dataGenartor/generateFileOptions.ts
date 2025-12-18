import {claimOptions} from "../claimOptions";

export interface GenerateFileOptions {
  submissionPeriod?: string;
  office?: string;
  claims?: claimOptions[];
  suffix?: string;
}