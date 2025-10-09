function generateCredentials() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const random = (pool, len) =>
    Array.from({ length: len }, () => pool[Math.floor(Math.random() * pool.length)]).join("");

  const loginId = `user_${random(letters + numbers, 6)}`;
  const password =
    random(letters, 3) +
    random(numbers, 2) +
    random(symbols, 1) +
    random(letters + numbers + symbols, 3);

  return { loginId, loginPassword: password };
}

 function generateOtp() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return { otp, otpExpiry };
}

export {generateCredentials,generateOtp};
