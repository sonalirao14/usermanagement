import jwt from 'jsonwebtoken';

export function jwtParseFunction(token: string, publicKey: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                console.error('JWT Verification Error:', err);
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}
