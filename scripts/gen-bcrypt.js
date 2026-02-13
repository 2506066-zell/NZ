import bcrypt from 'bcryptjs';

const pwd = process.argv[2] || '123456';
const cost = Number(process.argv[3] || 10);
const hash = bcrypt.hashSync(pwd, cost);
console.log(hash);
