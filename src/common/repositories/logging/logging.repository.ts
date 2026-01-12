import { Injectable } from '@nestjs/common';
import { MongoService } from '@src/database/mongo/mongo.service';
import { LogDetails, LogDetailsCreateDto } from './logging.model';

@Injectable()
export class LoggingRepository {
  constructor(private readonly db: MongoService) {}

  private get logs() {
    return this.db.collection<LogDetails>('audit_logging');
  }

  async saveLog(payload: LogDetailsCreateDto) {
    const result = await this.logs.insertOne(payload);
    return {
      _id: result.insertedId,
      ...payload,
    };
  }
}
