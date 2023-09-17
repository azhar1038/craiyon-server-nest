import { Injectable } from '@nestjs/common';
import { compareSync, hash } from 'bcrypt';

@Injectable()
export class HashService {
  public async getHash(value: string): Promise<string> {
    return await hash(value, 10);
  }

  public compareHash(value: string, hashedValue: string): boolean {
    return compareSync(value, hashedValue);
  }
}
