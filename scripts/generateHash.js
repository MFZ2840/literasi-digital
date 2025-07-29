// generateHash.js
const bcrypt = require('bcryptjs');

async function generateHash(plainPassword) {
    // '12' adalah salt rounds yang sama dengan yang Anda gunakan di createUser.js
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    console.log('Password asli:', plainPassword);
    console.log('Password ter-hash:', hashedPassword);
}

generateHash('');