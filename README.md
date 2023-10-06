<a href="https://docs.didit.me/docs/sdk">
  <img alt="didit-sdk" src="https://docs.didit.me/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsdk_works.5dcf3190.png&w=3840&q=75" />
</a>

# Didit-SDK

**The best way to connect a wallet**

Didit-SDK is a [React](https://reactjs.org/) library that makes it easy to add wallet connection to your dapp.

- ✅ Didit User Authentication flow
- 🔥 Out-of-the-box wallet management
- ✅ Easily customizable
- 🦄 Built on top of [rainbowkit](https://www.rainbowkit.com), [wagmi](https://wagmi.sh) and [viem](https://viem.sh)

### Try it out

You can use the CodeSandbox links below try out Didit Sdk:

- with [Vite-React](https://codesandbox.io/p/sandbox/github/rainbow-me/rainbowkit/tree/main/examples/with-vite) // TODO: setup example on codesandbox

### Examples

The following examples are provided in the [examples](./examples/) folder of this repo.

- `with-vite-react`

The example contains a first view 'localhost:3030' where you can test the ConnetButton and a second view 'localhost:3030/status' where you can login, logout and check the auth status from with you own buttons and hooks!

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

## integrate didit-sdk into your project.

install didit-sdk and its peer dependencies, [wagmi](https://wagmi.sh) and [viem](https://viem.sh).

```bash
npm install didit-sdk didit-provider wagmi viem
```

> Note: RainbowKit is a [React](https://reactjs.org/) library.

#### Import

Import didit-sdk and wagmi.

```tsx
import 'didit-sdk/styles.css';

import { getDefaultWallets, DiditAuthProvider, darkTheme } from 'didit-sdk';
import { DiditProvider } from 'didit-provider';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base, zora } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
```

#### Configure

Configure your desired chains and generate the required connectors. You will also need to setup a `wagmi` config.

> Note: Every dApp that relies on WalletConnect now needs to obtain a `projectId` from [WalletConnect Cloud](https://cloud.walletconnect.com/). This is absolutely free and only takes a few minutes.

```tsx line=4-99
...
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
  projectId: 'YOUR_PROJECT_ID',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})
```

[Read more about configuring chains & providers with `wagmi`](https://wagmi.sh/docs/providers/configuring-chains).

#### Setup providers

1. Set up the DiditProvider
   pass **clientUrl (str)** URL to your backend server [i.e: 'http://127.0.0.1:8000/avatar/integrations']

```tsx
  <DiditProvider clientUrl="https://apx.dev.didit.me/profile/authorizations/v1">
```

2. Set up DiditAuthProvider

Pass the next parameters to the provider:

- **chains (str)**: Wagmi config of the requested chain [i.e: wagmiConfig.chains]
- **theme (str)**: theme function to customize RainbowKit UI to match your branding.
  there are 3 built-in theme functions:
  - `lightTheme` &nbsp; (default)
  - `darkTheme`
  - `midnightTheme`
    refer to [RainbowKit Theming](https://www.rainbowkit.com/docs/theming) for more.

```tsx
  <DiditAuthProvider chains={chains} theme={darkTheme()}>
```

#### Wrap providers

Wrap your application with `DiditProvider`, `DiditAuthProvider` and [`WagmiConfig`](https://wagmi.sh/docs/provider).

```tsx
const App = () => {
  return (
    <WagmiConfig config={wagmiConfig}>
      <DiditProvider clientUrl="https://apx.dev.didit.me/profile/authorizations/v1">
        <DiditAuthProvider chains={chains} theme={darkTheme()}>
          {children}
        </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
  );
};
```

#### Add the connect button

Then, in your app, import and render the `ConnectButton` component.

```tsx
import { ConnectButton } from 'didit-sdk';

export const YourApp = () => {
  return <ConnectButton />;
};
```

#### Retrieve the accessToken & walletAddress

```tsx
import { useDiditStatus } from 'didit-sdk';
// 'loading' | 'authenticated' | 'unauthenticated'
const Component = () => {
  const { address, token, status, error } = useDiditStatus();
  return (
    <div>
      {status === 'authenticated' && <span>token: {token}</span>}
      <span>address: {address}</span>
    </div>
  );
};
```

- **address:** connected address
- **token:** provided accessToken
- **status:** `"loading" | "authenticated" | "unauthenticated"`
- **error:** any error from within the SDK

#### Login & Logout functions

```tsx
import { useAuthenticationAdapter, useConnectModal } from 'didit-sdk';

const Component = () => {
  const adapter = useAuthenticationAdapter();
  const { openConnectModal } = useConnectModal();
  return (
    <>
      <button onClick={() => adapter.signOut()}>LOGOUT</button>
      {openConnectModal && (
        <button onClick={() => openConnectModal()}>LOGIN</button>
      )}
    </>
  );
};
```
