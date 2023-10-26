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

type DiditTokenData = {
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
  identifier: DiditTokenData['identifier'];
  identifierType: DiditTokenData['identifier_type'];
  sub: DiditTokenData['sub'];
};

export {
  SocialAuthProvider,
  DiditAuthMethod,
  AuthenticationStatus,
  type DiditTokenData,
  type DiditUser,
};
