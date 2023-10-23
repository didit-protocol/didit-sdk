const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  let codeVerifier = btoa(String.fromCharCode.apply(null, array as any))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return codeVerifier;
};

const generateCodeChallenge = async (verifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashed = await crypto.subtle.digest('SHA-256', data);

  let base64Url = btoa(
    String.fromCharCode.apply(null, new Uint8Array(hashed) as any)
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return base64Url;
};

export { generateCodeChallenge, generateCodeVerifier };
