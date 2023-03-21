# Didit-SDK

**The best way to connect a wallet**

Didit-SDK is a [React](https://reactjs.org/) library that makes it easy to add wallet connection to your dapp.

- 🔥 Out-of-the-box wallet management
- ✅ Easily customizable
- 🦄 Built on top of [wagmi](https://github.com/tmm/wagmi) and [ethers](https://docs.ethers.io)

## Examples

The following examples are provided in the [examples](./examples/) folder of this repo.

- SDK for reactJS
  - `cd lib-didit-typescript-sdk`
  - `pnpm i`
  - `cd examples/with-create-react-app`
  - `pnpm dev`
  - try it out on localhost:3030!

## How to integrate

To integrate didit you will need 3 things:

1. [Wagmi client](https://github.com/tmm/wagmi)
2. SetUp the DiditProvider
   - `npm i diditprovidertest`
   - Pass the next parameters to the provider
     - **client_id (str)**: URL to you backend server [i.e: 'http://127.0.0.1:8000/avatar/integrations']
     - **scopes (str)**: Requested scopes [i.e: 'openid profile']
     - **claims (str) [optional]**: Requested claims [i.e: 'write:email']
     - Example:  
       `<DiditProvider client_id='http://127.0.0.1:8000/avatar/integrations' scopes='openid' claims='write:email'>`
3. Set up the DiditAuthProvider:

- `npm i diditsdktest`
- Pass the next parameters to the provider:
  - **chains (str)**: Wagmi config of the requested chain [i.e: wagmi.chains]
- Example: `<DiditAuthProvider chains={chains} theme={ midnightTheme() }>`

Full code Example:

```
    <WagmiConfig client={wagmiClient}>
      <DiditProvider client_id='http://127.0.0.1:8000/avatar/integrations' scopes='openid' claims='write:email'>
          <DiditAuthProvider chains={chains} theme={ midnightTheme() }>
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 12,
      }}
    >
      <ConnectButton />
    </div>
       </DiditAuthProvider>
      </DiditProvider>
    </WagmiConfig>
```

## Retrieve the accessToken & walletAddress

```
import { useDiditStatus } from "diditsdktest";
const [address, token, status] = useDiditStatus()
```

## Login & Logout functions

```
  import {
    useAuthenticationAdapter,
    useConnectModal,
  } from 'diditsdktest';
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
}
```
