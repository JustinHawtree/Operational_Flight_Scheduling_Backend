const bcrypt = require('bcrypt');

const saltRounds = 12;


export const getHash = (password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!password) reject("Bcrypt Error: Undefined/Null password for getHash function");
    bcrypt.genSalt(saltRounds, (err: any, salt: any) => {
      if (err) {
        console.log("Bcrypt Error:", err);
        reject(err);
      }
      bcrypt.hash(password, salt, (err: any, hash: any) => {
        if (err) {
          console.log("Bcrypt Error:", err);
          reject(err);
        }
        resolve(hash);
      });
    });
  });
}


export const compareHash = (plainPassword: string, hashPassword: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainPassword, hashPassword, (err: any, result: any) => {
      if (err) {
        console.log("Bcrypt Error:", err);
        reject(err);
      }
      resolve(result);
    })
  })
}