enum SocialAuthProvider {
  GOOGLE = 'google',
  // APPLE = 'apple',
}

enum DiditAuthMethod {
  GOOGLE = 'google',
  // APPLE = 'apple',
  // EMAIL = 'email',
  WALLET = 'wallet',
}

enum AuthenticationStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

export { SocialAuthProvider, DiditAuthMethod, AuthenticationStatus };
