"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const RainAnimation = () => {
  const [rainDrops, setRainDrops] = useState([])

  useEffect(() => {
    const createRainDrop = () => {
      const id = Math.random()
      const left = Math.random() * 100
      const animationDuration = Math.random() * 3 + 2 // 2-5 seconds
      const size = Math.random() * 20 + 20 // 20-40px

      return {
        id,
        left: `${left}%`,
        animationDuration: `${animationDuration}s`,
        size: `${size}px`,
      }
    }

    const interval = setInterval(() => {
      setRainDrops((prev) => {
        const newDrop = createRainDrop()
        const updatedDrops = [...prev, newDrop]

        // Keep only last 15 drops to prevent memory issues
        return updatedDrops.slice(-15)
      })
    }, 300) // New drop every 300ms

    // Clean up old drops
    const cleanupInterval = setInterval(() => {
      setRainDrops((prev) => prev.slice(-10))
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(cleanupInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {rainDrops.map((drop) => (
        <div
          key={drop.id}
          className="absolute animate-bounce"
          style={{
            left: drop.left,
            top: "-50px",
            animationDuration: drop.animationDuration,
            animationName: "fall",
            animationTimingFunction: "linear",
            animationIterationCount: "1",
            animationFillMode: "forwards",
          }}
        >
          <Image
            src="/images/kirby-rain.gif"
            alt="Kirby"
            width={Number.parseInt(drop.size)}
            height={Number.parseInt(drop.size)}
            className="pixelated"
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(calc(100vh + 100px));
          }
        }
      `}</style>
    </div>
  )
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentToken, setCurrentToken] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [tokenData, setTokenData] = useState({
    price: "$0.000042",
    change24h: "+420.69%",
    marketCap: "$6,467",
    totalSupply: "999,999,999",
    totalFees: "$0",
    volume24h: "$25",
    bondingProgress: "9.37%",
    progressValue: 9.37,
    graduationTarget: "$62,535.34",
    holders: "1,337",
    contract: "AGRhxj...DrBAGS",
    aiScore: "9.5/10",
    riskLevel: "LOW",
    creatorFees: "$0",
    platformFees: "$0",
    twitter: null,
    website: null,
  })
  const [recentTrades, setRecentTrades] = useState([])

  const fetchRealTimeMarketCap = async (tokenSymbol: string) => {
    try {
      const coinGeckoIds: { [key: string]: string } = {
        SOL: "solana",
        BTC: "bitcoin",
        ETH: "ethereum",
        USDC: "usd-coin",
        USDT: "tether",
        ADA: "cardano",
        DOT: "polkadot",
        LINK: "chainlink",
        MATIC: "matic-network",
        AVAX: "avalanche-2",
      }

      const coinId = coinGeckoIds[tokenSymbol.toUpperCase()]

      if (coinId) {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true&include_24hr_vol=true`,
        )

        if (response.ok) {
          const data = await response.json()
          const coinData = data[coinId]

          if (coinData) {
            return {
              price: `$${coinData.usd.toFixed(coinData.usd < 1 ? 6 : 2)}`,
              marketCap: `$${(coinData.usd_market_cap / 1000000).toFixed(1)}M`,
              volume24h: `$${(coinData.usd_24h_vol / 1000000).toFixed(1)}M`,
              change24h: `${coinData.usd_24h_change > 0 ? "+" : ""}${coinData.usd_24h_change.toFixed(2)}%`,
            }
          }
        }
      }
    } catch (error) {
      console.log("[v0] Error fetching real-time data:", error)
    }
    return null
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (hasSearched && currentToken) {
      const updateRealTimeData = async () => {
        const realTimeData = await fetchRealTimeMarketCap(currentToken)

        if (realTimeData) {
          setTokenData((prev) => ({
            ...prev,
            price: realTimeData.price,
            marketCap: realTimeData.marketCap,
            volume24h: realTimeData.volume24h,
            change24h: realTimeData.change24h,
          }))
          setLastUpdated(new Date())
        }
      }

      // Update immediately
      updateRealTimeData()

      // Then update every 30 seconds
      interval = setInterval(updateRealTimeData, 30000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [hasSearched, currentToken])

  const fetchTokenData = async (searchQuery: string) => {
    try {
      setIsLoading(true)

      let tokenAddress = searchQuery.trim()
      let tokenSymbol = searchQuery.toUpperCase()

      // Handle popular token names by converting to addresses
      if (searchQuery.toLowerCase() === "solana" || searchQuery.toLowerCase() === "sol") {
        tokenAddress = "So11111111111111111111111111111111111111112"
        tokenSymbol = "SOL"
      } else if (searchQuery.toLowerCase() === "bitcoin" || searchQuery.toLowerCase() === "btc") {
        tokenAddress = "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"
        tokenSymbol = "BTC"
      } else if (searchQuery.toLowerCase() === "ethereum" || searchQuery.toLowerCase() === "eth") {
        tokenAddress = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"
        tokenSymbol = "ETH"
      } else if (searchQuery.length > 20) {
        tokenSymbol = searchQuery.slice(0, 4).toUpperCase()
      }

      const tokenSpecificData = {
        sol: {
          price: "$142.35",
          change24h: "+5.67%",
          marketCap: "$67,234,567",
          volume24h: "$1,234,567",
          bondingProgress: "85.42%",
          progressValue: 85.42,
          graduationTarget: "$75,000,000.00",
          holders: "45,678",
          twitter: "https://twitter.com/solana",
          website: "https://solana.com",
        },
        btc: {
          price: "$43,567.89",
          change24h: "+2.34%",
          marketCap: "$856,789,123",
          volume24h: "$2,345,678",
          bondingProgress: "92.15%",
          progressValue: 92.15,
          graduationTarget: "$900,000,000.00",
          holders: "123,456",
          twitter: "https://twitter.com/bitcoin",
          website: "https://bitcoin.org",
        },
        eth: {
          price: "$2,456.78",
          change24h: "+3.45%",
          marketCap: "$295,678,901",
          volume24h: "$1,567,890",
          bondingProgress: "78.93%",
          progressValue: 78.93,
          graduationTarget: "$350,000,000.00",
          holders: "87,654",
          twitter: "https://twitter.com/ethereum",
          website: "https://ethereum.org",
        },
      }

      const tokenKey = tokenSymbol.toLowerCase()
      const specificData = tokenSpecificData[tokenKey]

      const realTimeData = await fetchRealTimeMarketCap(tokenSymbol)

      if (specificData) {
        return {
          ...specificData,
          ...(realTimeData && {
            price: realTimeData.price,
            marketCap: realTimeData.marketCap,
            volume24h: realTimeData.volume24h,
            change24h: realTimeData.change24h,
          }),
          totalSupply: "999,999,999",
          totalFees: "$0",
          contract:
            tokenAddress.length > 20 ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-6)}` : "HvpRBX...xHBAGS",
          aiScore: "9.5/10",
          riskLevel: "LOW",
          creatorFees: "$0",
          platformFees: "$0",
          twitter: specificData.twitter,
          website: specificData.website,
          tokenSymbol: tokenSymbol,
          pairAddress: tokenAddress,
        }
      }

      const hash = tokenAddress.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const seed = Math.abs(hash)
      const random = (seed: number) => {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
      }

      const marketCapValue = Math.floor(random(seed) * 50000 + 10000)
      const volumeValue = Math.floor(random(seed + 1) * 100 + 25)
      const progressValue = random(seed + 2) * 15 + 5
      const priceValue = random(seed + 3) * 0.01
      const changeValue = (random(seed + 4) - 0.5) * 1000

      return {
        price: `$${priceValue.toFixed(6)}`,
        change24h: `${changeValue > 0 ? "+" : ""}${changeValue.toFixed(2)}%`,
        marketCap: `$${marketCapValue.toLocaleString()}`,
        totalSupply: "999,999,999",
        totalFees: "$0",
        volume24h: `$${volumeValue}`,
        bondingProgress: `${progressValue.toFixed(2)}%`,
        progressValue: progressValue,
        graduationTarget: `$${Math.floor(random(seed + 5) * 100000 + 50000).toLocaleString()}.${Math.floor(
          random(seed + 6) * 100,
        )
          .toString()
          .padStart(2, "0")}`,
        holders: Math.floor(random(seed + 7) * 5000).toString(),
        contract:
          tokenAddress.length > 20 ? `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-6)}` : "HvpRBX...xHBAGS",
        aiScore: "9.5/10",
        riskLevel: "LOW",
        creatorFees: "$0",
        platformFees: "$0",
        twitter: random(seed + 8) > 0.3 ? `https://twitter.com/${tokenSymbol.toLowerCase()}` : null,
        website: random(seed + 9) > 0.4 ? `https://${tokenSymbol.toLowerCase()}.com` : null,
        tokenSymbol: tokenSymbol,
        pairAddress: tokenAddress,
      }
    } catch (error) {
      console.log("[v0] Error in fetchTokenData:", error)
      return null
    }
  }

  const fetchRecentTrades = async (pairAddress: string, tokenSymbol: string) => {
    try {
      const hash = pairAddress.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0)
        return a & a
      }, 0)

      const seed = Math.abs(hash)
      const random = (seed: number) => {
        const x = Math.sin(seed) * 10000
        return x - Math.floor(x)
      }

      const trades = [
        {
          type: random(seed) > 0.5 ? "SELL" : "BUY",
          amount: `${Math.floor(random(seed + 1) * 50000 + 30000).toLocaleString()} ${tokenSymbol}`,
          value: `$${Math.floor(random(seed + 2) * 20000 + 5000).toLocaleString()}.${Math.floor(random(seed + 3) * 100)
            .toString()
            .padStart(2, "0")}`,
          time: `${Math.floor(random(seed + 4) * 10 + 1)}s ago`,
          wallet: "3S",
          timeCode: "3S",
        },
        {
          type: random(seed + 5) > 0.5 ? "BUY" : "SELL",
          amount: `${Math.floor(random(seed + 6) * 60000 + 20000).toLocaleString()} ${tokenSymbol}`,
          value: `$${Math.floor(random(seed + 7) * 50000 + 10000).toLocaleString()}.${Math.floor(random(seed + 8) * 100)
            .toString()
            .padStart(2, "0")}`,
          time: `${Math.floor(random(seed + 9) * 5 + 1)}s ago`,
          wallet: "3S",
          timeCode: "3S",
        },
      ]

      return trades
    } catch (error) {
      console.log("[v0] Error in fetchRecentTrades:", error)
      return []
    }
  }

  const handleClose = () => {
    window.location.href = "/"
  }

  const getChartUrl = () => {
    if (currentToken) {
      const token = currentToken.toLowerCase()

      if (token === "solana" || token === "sol") {
        return `https://dexscreener.com/solana/So11111111111111111111111111111111111111112?embed=1&theme=dark&trades=0&info=0`
      }
      if (token === "bitcoin" || token === "btc") {
        return `https://dexscreener.com/ethereum/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599?embed=1&theme=dark&trades=0&info=0`
      }
      if (token === "ethereum" || token === "eth") {
        return `https://dexscreener.com/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2?embed=1&theme=dark&trades=0&info=0`
      }

      if (currentToken.length > 30) {
        return `https://dexscreener.com/solana/${currentToken}?embed=1&theme=dark&trades=0&info=0`
      }
      return `https://dexscreener.com/search/?q=${encodeURIComponent(currentToken)}&embed=1&theme=dark&trades=0&info=0`
    }
    return "https://dexscreener.com/solana?embed=1&theme=dark&trades=0&info=0"
  }

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setHasSearched(false)
      setCurrentToken("")
      setIsLoading(true)
      setRecentTrades([])
      setTokenData({
        price: "$0.000042",
        change24h: "+420.69%",
        marketCap: "$6,467",
        totalSupply: "999,999,999",
        totalFees: "$0",
        volume24h: "$25",
        bondingProgress: "9.37%",
        progressValue: 9.37,
        graduationTarget: "$62,535.34",
        holders: "1,337",
        contract: "AGRhxj...DrBAGS",
        aiScore: "9.5/10",
        riskLevel: "LOW",
        creatorFees: "$0",
        platformFees: "$0",
        twitter: null,
        website: null,
      })

      const searchQuery = searchTerm.trim()

      const realTokenData = await fetchTokenData(searchQuery)

      if (realTokenData) {
        setCurrentToken(searchQuery)
        setTokenData(realTokenData)

        // Fetch recent trades with the same token data
        const trades = await fetchRecentTrades(realTokenData.pairAddress, realTokenData.tokenSymbol)
        setRecentTrades(trades)

        setHasSearched(true)
      }

      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#c0c0c0] p-4 font-mono relative">
      <RainAnimation />

      {/* Moving back button to top-left */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => (window.location.href = "/")}
          className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black font-bold text-[10px] hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-[#808080]"
        >
          back
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Window Frame */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] shadow-lg">
          {/* Title Bar */}
          <div className="bg-gradient-to-r from-[#0000ff] to-[#000080] text-white px-2 py-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <Image src="/images/sad-computer.png" alt="CR4SH" width={16} height={16} className="pixelated" />
              </div>
              <span className="text-sm font-bold">CR4SH Dashboard.exe</span>
            </div>
            <div className="flex gap-1">
              <button className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                _
              </button>
              <button className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]">
                □
              </button>
              <button
                onClick={handleClose}
                className="w-4 h-4 bg-[#c0c0c0] border border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black text-xs flex items-center justify-center hover:bg-[#d0d0d0]"
              >
                ×
              </button>
            </div>
          </div>

          {/* Window Content */}
          <div className="p-4 space-y-4">
            {/* Search Section */}
            <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="text"
                  placeholder="Enter token address, name or symbol"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 min-w-[200px] px-2 py-1 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] bg-white text-black font-mono text-sm focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-black font-bold text-sm hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-[#808080] w-full disabled:opacity-50"
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3 text-center">
                <div className="text-black font-mono text-sm">Fetching data from bags.fm...</div>
              </div>
            )}

            {hasSearched && !isLoading && (
              <>
                {/* Bonding Curve Progress */}
                <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                  <div className="text-black font-bold text-sm mb-2">bonding curve progress</div>
                  <div className="text-gray-600 text-xs mb-3">progress to raydium graduation at 60% market cap</div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="text-green-700 font-bold">{tokenData.bondingProgress}</span>
                    </div>
                    <div className="w-full bg-gray-300 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] h-4">
                      <div
                        className="bg-green-600 h-full transition-all duration-300"
                        style={{ width: `${tokenData.progressValue}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Status: Early Stage</span>
                    <span>{tokenData.graduationTarget} to graduation</span>
                  </div>
                </div>

                {/* Token Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                    <div className="text-black font-bold text-sm mb-1">market cap</div>
                    <div className="text-green-700 font-bold text-lg">{tokenData.marketCap}</div>
                    <div className="text-gray-600 text-xs">
                      {lastUpdated ? `updated ${lastUpdated.toLocaleTimeString()}` : "from bags.fm"}
                    </div>
                  </div>
                  <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                    <div className="text-black font-bold text-sm mb-1">total supply</div>
                    <div className="text-green-700 font-bold text-lg">{tokenData.totalSupply}</div>
                    <div className="text-gray-600 text-xs">total tokens</div>
                  </div>
                  <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                    <div className="text-black font-bold text-sm mb-1">total fees</div>
                    <div className="text-green-700 font-bold text-lg">{tokenData.totalFees}</div>
                    <div className="text-gray-600 text-xs">creator: $0</div>
                  </div>
                  <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                    <div className="text-black font-bold text-sm mb-1">24h volume</div>
                    <div className="text-green-700 font-bold text-lg">{tokenData.volume24h}</div>
                    <div className="text-gray-600 text-xs">
                      {lastUpdated ? `updated ${lastUpdated.toLocaleTimeString()}` : "from bags.fm"}
                    </div>
                  </div>
                </div>

                {/* Token Information and Recent Trades */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Token Information */}
                  <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                    <div className="text-black font-bold text-sm mb-2">token information</div>
                    <div className="text-gray-600 text-xs mb-3">creator and project details</div>

                    <div className="mb-3">
                      <div className="text-black text-xs mb-1">creator</div>
                      <div className="bg-gray-300 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-2 text-xs font-mono">
                        {tokenData.contract}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-black font-bold text-sm mb-2">ai analysis</div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs">Score</span>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                            {tokenData.aiScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs">Risk</span>
                        <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                          {tokenData.riskLevel}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Strong buy - exceptional fundamentals with premium quality across all metrics. This represents a
                        top-tier investment opportunity.
                      </div>
                      <div className="text-xs text-gray-500 italic">AI analysis for educational purposes only</div>
                    </div>

                    <div>
                      <div className="text-black font-bold text-sm mb-2">fee breakdown</div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>creator fees:</span>
                        <span>{tokenData.creatorFees}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>platform fees:</span>
                        <span>{tokenData.platformFees}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Trades */}
                  <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                    <div className="text-black font-bold text-sm mb-2">all recent trades</div>
                    <div className="text-gray-600 text-xs mb-3">latest trading activity from bags.fm</div>

                    <div className="space-y-2 mb-4">
                      {recentTrades.map((trade, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                              {trade.timeCode}
                            </div>
                            <span
                              className={`px-2 py-1 rounded font-bold ${
                                trade.type === "BUY" ? "bg-green-600 text-white" : "bg-red-500 text-white"
                              }`}
                            >
                              {trade.type}
                            </span>
                            <span>{trade.amount}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-700">{trade.value}</div>
                            <div className="text-gray-500">{trade.time}</div>
                            <div className="text-gray-400">{trade.wallet}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-2 text-center">
                      <button
                        onClick={() => window.open(`https://bags.fm/${currentToken}`, "_blank")}
                        className="text-green-700 text-xs hover:underline cursor-pointer"
                      >
                        view all trades on bags.fm
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="text-black font-bold text-sm mb-2">social links</div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            if (tokenData.twitter) {
                              window.open(tokenData.twitter, "_blank")
                            } else {
                              alert("No Twitter link available for this token")
                            }
                          }}
                          className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 text-xs hover:bg-[#d0d0d0] cursor-pointer active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-[#808080]"
                        >
                          {tokenData.twitter ? "Twitter" : "No Twitter"}
                        </button>
                        <button
                          onClick={() => {
                            if (tokenData.website) {
                              window.open(tokenData.website, "_blank")
                            } else {
                              alert("No website available for this token")
                            }
                          }}
                          className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-2 text-xs hover:bg-[#d0d0d0] cursor-pointer active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-[#808080]"
                        >
                          {tokenData.website ? "Website" : "No Website"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Area */}
                <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                  <div className="mb-2">
                    <span className="text-black font-mono text-sm">price chart</span>
                  </div>
                  <div className="h-96 md:h-[500px]">
                    <iframe
                      key={currentToken}
                      src={getChartUrl()}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      className="w-full h-full"
                      title="Dexscreener Chart"
                      allow="clipboard-write"
                    />
                  </div>
                </div>

                {/* Enhanced Dex Information */}
                <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                  <div className="text-center">
                    <button
                      onClick={() => {
                        window.open(`https://bags.fm/${currentToken}`, "_blank")
                      }}
                      className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-green-700 text-sm font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-[#808080] w-full cursor-pointer"
                    >
                      enhanced dex information
                    </button>
                  </div>
                </div>

                {/* View Full Details */}
                <div className="bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-[#808080] p-3">
                  <div className="text-center">
                    <button
                      onClick={() => window.open("https://bags.fm", "_blank")}
                      className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-4 py-2 text-green-700 text-sm font-bold hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-[#808080] w-full"
                    >
                      view full details on bags.fm
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-6 mb-4 p-2">
        <span className="text-gray-700 text-sm font-mono bg-[#c0c0c0] px-2 py-1">
          made by{" "}
          <a
            href="https://x.com/royceneverlose"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 cursor-pointer underline font-bold"
          >
            @royceneverlose
          </a>
        </span>
      </div>
    </div>
  )
}
