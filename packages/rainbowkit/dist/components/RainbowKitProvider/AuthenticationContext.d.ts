import { ReactNode } from 'react';
export type AuthenticationStatus = 'loading' | 'unauthenticated' | 'authenticated';
export interface AuthenticationAdapter<Message> {
    getNonce: () => Promise<string>;
    createMessage: (args: {
        address: string;
        chainId: number;
        resource: string;
        clientId: string;
        scopes?: string;
    }) => Message;
    getMessageBody: (args: {
        message: Message;
    }) => string;
    verify: (args: {
        clientId: string;
        signature: string;
        code: string;
    }) => Promise<{
        verified: boolean;
        token: string;
    }>;
    signOut: () => Promise<void>;
}
export interface AuthenticationConfig<Message> {
    adapter: AuthenticationAdapter<Message>;
    status: AuthenticationStatus;
}
export declare function createAuthenticationAdapter<Message>(adapter: AuthenticationAdapter<Message>): AuthenticationAdapter<Message>;
interface RainbowKitAuthenticationProviderProps<Message> extends AuthenticationConfig<Message> {
    enabled?: boolean;
    children: ReactNode;
}
export declare function RainbowKitAuthenticationProvider<Message = unknown>({ adapter, children, enabled, status, }: RainbowKitAuthenticationProviderProps<Message>): JSX.Element;
export declare function useAuthenticationAdapter(): AuthenticationAdapter<any>;
export declare function useAuthenticationStatus(): AuthenticationStatus | null;
export {};
