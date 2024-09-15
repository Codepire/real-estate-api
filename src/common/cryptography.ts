import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import { CONSTANTS } from './constants';


@Injectable()
export class Cryptography {
    hash(options: {
        plainText: string;
    }): Promise<{ hash: string; salt: string }> {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');
            crypto.pbkdf2(
                options.plainText,
                salt,
                1000,
                64,
                `sha512`,
                (err: Error | null, derivedKey: Buffer) => {
                    if (err) {
                        reject(CONSTANTS.SOMETHING_WENT_WRONG_ERROR);
                    }
                    resolve({
                        hash: derivedKey.toString('hex'),
                        salt,
                    });
                },
            );
        });
    }

    compare(options: {
        plainText: string;
        hash: string;
        salt: string;
    }): Promise<boolean> {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(
                options.plainText,
                options.salt,
                1000,
                64,
                `sha512`,
                (err: Error | null, derivedKey: Buffer) => {
                    if (err) {
                        reject(CONSTANTS.SOMETHING_WENT_WRONG_ERROR);
                    }
                    resolve(derivedKey.toString('hex') === options.hash);
                },
            );
        });
    }
}
