export interface ApiResponse {
  message: string;
  status: boolean;
  data: ApiDataResponseType;
}

type ApiDataResponseType = {}