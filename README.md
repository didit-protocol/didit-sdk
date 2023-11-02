<a href="https://docs.didit.me/docs/sdk">
  <img alt="didit-sdk" src="https://docs.didit.me/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsdk_works.5dcf3190.png&w=3840&q=75" />
</a>

# Didit-SDK

**The easiest way to connect to [Didit protocol(https://docs.didit.me/)]**

Didit-SDK is a [React](https://reactjs.org/) library that makes it easy to add wallet connection to your dapp.

- ✅ **Didit** User Authentication flow
- 🔥 Out-of-the-box wallet management
- ✅ Easily customizable
- 🦄 Built on top of [rainbowkit](https://www.rainbowkit.com), [wagmi](https://wagmi.sh) and [viem](https://viem.sh)

## Try it out

You can use the CodeSandbox links below try out **Didit** Sdk:

- with [Vite-React](https://codesandbox.io/p/sandbox/github/rainbow-me/rainbowkit/tree/main/examples/with-vite) // TODO: setup example on codesandbox
- with [Create-React-Appp](https://codesandbox.io/p/sandbox/github/rainbow-me/rainbowkit/tree/main/examples/with-vite) // TODO: setup example on codesandbox

### Examples

The following examples are provided in the [examples](./examples/) folder of this repo.

- `with-vite-react`
  The example contains a first view 'localhost:3000' where you can test the ConnetButton and a second view 'localhost:3000/status' where you can login, logout and check the auth status from with you own buttons and hooks!

- `with-create-react-app`
  this one contains only connection button on home page

### Running examples

To run an example locally, install dependencies.

```bash
pnpm install
```

Then go into an example directory, eg: `with-vite-react`.

```bash
cd examples/with-vite-react
```

Then run the dev script.

```bash
pnpm run dev
```

### Installation

#### Integrate didit-sdk into your project

install didit-sdk and its peer dependencies, [wagmi](https://wagmi.sh) and [viem](https://viem.sh).

```bash
npm install didit-sdk wagmi viem
```

> Note: RainbowKit is a [React](https://reactjs.org/) library.

#### Import

Import `didit-sdk` and `wagmi``.

All the components, providers, hooks and utils are exported from the main `didit-sdk` package.

```tsx
import 'didit-sdk/styles.css';

import { DiditAuthProvider, DiditLoginButton, DiditAuthMethod, ... } from 'didit-sdk';
```

#### Configure

##### Configure Didit provider

1. Set up the `DiditAuthProvider` with minimum configurable props:

- `clientId`: Your **Didit** client id

```tsx
import { DiditAuthProvider} from 'didit-sdk';

...

      <DiditAuthProvider
        clientId="676573"
      >
        {children}
      </DiditAuthProvider>
```

2. Additionally you can configure your **Didit** connection with more custom props:

- `authMethods`: The authentication methods you want to enable for your users (Default: `['google', 'apple', 'wallet']`)
- `emailAuthBaseUrl`: The base URL of your custom backend with **Didit** auth for email and social auth methods (Default: `https://apx.didit.me/auth`)
- `walletAuthBaseUrl`: The base URL of your custom backend with **Didit** auth for wallet auth method (Default: `https://apx.didit.me/auth`)
- `emailAuthorizationPath`: Custom path for email authorization endpoint (Default: `/oidc/authorize/`)
- `emailRedirectionPath`: Custom path for email redirection. It is used as redirect_uri param after authorization (Default: `/oidc/callback/`)
- `walletAuthorizationPath`: Custom path for wallet authorization endpoint (Default: `/authorizations/v1/wallet-authorization/`)
- `tokenAuthorizationPath`: Custom path for token endpoint (Default: `/authorizations/v1/token/`)
- `claims`: The claims you want to request from your users (Default: `"read:email"`)
- `scope`: The scopes you want to request from your users (Default: `"openid"`)
- `onError`: A callback function that will be called when an error occurs during the authentication process
- `onLogin`: A callback function that will be called when the user successfully logs in
- `onLogout`: A callback function that will be called when the user successfully logs out

```tsx
import { DiditAuthProvider, DiditAuthMethod } from 'didit-sdk';

...
      <DiditAuthProvider
        authMethods={[DiditAuthMethod.APPLE, DiditAuthMethod.GOOGLE]}
        emailAuthBaseUrl="https://my.didit.app/auth/email"
        walletAuthBaseUrl="https://my.didit.app/auth/wallet"
        clientId="676573"
        claims="read:emails write:emails read:profile read:blockchain"
        scope="openid profile"
        emailAuthorizationPath="/authorize/"
        emailRedirectionPath="/redirect/"
        walletAuthorizationPath="/wallet-authorization/"
        tokenAuthorizationPath="/token/"
        onLogin={(_authMethod?: DiditAuthMethod) =>
          console.log('Logged in Didit with', _authMethod)
        }
        onLogout={() => console.log('Logged out Didit')}
        onError={(_error: string) => console.error('Didit error: ', _error)}
      >
```

##### Configure Wagmi

if you want to use the wallet method, You will also need to configure your desired chains, generate the required connectors and setup a `wagmi` config

> Note: Every dApp that relies on WalletConnect now needs to obtain a `projectId` from [WalletConnect Cloud](https://cloud.walletconnect.com/). This is absolutely free and only takes a few minutes.

```tsx line=4-99
...
import { getDefaultWallets } from 'didit-sdk';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, zora } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, zora],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'App with Didit',
  projectId: 'YOUR_WALLET_CONNECT_PROJECT_ID',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})
```

[Read more about configuring chains & providers with `wagmi`](https://wagmi.sh/docs/providers/configuring-chains).

1. Set up [`WagmiConfig`](https://wagmi.sh/docs/provider):

Pass the next parameters to the `DiditAuthProvider` provider:

- `chains`: Wagmi config of the requested chain [i.e: wagmiConfig.chains]
- `theme`: theme function to customize RainbowKit UI to match your branding.
  there are 3 built-in theme functions:
  - `lightTheme` &nbsp; (default)
  - `darkTheme`
  - `midnightTheme`
    refer to [RainbowKit Theming](https://www.rainbowkit.com/docs/theming) for more.

```tsx
<WagmiConfig
  config={wagmiConfig} // The one that was configured before for Wagmi
>
  <DiditAuthProvider clientId="676573" chains={chains} theme={lightTheme()}>
    {children}
  </DiditAuthProvider>
</WagmiConfig>
```

##### Wrap all providers

Wrap your application with `WagmiConfig` and `DiditAuthProvider` providers in the following order and way:

```tsx
const App = () => {
  return (
    <WagmiConfig
      config={wagmiConfig} // The one that was configured before for Wagmi
    >
      <DiditAuthProvider clientId="676573" chains={chains} theme={lightTheme()}>
        {children}
      </DiditAuthProvider>
    </WagmiConfig>
  );
};
```

#### Manage authentication

##### Add default Didit login and logout components

1. Add the `DiditLoginButton` component to your app using a authentication method:

```tsx
import { DiditLoginButton, DiditAuthMethod } from 'didit-sdk';

...

  <DiditLoginButton
    label="Connect with Didit"
    authMethod={DiditAuthMethod.GOOGLE}
  />
```

2. Add the `DiditLogoutButton` component to your app:

```tsx
import { DiditLogoutButton } from 'didit-sdk';

...

  <DiditLogoutButton
    label="Logout from Didit"
  />
```

3. Additionally you can use the `DiditLogin` component to provide multiple authentication methods. You can also configure it with:

- `mode`: The mode of the login component (`modal` or `embedded`) (Default: `modal`)

```tsx
import { DiditLogin } from 'didit-sdk';

...

  <DiditLogin
    mode="modal"
    isModalOpen={isLoginModalOpen}
    onModalClose={() => setIsLoginModalOpen(false)}
  />
```

```tsx
import { DiditLogin } from 'didit-sdk';

...

  <DiditLogin mode="embedded" />
```

> The `DiditLogin` is automatically configured with the authentication methods you provided to the `DiditAuthProvider` provider.

#### Retrieve the authentication status

You can use the `useDiditAuth` hook to retrieve the authentication status and current connection;

- `authMethod`: The current authentication method being used

  ```tsx
  import { DiditAuthMethod } from 'didit-sdk';
  ```

- `status`: The current authentication status ('loading', 'authenticated', 'unauthenticated')

  ```tsx
  import { AuthenticationStatus } from 'didit-sdk';
  ```

- `token`: The current **Didit** access token
- `isAuthenticated`: Whether the user is authenticated or not
- `walletAddress`: The current user's wallet address if connected by the wallet auth method
- `error`: The current error in authentication process if any

```tsx
import { useDiditAuth } from 'didit-sdk';

...
  const { authMethod, status, token, isAuthenticated, walletAddress, error } = useDiditAuth();

  return (
    <div>
      <p>Auth method: {authMethod}</p>
      <p>Status: {status}</p>
      <p>Token: {token}</p>
      <p>Is authenticated: {isAuthenticated}</p>
      <p>Address: {walletAddress}</p>
      <p>Error: {error}</p>
    </div>
  );
```

##### Customize the authentication flow

Additonally you can customize the **Didit** authentication flow by also using rest of the values returned by the `useDiditAuth` hook:

```tsx
import { useDiditAuth } from 'didit-sdk';

...

const {
    authMethod,
    availableAuthMethods,
    error,
    hasError,
    isAuthenticated,
    isLoading,
    login,
    loginWithApple,
    loginWithEmail,
    loginWithGoogle,
    loginWithSocial,
    loginWithWallet,
    logout,
    status,
    token,
    tokenData,
    user,
    walletAddress: address,
} = useDiditAuth({
  onError: (error: string) => console.error('Didit error: ', error),
  onLogin: (authMethod?: string) => console.log('Logged in Didit with', authMethod),
  onLogout: () => console.log('Logged out Didit')
});

return (
  <button
    id="custom-Didit-login-button"
    onClick={() => {
      if (isAuthenticated) {
        logout();
      } else {
        loginWithWallet();
      }
    }}
    disabled={ isAuthenticating === undefined }
  >
    {isAuthenticated ? 'Logout' : 'Login'}
  </button>
  <div>
    <p>Auth method: {authMethod}</p>
    <p>Status: {status}</p>
    <p>Token: {token}</p>
    <p>Is authenticated: {isAuthenticated}</p>
    <p>User identifier: {user?.identifier}</p>
    <p>Identifier type: {user?.identifierType}</p>
  </div>
)

```
