// useClearNode.ts - Nitrolite/Yellow authorization logic for React (Vite)
// Types must be imported with 'import type' when verbatimModuleSyntax is enabled
import type { Allowance, AuthRequest, GetLedgerBalancesRPCResponseParams } from '@erc7824/nitrolite';
import {
    createAuthRequestMessage,
    createAuthVerifyMessage,
    createAuthVerifyMessageWithJWT,
    createEIP712AuthMessageSigner,
    parseRPCResponse,
    RPCChannelStatus,
    RPCMethod,
} from '@erc7824/nitrolite';
import { useCallback, useState } from 'react';
// TODO: import useSessionKey, useCreateApplicationSession, useCloseApplicationSession, usePing, useGetLedgerBalances as needed

export const useClearNode = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [usdcBalance, setUSDCBalance] = useState('0');

    // TODO: Replace with your session key logic
    const sessionKeyAddress = '0x0000000000000000000000000000000000000000';
    // TODO: Replace with your hooks for session/app logic
    const createApplicationSession = async () => {};
    const closeApplicationSession = async () => {};
    const getLedgerBalances = async () => {};
    const refetchBalances = () => {};

    const getOnConnectCallback = useCallback((ws: WebSocket, authRequestParams: AuthRequest) => {
        return async () => {
            const jwtToken = window.localStorage.getItem('clearnode_jwt');
            let authRequestMsg;
            if (jwtToken) {
                authRequestMsg = await createAuthVerifyMessageWithJWT(jwtToken);
            } else {
                authRequestMsg = await createAuthRequestMessage(authRequestParams);
            }
            ws.send(authRequestMsg);
        };
    }, []);

    const getOnMessageCallback = useCallback(
        (ws: WebSocket, walletClient: any, authRequestParams: AuthRequest) => {
            return async (event: MessageEvent) => {
                try {
                    if (!walletClient) return;
                    const message = parseRPCResponse(event.data);
                    switch (message.method) {
                        case RPCMethod.AuthChallenge:
                            const eip712MessageSigner = createEIP712AuthMessageSigner(
                                walletClient,
                                {
                                    scope: authRequestParams.scope!,
                                    application: authRequestParams.application!,
                                    participant: authRequestParams.participant,
                                    expire: authRequestParams.expire!,
                                    allowances: authRequestParams.allowances.map((a: Allowance) => ({
                                        asset: a.symbol,
                                        amount: a.amount,
                                    })),
                                },
                                { name: 'Your Domain' }
                            );
                            const authVerifyMsg = await createAuthVerifyMessage(eip712MessageSigner, message);
                            ws.send(authVerifyMsg);
                            break;
                        case RPCMethod.AuthVerify:
                            if (!message.params.success) return;
                            setIsAuthenticated(true);
                            if (message.params.jwtToken) {
                                window.localStorage.setItem('clearnode_jwt', message.params.jwtToken);
                            }
                            break;
                        case RPCMethod.Error:
                            console.error('Authentication failed:', message.params.error);
                            return;
                        case RPCMethod.GetLedgerBalances:
                            const balance = (message.params[0] as unknown as GetLedgerBalancesRPCResponseParams[]).find((a) => a.asset === 'usdc');
                            setUSDCBalance(balance ? balance.amount : '0');
                            return;
                        case RPCMethod.CreateAppSession:
                            const appSessionId = message.params.app_session_id;
                            localStorage.setItem('app_session_id', appSessionId);
                            refetchBalances();
                            return;
                        case RPCMethod.CloseAppSession:
                            if (message.params.status === RPCChannelStatus.Closed) {
                                localStorage.removeItem('app_session_id');
                                refetchBalances();
                            }
                            return;
                    }
                } catch (error) {
                    console.error('Error handling message:', error);
                }
            };
        },
        [refetchBalances]
    );

    const connect = useCallback(
        async (walletClient: any) => {
            if (!walletClient) return;
            const ws = new WebSocket(import.meta.env.VITE_WS_URL as string);
            const authRequestParams: AuthRequest = {
                wallet: walletClient.account!.address,
                participant: sessionKeyAddress,
                app_name: 'Your Domain',
                expire: String(Math.floor(Date.now() / 1000) + 3600),
                scope: 'console',
                application: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
                allowances: [
                    { symbol: 'usdc', amount: '1' },
                ],
            };
            ws.onopen = getOnConnectCallback(ws, authRequestParams);
            ws.onmessage = getOnMessageCallback(ws, walletClient, authRequestParams);
        },
        [getOnConnectCallback, getOnMessageCallback, sessionKeyAddress]
    );

    return {
        isAuthenticated,
        connect,
        createApplicationSession,
        closeApplicationSession,
        getLedgerBalances,
        usdcBalance,
    };
};
