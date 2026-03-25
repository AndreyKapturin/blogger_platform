import { injectable } from 'inversify';
import { RecoveryCodeDocumentType, RecoveryCodeModel } from '../domain/RecoveryCodeModel';

@injectable()
class RecoveryCodesCommandRepository {
  async save(newRecoveryCodeDocument: RecoveryCodeDocumentType): Promise<void> {
    await newRecoveryCodeDocument.save();
  }

  async findCode(recoveryCode: string): Promise<RecoveryCodeDocumentType | null> {
    return await RecoveryCodeModel.findOne({
      code: recoveryCode,
      expirationDate: { $gte: new Date() },
    });
  }

  async cleanAll(): Promise<void> {
    await RecoveryCodeModel.deleteMany();
  }
}

export { RecoveryCodesCommandRepository };
