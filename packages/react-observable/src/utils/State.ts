import { Status } from "../types";

export interface State<T> {
  status: Status | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any | undefined;
  value: T | undefined;
}
