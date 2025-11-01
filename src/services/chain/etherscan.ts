import { config } from '@/config';
import { httpJson } from '@/services/http';
import type { EtherscanResponse, EtherscanTx } from '@/types/external';

const BASE = 'https://api.etherscan.io/api';

export async function getWalletTxs(address: string, startBlock = 0, endBlock = 99999999): Promise<EtherscanTx[]> {
  const key = config.apis.etherscan;
  const url = `${BASE}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${key}`;
  const data = await httpJson<EtherscanResponse<EtherscanTx[]>>(url);
  if (data.status !== '1') return [];
  return data.result;
}

export async function getWalletTokenTxs(address: string): Promise<EtherscanTx[]> {
  const key = config.apis.etherscan;
  const url = `${BASE}?module=account&action=tokentx&address=${address}&sort=desc&apikey=${key}`;
  const data = await httpJson<EtherscanResponse<EtherscanTx[]>>(url);
  if (data.status !== '1') return [];
  return data.result;
}