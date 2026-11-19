const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?:08\d{8,11}|\+628\d{7,10})$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return emailPattern.test(email);
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export function isValidPhone(phone: string): boolean {
  return phonePattern.test(normalizePhone(phone));
}
