import React from 'react';
import { useDiditStatus } from 'diditsdktest';

function SecondView() {
    const { token, address, status } = useDiditStatus();
    return <h1>This is the second view token: {token} address: {address} status: {status}</h1>;
}

export default SecondView;