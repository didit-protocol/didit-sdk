/* eslint jsx-a11y/label-has-associated-control: 0 */

import { DiditLogin, useDiditAuth } from 'didit-sdk';
import { Inter } from 'next/font/google';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { authMethod, isAuthenticated, logout, status, token, walletAddress } =
    useDiditAuth();

  const accessToken = String(token);

  return (
    <main
      className={`flex flex-col min-h-screen p-10 bg-gray-100 ${inter.className}`}
    >
      {/* Authentication Details Header */}
      <header className="mb-6 p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">
          You're logged in with Didit:
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <p className="flex flex-col space-y-2">
            <span className="font-medium">Status:</span>
            <span className="font-bold text-blue-600">{status}</span>
          </p>
          <p className="flex flex-col space-y-2">
            <span className="font-medium">Address:</span>
            <span className="font-bold text-blue-600">{walletAddress}</span>
          </p>
          <p className="flex flex-col space-y-2">
            <span className="font-medium">Method:</span>
            <span className="font-bold text-blue-600">{authMethod}</span>
          </p>
          <p className="flex flex-col space-y-2">
            <span className="font-medium">Access Token:</span>
            {isAuthenticated && (
              <span className="font-bold text-blue-600">
                {`${accessToken.slice(0, 8)}...${accessToken.slice(-8)}`}
              </span>
            )}
          </p>
        </div>
      </header>
    </main>
  );
}
