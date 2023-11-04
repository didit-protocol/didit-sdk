import { DiditAuthMethod, DiditEmailAuthMode } from './types';

// Didit TOKENS CHECK

const DEFAULT_AUTH_INTOSPECT_PATH =
  'https://apx.dev.didit.me/auth/authorizations/v1/introspect/';
const DEFAULT_AUTH_ROTATE_TOKEN_PATH =
  'https://apx.dev.didit.me/auth/authorizations/v1/token/';

// Didit Wallet login
const DEFAULT_WALLET_AUTH_BASE_URL = 'https://apx.didit.me/auth';
const DEFAULT_WALLET_AUTH_AUTHORIZATION_PATH =
  '/authorizations/v1/wallet-authorization/';
const DEFAULT_WALLET_AUTH_TOKEN_PATH = '/authorizations/v1/token/';

// Email auth login
const DEFAULT_EMAIL_AUTH_MODE = DiditEmailAuthMode.POPUP;
const EMAIL_AUTH_BASE_URL = 'https://apx.didit.me/auth';
const EMAIL_AUTH_AUTHORIZATION_PATH = '/oidc/authorize/';
const EMAIL_AUTH_LOGOUT_PATH = '/oidc/logout/';
const EMAIL_AUTH_AUTHORIZATION_GRANNT_TYPE = 'authorization_code';
const EMAIL_AUTH_CODE_CHALLENGE_METHOD = 'S256';
const EMAIL_AUTH_RESPONSE_TYPE = 'code';
const EMAIL_AUTH_POPUP_WIDTH = 400;
const EMAIL_AUTH_POPUP_HEIGHT = 600;
const EMAIL_AUTH_CODE_VERIFIER_COOKIE_NAME = 'didit_auth_code_verifier';
const EMAIL_AUTH_SOCIAL_AUTH_PROVIDER_COOKIE_NAME =
  'didit_auth_social_auth_provider';

// General Didit
const AUTH_METHOD_COOKIE_NAME = 'didit_auth_method';
const TOKEN_COOKIE_NAME = 'didit_token';
const REFRESH_TOKEN_COOKIE_NAME = 'didit_refresh_token';
const WALLET_ADDRESS_COOKIE_NAME = 'didit_wallet_address';
const DEFAULT_CLAIMS = 'read:email';
const DEFAULT_SCOPE = 'openid';
const DEFAULT_AUTH_METHODS = [
  DiditAuthMethod.WALLET,
  DiditAuthMethod.GOOGLE,
  DiditAuthMethod.APPLE,
];

const DIDIT = {
  AUTH_METHOD_COOKIE_NAME,
  DEFAULT_AUTH_INTOSPECT_PATH,
  DEFAULT_AUTH_METHODS,
  DEFAULT_AUTH_ROTATE_TOKEN_PATH,
  DEFAULT_CLAIMS,
  DEFAULT_EMAIL_AUTH_MODE,
  DEFAULT_SCOPE,
  DEFAULT_WALLET_AUTH_AUTHORIZATION_PATH,
  DEFAULT_WALLET_AUTH_BASE_URL,
  DEFAULT_WALLET_AUTH_TOKEN_PATH,
  EMAIL_AUTH_AUTHORIZATION_GRANNT_TYPE,
  EMAIL_AUTH_AUTHORIZATION_PATH,
  EMAIL_AUTH_BASE_URL,
  EMAIL_AUTH_CODE_CHALLENGE_METHOD,
  EMAIL_AUTH_CODE_VERIFIER_COOKIE_NAME,
  EMAIL_AUTH_LOGOUT_PATH,
  EMAIL_AUTH_POPUP_HEIGHT,
  EMAIL_AUTH_POPUP_WIDTH,
  EMAIL_AUTH_RESPONSE_TYPE,
  EMAIL_AUTH_SOCIAL_AUTH_PROVIDER_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
  WALLET_ADDRESS_COOKIE_NAME,
};

export { DIDIT };
