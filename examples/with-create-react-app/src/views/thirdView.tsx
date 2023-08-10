import { ConnectButton } from 'didit-sdk';
import { useSignMessage } from 'wagmi';
import { useState } from 'react';
import React from 'react';

function ThirdView() {
  const [policy, setPolicy] = useState('');
  const { signMessageAsync } = useSignMessage({});

  return (
    <>
      <ConnectButton
        label="Connect Wallet"
        accountStatus="address"
        chainStatus="full"
      />
      <button
        onClick={async () => {
          const requestBody = JSON.parse(
            JSON.stringify(
              {
                scope: 'openid',
                wallet_address: '0xE993117440fE22506cF91ea386970cf84D5f45dE',
                claims:
                  'read:name write:name read:email write:email read:picture write:picture',
              },
              null,
              2
            )
          );
          const response = await fetch(
            'https://apx.dev.gamium.world/avatar/auth/wallet_authorization',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            }
          );
          const data = await response.json();
          setPolicy(data.policy);
        }}
      >
        send request
      </button>
      <button onClick={() => signMessageAsync({ message: 'hola' })}>
        sign
      </button>
    </>
  );
}

export default ThirdView;
