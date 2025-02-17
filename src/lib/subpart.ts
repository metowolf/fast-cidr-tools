import type { IpMeta } from '../parse';

export function subparts($start: bigint, $end: bigint, version: 4 | 6): IpMeta[] {
  const parts: IpMeta[] = [];
  
  // Calculate host bits
  let hostBits = 0n;
  let tmp = $start ^ $end;
  while (tmp !== 0n) {
    tmp = tmp >> 1n;
    hostBits++;
  }

  // Calculate netmask and address range
  const hostMask = (1n << hostBits) - 1n;
  const networkAddr = $start & ~hostMask;
  const broadcastAddr = $start | hostMask;

  if (hostBits > 1n) {
    const splitLow = networkAddr | (hostMask >> 1n);
    const splitHigh = broadcastAddr & ~(hostMask >> 1n);

    if ($start !== networkAddr || $end !== broadcastAddr) {
      // Recursively process left and right subnets
      const leftParts = subparts($start, splitLow, version);
      const rightParts = subparts(splitHigh, $end, version);
      
      parts.push(...leftParts, ...rightParts);
    } else {
      parts.push([networkAddr, broadcastAddr, version]);
    }
  } else {
    parts.push([$start, $end, version]);
  }

  return parts;
}
