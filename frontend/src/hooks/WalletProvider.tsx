import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface WalletContextType {
  address: string | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  loading: boolean
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connected: false,
  connect: async () => {},
  disconnect: () => {},
  loading: false,
})

export function useWallet() {
  return useContext(WalletContext)
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const connect = useCallback(async () => {
    setLoading(true)
    try {
      const freighter = await import('@stellar/freighter-api')
      const addr = await freighter.getAddress()
      setAddress(addr)
      setConnected(true)
    } catch (err) {
      console.error('Wallet connection failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setAddress(null)
    setConnected(false)
  }, [])

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const freighter = await import('@stellar/freighter-api')
        const connected = await freighter.isConnected()
        if (connected) {
          const addr = await freighter.getAddress()
          setAddress(addr)
          setConnected(true)
        }
      } catch {}
    }
    checkConnection()
  }, [])

  return (
    <WalletContext.Provider value={{ address, connected, connect, disconnect, loading }}>
      {children}
    </WalletContext.Provider>
  )
}
