type OtpErrorInfo = {
  code?: string;
  status?: number;
};

export function authErrorMessage(error: OtpErrorInfo): string {
  switch (error.code) {
    case "email_address_invalid":
      return "Format email belum benar.";
    case "email_address_not_authorized":
      return "Email ini belum bisa dikirimi kode. Coba email lain.";
    case "email_provider_disabled":
      return "Login lewat email belum aktif.";
    case "invalid_credentials":
    case "validation_failed":
      return "Kode salah atau sudah kedaluwarsa. Minta kode baru ya.";
    case "otp_disabled":
      return "Email belum terdaftar. Coba pilih Daftar ya.";
    case "otp_expired":
      return "Kode sudah kedaluwarsa atau salah. Minta kode baru ya.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi.";
    case "signup_disabled":
      return "Pendaftaran sedang ditutup.";
    case "user_not_found":
      return "Email belum terdaftar. Coba pilih Daftar ya.";
    default:
      return error.status === 429
        ? "Terlalu banyak percobaan. Tunggu sebentar, lalu coba lagi."
        : "Ada masalah. Coba lagi ya.";
  }
}
