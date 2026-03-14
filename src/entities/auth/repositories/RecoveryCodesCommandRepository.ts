import { WithId } from 'mongodb';
import { recoveryCodesCollection } from '../../../database/mongoDB';
import { MongoRecoveryCode } from '../../../database/types';
import { RecoveryCode } from '../RecoveryCode';
import { injectable } from 'inversify';

@injectable()
class RecoveryCodesCommandRepository {
  async save(recoveryCode: MongoRecoveryCode) {
    const { insertedId } = await recoveryCodesCollection.insertOne(recoveryCode);
    return insertedId;
  }

  async findCode(recoveryCode: string) {
    const foundCode = await recoveryCodesCollection.findOne({
      code: recoveryCode,
      expirationDate: { $gte: new Date() },
    });
    return foundCode ? this._cleanObjectIdMapper(foundCode) : null;
  }

  async cleanAll() {
    await recoveryCodesCollection.deleteMany();
  }

  private _cleanObjectIdMapper(mongoRecoveryCode: WithId<MongoRecoveryCode>): RecoveryCode {
    return {
      code: mongoRecoveryCode.code,
      userId: mongoRecoveryCode.userId,
      expirationDate: mongoRecoveryCode.expirationDate,
    };
  }
}

export { RecoveryCodesCommandRepository };
