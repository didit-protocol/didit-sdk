enum DiditEmailAuthMode {
  POPUP = 'popup',
  REDIRECT = 'redirect',
}

enum DiditLoginMode {
  MODAL = 'modal',
  EMBEDDED = 'embedded',
}

enum SocialAuthProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
}

enum DiditAuthMethod {
  GOOGLE = 'google',
  APPLE = 'apple',
  // EMAIL = 'email',
  WALLET = 'wallet',
}

enum AuthenticationStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

type DiditTokenInfo = {
  identifier: string;
  identifier_type: string;
  sub: string;
  claims: string[];
  client_id: string;
  exp: number;
  iat: number;
  iss: string;
};

type DiditUser = {
  identifier: DiditTokenInfo['identifier'];
  identifierType: DiditTokenInfo['identifier_type'];
  sub: DiditTokenInfo['sub'];
};

interface DiditTokensData {
  access_token: string;
  refresh_token: string;
}

export {
  DiditEmailAuthMode,
  SocialAuthProvider,
  DiditAuthMethod,
  DiditLoginMode,
  AuthenticationStatus,
  type DiditTokenInfo,
  type DiditUser,
  type DiditTokensData,
};
