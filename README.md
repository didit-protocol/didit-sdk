# Didit-SDK

**The best way to connect to Didit protocol**

Didit-SDK is a [React](https://reactjs.org/) library that makes it easy connect your app/dapp to Didit.

- 🔥 Out-of-the-box wallet management
- ✅ Easily customizable
- 🦄 Built on top of [wagmi](https://github.com/tmm/wagmi) and [ethers](https://docs.ethers.io)

## Examples

The following examples are provided in the [examples](./examples/) folder of this repo. The example contains a first view 'localhost:3030' where you can test the ConnetButton and a second view 'localhost:3030/app' where you can login, logout and check the auth status from with you own buttons and hooks!

- SDK for reactJS
  - `cd examples/with-create-react-app`
  - `yarn install`
  - Copy the .env.example file to .env and fill in the required variables
  - `yarn dev`
  - try it out on localhost:3000!

## How to integrate

To integrate didit you will need 3 things:

1. [Wagmi client](https://github.com/tmm/wagmi)
2. SetUp the DiditProvider
   - `npm i didit-provider`
   - Pass the next parameters to the provider
     - **clientUrl (str)**: URL to you backend server [i.e: 'http://127.0.0.1:8000/avatar/integrations']
     - Example:  
       `<DiditProvider clientUrl='http://127.0.0.1:8000/avatar/integrations'>`
3. Set up the DiditAuthProvider:

- `npm i didit-sdk`
- Pass the next parameters to the provider:
  - **chains (str)**: Wagmi config of the requested chain [i.e: wagmi.chains]
- Example: `<DiditAuthProvider chains={chains} theme={ midnightTheme() }>`

Full code Example:

```
    <WagmiConfig client={wagmiClient}>
      <DiditProvider clientUrl='http://127.0.0.1:8000/avatar/integrations'>
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
import { useDiditStatus } from "didit-sdk";
const {address, token, status, error} = useDiditStatus()
```

- **address:** connected address
- **token:** provided accessToken
- **status:** "authenthicated"/"unauthenthicated"
- **error:** any error from within the SDK

## Login & Logout functions

```
  import {
    useAuthenticationAdapter,
    useConnectModal,
  } from 'didit-sdk';
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
