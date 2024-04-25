import { Estimate, SquidData, RouteRequest } from "@0xsquid/sdk/dist/types";

export type DirectionType = "from" | "to";

export interface RouteData {
  estimate: Estimate;
  transactionRequest?: SquidData | undefined;
  params: RouteRequest;
}
