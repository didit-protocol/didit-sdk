import CryptoJS from 'crypto-js';

const generateCodeVerifier = () => {
  const codeVerifier = CryptoJS.lib.WordArray.random(128 / 8).toString();
  return codeVerifier;
};

const generateCodeChallenge = (verifier: string) => {
  const hashed = CryptoJS.SHA256(verifier).toString(CryptoJS.enc.Base64);
  const base64Url = hashed
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return base64Url;
};

function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export { generateCodeChallenge, generateCodeVerifier, parseJwt };
