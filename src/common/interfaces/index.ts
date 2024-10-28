import { PipelineStage, PopulateOptions, ProjectionType, QueryOptions, RootFilterQuery, UpdateQuery } from "mongoose";

export interface IPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetPaginationQueryParams extends IPaginationParams {
  query?: RootFilterQuery<any>;
  populate?: string | string[] | PopulateOptions | PopulateOptions[];
}

export interface GetAggregatedPaginationQueryParams extends IPaginationParams {
  query?: PipelineStage[];
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: any;
}
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}
