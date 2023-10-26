import {
  DiditAuthMethod,
  DiditLogin,
  useDiditAuth,
  useAuthenticationAdapter
} from 'diditsdktest';
import { Inter } from 'next/font/google';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { authMethod, isAuthenticated, status, token, walletAddress } = useDiditAuth();
  const { signOut } = useAuthenticationAdapter();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [modeSelected, setModeSelected] = useState("modal");
  const [providers, setProviders] = useState({
    google: false,
    wallet: false
  });

  const accessToken = String(token);

  const handleProviderChange = (provider: string) => {
    setProviders({
      ...providers,
      [provider]: !providers[provider as keyof typeof providers]
    });
  };
  return (
    <main className={`flex flex-col min-h-screen p-10 bg-gray-100 ${inter.className}`}>
      {/* Authentication Details Header */}
      <header className="mb-6 p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Didit Unified Access</h1>
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

      {/* Content Area */}
      <section className="flex-1">
        <div className="flex flex-col p-6 bg-white shadow-lg rounded-lg space-y-6">
          
          {/* Buttons at the top right */}
          <div className="self-end mb-4">
            {status === "unauthenticated" ? (
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-52"
                onClick={() => setIsLoginModalOpen(true)}
              >
                Open Login Modal
              </button>
            ) : (
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 w-52"
                onClick={() => signOut()}
              >
                Logout
              </button>
            )}
          </div>
          {/* Provider Checkboxes */}
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={providers.google} 
                onChange={() => handleProviderChange('google')}
              />
              <span className="ml-2">Google</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={providers.wallet} 
                onChange={() => handleProviderChange('wallet')}
              />
              <span className="ml-2">Wallet</span>
            </label>
          </div>

          {/* Mode Select */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Mode:</label>
            <select 
              value={modeSelected} 
              onChange={(e) => setModeSelected(e.target.value)}
              className="border rounded p-2"
            >
              <option value="modal">Modal</option>
              <option value="embedded">Embedded</option>
            </select>
          </div>

          { status === "unauthenticated" && (
            <>

           { modeSelected === "modal" && ( 
          <div className="flex flex-col space-y-2">


          <DiditLogin 
          isModalOpen={isLoginModalOpen}
          onModalClose={() => setIsLoginModalOpen(false)}
          />
          </div>
          )}
          { modeSelected === "embedded" && (
          <div className="flex flex-col space-y-2">

            <DiditLogin 
            mode="embedded"/>
          </div>
          )}
          </>
          )}
         
        </div>
      </section>
    </main>
  );
}
