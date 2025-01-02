'use client';

import { useState } from 'react';
import axios from 'axios';
import TradingChart from '@/components/TradingChart';

export default function Home() {
  const [address, setAddress] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenName, setTokenName] = useState(''); // New state for token name

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      setError('');
      setTokenName(''); // Reset token name when fetching new data
      
      // First, find the coin ID for the given contract address
      const coinsResponse = await axios.get(
        'https://api.coingecko.com/api/v3/coins/list?include_platform=true'
      );
      
      const coin = coinsResponse.data.find((coin: any) => 
        Object.values(coin.platforms).includes(address.toLowerCase())
      );

      if (!coin) {
        throw new Error('Token not found on CoinGecko');
      }

      // Set token name
      setTokenName(`${coin.name} (${coin.symbol.toUpperCase()})`);

      // Then fetch the OHLC data using the coin ID
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/ohlc?vs_currency=usd&days=30`
      );

      const formattedData = response.data
        .map((item: number[]) => ({
          time: Math.floor(item[0] / 1000),
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
        }))
        .sort((a: any, b: any) => a.time - b.time)
        .filter((item: any, index: number, self: any[]) => 
          index === 0 || item.time !== self[index - 1].time
        );

      setChartData(formattedData);
    } catch (err: any) {
      setError(err.message || 'Error fetching data. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center">
          Crypto Trading Vision
        </h1>
        
        <div className="backdrop-blur-lg bg-black/30 p-6 rounded-lg border border-purple-500/30 shadow-2xl mb-6">
          <div className="flex gap-4 mb-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter token address"
              className="flex-1 p-3 rounded-lg bg-gray-900/90 border border-cyan-500/30 text-cyan-100 
                placeholder-cyan-700 focus:outline-none focus:border-cyan-400 focus:ring-1 
                focus:ring-cyan-400 transition-all duration-300"
            />
            <button
              onClick={fetchTokenData}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg
                hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-300 shadow-lg shadow-purple-500/30 font-semibold
                hover:shadow-cyan-500/30"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : 'Fetch Data'}
            </button>
          </div>

          {tokenName && (
            <div className="mb-4 text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r 
              from-purple-400 to-cyan-400 animate-pulse">
              Token: {tokenName}
            </div>
          )}

          {error && (
            <p className="text-red-400 mb-4 bg-red-900/20 p-3 rounded border border-red-500/30">
              {error}
            </p>
          )}
        </div>
        
        {chartData.length > 0 && (
          <div className="backdrop-blur-lg bg-black/30 p-6 rounded-lg border border-cyan-500/30 
            shadow-2xl shadow-purple-500/20 overflow-hidden">
            <div className="w-full">
              <TradingChart data={chartData} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}