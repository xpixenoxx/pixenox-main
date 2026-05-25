/**
 * Checks if a given IP address belongs to a VPN, Proxy, or Tor node.
 * Uses proxycheck.io API (allows up to 1000 free queries/day without an API key).
 */
export async function isVpnIp(ip: string): Promise<boolean> {
  // Localhost IPs are not VPNs
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'unknown' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return false;
  }

  try {
    const apiKey = process.env.PROXYCHECK_API_KEY || ''; 
    const url = `https://proxycheck.io/v2/${ip}?key=${apiKey}&vpn=1&asn=1`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Cache the result for an hour to avoid hitting rate limits and speed up responses
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      console.warn('VPN check failed with status:', response.status);
      return false; // Fail open to not block legitimate users if API is down
    }

    const data = await response.json();
    
    if (data.status === 'ok' && data[ip]) {
      // proxycheck returns "yes" if it's a proxy/VPN
      return data[ip].proxy === 'yes';
    }
    
    return false;
  } catch (error) {
    console.error('Error checking VPN status:', error);
    return false; // Fail open
  }
}
