/**
 * Generates a standard UPI deep-link.
 * Scheme: upi://pay?pa=address@bank&pn=PayeeName&am=Amount&tn=Note&cu=INR
 */
export function generateUPILink(upiId: string, name: string, amount: number, note: string): string {
  const formattedName = encodeURIComponent(name.trim());
  const formattedNote = encodeURIComponent(note.trim().substring(0, 80)); // Truncate notes if too long for UPI specs
  const formattedAmount = amount.toFixed(2);
  
  return `upi://pay?pa=${upiId}&pn=${formattedName}&am=${formattedAmount}&tn=${formattedNote}&cu=INR`;
}

/**
 * Generates a URL for a QR Code image representing the UPI link.
 * Uses a reliable public QR code generator API (qrserver.com).
 */
export function generateUPIQRCodeUrl(upiId: string, name: string, amount: number, note: string): string {
  const upiLink = generateUPILink(upiId, name, amount, note);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}&color=000000&bgcolor=ffffff`;
}
