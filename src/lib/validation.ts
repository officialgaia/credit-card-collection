// パスワード要件: 英字と数字を両方含み、8文字以上
export const PASSWORD_HINT = '英字と数字を組み合わせた8文字以上';

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'パスワードは8文字以上で入力してください。';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'パスワードは英字と数字の両方を含めてください。';
  }
  return null;
}
