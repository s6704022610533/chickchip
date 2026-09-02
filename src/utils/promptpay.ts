// Standard Thai EMVCo PromptPay QR Code generator (CRC16-CCITT)

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(targetId: string, amount?: number): string {
  const sanitized = targetId.replace(/[^0-9]/g, '');
  if (!sanitized) return '';

  let targetType = '';
  let formattedTarget = '';

  if (sanitized.length === 10) {
    // Phone number: 0812345678 -> 0066812345678
    targetType = '01';
    formattedTarget = `0066${sanitized.substring(1)}`;
  } else if (sanitized.length === 13) {
    // National ID or Tax ID
    targetType = '02';
    formattedTarget = sanitized;
  } else if (sanitized.length === 15) {
    // e-Wallet ID
    targetType = '03';
    formattedTarget = sanitized;
  } else {
    return '';
  }

  // Tag 29: PromptPay AID sub-tags
  const aid = formatField('00', 'A000000677010111');
  const target = formatField(targetType, formattedTarget);
  const merchantInfo = formatField('29', `${aid}${target}`);

  // Base payload fields
  let payload = '';
  payload += formatField('00', '01'); // Payload Format Indicator
  payload += formatField('01', amount && amount > 0 ? '12' : '11'); // 11=Static, 12=Dynamic (with amount)
  payload += merchantInfo;
  payload += formatField('53', '764'); // Transaction Currency (THB = 764)

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    payload += formatField('54', formattedAmount);
  }

  payload += formatField('58', 'TH'); // Country Code

  // Tag 63: CRC placeholder
  const payloadWithChecksumPrefix = `${payload}6304`;
  const checksum = crc16(payloadWithChecksumPrefix);

  return `${payloadWithChecksumPrefix}${checksum}`;
}
