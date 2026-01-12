import { ObjectId } from 'mongodb';

export interface LogDetails {
  _id?: ObjectId;
  timestamp: Date;
  path: string;
  method: string;
  statusCode: number;
  ip: string;
  userAgent: string;
  body: object;
  params: object;
  query: object;
  exception: unknown;
}

export type LogDetailsCreateDto = Omit<LogDetails, '_id'>;
