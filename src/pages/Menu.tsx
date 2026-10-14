import { useState } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { arcTestnet } from 'viem/chains'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuCard } from '../components/MenuCard'
import { CheckoutModal } from '../components/CheckoutModal'
import { getUsdc } from '@/onchain-facts'
import { Amount, usdcDecimalsFor } from '@/onchain-money'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: 'hot' | 'cold' | 'special'
  colorFrom: string
  colorTo: string
  icon: string
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'espresso',    name: 'Espresso',    description: 'Đậm đặc, nguyên chất',         price: 1.50, category: 'hot',     colorFrom: '#3d1f0d', colorTo: '#7c4a1e', icon: 'espresso'    },
  { id: 'latte',       name: 'Latte',       description: 'Espresso + sữa tươi mịn',       price: 2.50, category: 'hot',     colorFrom: '#9b6a3e', colorTo: '#c8956c', icon: 'latte'       },
  { id: 'cappuccino',  name: 'Cappuccino',  description: 'Espresso + bọt sữa mịn',        price: 2.50, category: 'hot',     colorFrom: '#6b3a1f', colorTo: '#a86540', icon: 'cappuccino'  },
  { id: 'americano',   name: 'Americano',   description: 'Espresso + nước nóng',          price: 2.00, category: 'hot',     colorFrom: '#2c1810', colorTo: '#5c3420', icon: 'americano'   },
  { id: 'cold-brew',   name: 'Cold Brew',   description: 'Ngâm lạnh 12 tiếng',           price: 3.50, category: 'cold',    colorFrom: '#1a2a4a', colorTo: '#2d4a7a', icon: 'cold-brew'   },
  { id: 'iced-latte',  name: 'Iced Latte',  description: 'Latte trên đá',                 price: 3.00, category: 'cold',    colorFrom: '#7a5235', colorTo: '#b07a50', icon: 'iced-latte'  },
  { id: 'matcha',      name: 'Matcha Latte','description': 'Matcha Nhật + sữa tươi',       price: 3.00, category: 'special', colorFrom: '#1e4d2b', colorTo: '#3d8a50', icon: 'matcha'      },
  { id: 'pour-over',   name: 'Pour Over',   description: 'Pha thủ công từng giọt',        price: 4.00, category: 'special', colorFrom: '#3b2a1a', colorTo: '#6b4a2a', icon: 'pour-over'   },
]

const CATEGORIES = [
  { id: 'all',     label: 'Tất cả' },
  { id: 'hot',     label: 'Nóng' },
  { id: 'cold',    label: 'Lạnh' },
  { id: 'special', label: 'Đặc biệt' },
] as const

const CHAIN_ID = arcTestnet.id
const usdcFact = getUsdc(CHAIN_ID)!
const USDC_ADDRESS = usdcFact.address as `0x${string}`

export function Menu() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<'all' | 'hot' | 'cold' | 'special'>('all')
  const { address, isConnected } = useAccount()

  const { data: balanceRaw } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address },
  })

  const decimals = usdcDecimalsFor(CHAIN_ID)
  const formattedBalance = balanceRaw !== undefined
    ? Amount.fromRaw(balanceRaw, decimals).toFixed(2)
    : null

  const filtered = activeCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(i => i.category === activeCategory)

  return (
    <div className="relative min-h-dvh overflow-hidden" style={{ background: 'var(--bg-gradient)' }}>

      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{ position:'absolute', top:'-5%', left:'-10%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(196,125,62,0.15) 0%, transparent 65%)', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', top:'30%', right:'-8%', width:340, height:340, borderRadius:'50%', background:'radial-gradient(circle, rgba(133,177,237,0.18) 0%, transparent 65%)', filter:'blur(70px)' }} />
        <div style={{ position:'absolute', bottom:'0', left:'20%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(61,138,80,0.12) 0%, transparent 65%)', filter:'blur(70px)' }} />
      </div>

      {/* ── Hero header ── */}
      <div className="relative z-10">
        <div
          className="px-5 pt-5 pb-6"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {/* Logo mark */}
              <div
                className="flex size-10 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #2c1810 0%, #7c4a1e 100%)',
                  boxShadow: '0 4px 12px rgba(44,24,16,0.3)',
                }}
              >
                <CafeIconSVG />
              </div>
              <div>
                <h1 className="display text-xl font-700 leading-none" style={{ color: 'var(--ink)' }}>
                  Arc Café
                </h1>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  Onchain · Arc Testnet
                </p>
              </div>
            </div>
            <ConnectKitButton />
          </div>

          {/* Balance hero */}
          <AnimatePresence>
            {isConnected && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              >
                <div
                  className="rounded-2xl px-4 py-3 flex items-center justify-between"
                  style={{
                    background: 'rgba(18,45,69,0.06)',
                    border: '1px solid rgba(18,45,69,0.08)',
                  }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Số dư ví</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="display text-2xl font-700 tabular-nums" style={{ color: 'var(--ink)' }}>
                        {formattedBalance ?? '—'}
                      </span>
                      <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>USDC</span>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                    style={{ background: 'var(--green-soft)', border: '1px solid rgba(26,128,71,0.15)' }}
                  >
                    <span className="size-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>Sẵn sàng</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Category tabs ── */}
        <div
          className="px-5 py-3 flex gap-2 overflow-x-auto"
          style={{ background: 'rgba(255,255,255,0.35)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
              style={
                activeCategory === cat.id
                  ? {
                      background: 'var(--accent)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(18,45,69,0.25)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.6)',
                      color: 'var(--ink-2)',
                      border: '1px solid rgba(18,45,69,0.09)',
                    }
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Menu grid ── */}
      <div className="relative z-10 px-4 pt-4 pb-24 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="grid grid-cols-2 gap-3"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 22, stiffness: 260 }}
              >
                <MenuCard item={item} onOrder={setSelectedItem} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Footer note */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 rounded-2xl p-4 text-center"
            style={{
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(18,45,69,0.08)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Kết nối ví MetaMask để thanh toán bằng USDC trên Arc Testnet.
              <br />
              Phí giao dịch gần như bằng 0.
            </p>
          </motion.div>
        )}
      </div>

      <CheckoutModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}

function CafeIconSVG() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  )
}
