import { X, Loader2, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { erc20Abi } from 'viem'
import { arcTestnet } from 'viem/chains'
import { getUsdc, buildTxExplorerUrl } from '@/onchain-facts'
import { Amount, usdcDecimalsFor, parseAmount } from '@/onchain-money'
import type { MenuItem } from '../pages/Menu'

interface CheckoutModalProps {
  item: MenuItem | null
  onClose: () => void
}

const spectral = 'linear-gradient(90deg, #5fbeff 0%, #af8ff4 30%, #f05c6b 60%, #ffcd83 80%, #7ef1b3 100%)'

const CHAIN_ID = arcTestnet.id
const usdcFact = getUsdc(CHAIN_ID)!
const USDC_ADDRESS = usdcFact.address as `0x${string}`

const MERCHANT_ADDRESS = (import.meta.env.VITE_MERCHANT_ADDRESS ?? '') as `0x${string}`
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const isMerchantConfigured =
  MERCHANT_ADDRESS.length > 0 &&
  MERCHANT_ADDRESS.toLowerCase() !== ZERO_ADDRESS

function parseOnchainError(error: unknown): string {
  const msg = (error as { message?: string })?.message?.toLowerCase() ?? ''
  if (msg.includes('user rejected') || (error as { code?: number })?.code === 4001) return 'Bạn đã huỷ giao dịch.'
  if (msg.includes('insufficient funds') || msg.includes('exceeds balance')) return 'Số dư USDC không đủ.'
  if (msg.includes('reverted')) return 'Giao dịch thất bại. Vui lòng thử lại.'
  if (msg.includes('network') || msg.includes('timeout')) return 'Lỗi mạng. Vui lòng kiểm tra kết nối.'
  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}

function formatAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function CheckoutModal({ item, onClose }: CheckoutModalProps) {
  const { address, isConnected, chainId } = useAccount()
  const { switchChain, isPending: isSwitching } = useSwitchChain()
  const { writeContract, data: hash, isPending, error: writeError, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { data: balanceRaw } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address },
  })

  const isWrongChain = isConnected && chainId !== CHAIN_ID
  const decimals = usdcDecimalsFor(CHAIN_ID)
  const formattedBalance = balanceRaw !== undefined
    ? Amount.fromRaw(balanceRaw, decimals).toFixed(2)
    : null

  const txUrl = hash ? buildTxExplorerUrl(CHAIN_ID, hash) : null

  function handlePay() {
    if (!item || !isMerchantConfigured) return
    if (isWrongChain) { switchChain({ chainId: CHAIN_ID }); return }
    const parsed = parseAmount(CHAIN_ID, item.price.toFixed(2))
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [MERCHANT_ADDRESS, parsed.raw],
      chainId: CHAIN_ID,
    })
  }

  function handleClose() { reset(); onClose() }

  const isDisabled = !isConnected || isPending || isConfirming || isSuccess || !isMerchantConfigured

  const ctaContent = () => {
    if (!isConnected) return 'Kết nối ví để thanh toán'
    if (isWrongChain || isSwitching) return 'Chuyển sang Arc Testnet'
    if (isPending) return <InlineLoader text="Xác nhận trong ví..." />
    if (isConfirming) return <InlineLoader text="Đang xác nhận..." />
    return `Thanh toán $${item?.price.toFixed(2)} USDC`
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />

          {/* Sheet */}
          <motion.section
            className="relative w-full max-w-md overflow-hidden rounded-t-[28px]"
            style={{
              background: 'rgba(250,249,247,0.97)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              boxShadow: '0 -8px 48px rgba(18,45,69,0.12)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Spectral strip */}
            <div className="h-[3px]" style={{ background: spectral }} />

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full" style={{ background: 'rgba(18,45,69,0.12)' }} />
            </div>

            <div className="px-5 pb-8 pt-2">

              {/* ── Header ── */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="display text-lg font-700" style={{ color: 'var(--ink)' }}>
                  {isSuccess ? 'Đặt hàng thành công' : 'Xác nhận đơn hàng'}
                </h2>
                <button
                  onClick={handleClose}
                  className="flex size-8 items-center justify-center rounded-full transition-colors"
                  style={{ background: 'rgba(18,45,69,0.06)' }}
                >
                  <X className="size-4" style={{ color: 'var(--muted)' }} />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  /* ── Success receipt ── */
                  <motion.div
                    key="receipt"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                  >
                    {/* Green check */}
                    <div className="flex flex-col items-center py-4 mb-5">
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 18, stiffness: 280, delay: 0.05 }}
                        className="flex size-16 items-center justify-center rounded-full mb-3"
                        style={{ background: 'var(--green-soft)' }}
                      >
                        <CheckCircle2 className="size-8" style={{ color: 'var(--success)' }} />
                      </motion.div>
                      <p className="display font-700 text-2xl tabular-nums" style={{ color: 'var(--ink)' }}>
                        ${item.price.toFixed(2)} USDC
                      </p>
                      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>đã được thanh toán</p>
                    </div>

                    {/* Receipt rows */}
                    <div
                      className="rounded-2xl divide-y overflow-hidden mb-5"
                      style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.7)' }}
                    >
                      <ReceiptRow label="Món" value={item.name} />
                      <ReceiptRow label="Phí giao dịch" value="~$0.00 USDC" valueColor="var(--success)" />
                      {txUrl && (
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>Giao dịch</span>
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs font-medium"
                            style={{ color: 'var(--accent-hover)' }}
                          >
                            Xem trên Explorer <ExternalLink className="size-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    <p className="text-center text-xs mb-5" style={{ color: 'var(--muted)' }}>
                      Cà phê của bạn đang được pha. Cảm ơn!
                    </p>

                    <button
                      onClick={handleClose}
                      className="w-full rounded-2xl py-3.5 text-sm font-600 transition-all hover:opacity-90 active:scale-[0.99]"
                      style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                      Xong
                    </button>
                  </motion.div>

                ) : (
                  /* ── Order confirmation ── */
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    {/* Item card */}
                    <div
                      className="rounded-2xl p-4 flex items-center gap-3 mb-4"
                      style={{
                        background: 'rgba(255,255,255,0.72)',
                        border: '1px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 2px 12px rgba(18,45,69,0.06)',
                      }}
                    >
                      <div
                        className="flex size-11 items-center justify-center rounded-xl flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${item.colorFrom}22 0%, ${item.colorTo}33 100%)`,
                          border: `1px solid ${item.colorTo}25`,
                        }}
                      >
                        <ItemIconMini colorFrom={item.colorFrom} colorTo={item.colorTo} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="display font-600 text-sm" style={{ color: 'var(--ink)' }}>{item.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{item.description}</p>
                      </div>
                      <span className="display font-700 text-lg tabular-nums flex-shrink-0" style={{ color: 'var(--ink)' }}>
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Detail rows */}
                    <div
                      className="rounded-2xl divide-y overflow-hidden mb-4"
                      style={{ border: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}
                    >
                      {isConnected && formattedBalance !== null && (
                        <ReceiptRow label="Số dư ví" value={`${formattedBalance} USDC`} />
                      )}
                      <ReceiptRow label="Phí giao dịch" value="~$0.00 USDC" valueColor="var(--success)" />
                      {isMerchantConfigured && (
                        <ReceiptRow label="Gửi đến" value={formatAddr(MERCHANT_ADDRESS)} mono />
                      )}
                    </div>

                    {/* Merchant not configured warning */}
                    {!isMerchantConfigured && (
                      <div
                        className="rounded-xl p-3 mb-4 flex items-start gap-2"
                        style={{ background: 'rgba(186,43,76,0.07)', border: '1px solid rgba(186,43,76,0.15)' }}
                      >
                        <AlertCircle className="size-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                        <div>
                          <p className="text-xs font-600" style={{ color: 'var(--danger)' }}>Chưa cài đặt địa chỉ nhận tiền</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                            Mở <code className="mono">.env</code> và đặt{' '}
                            <code className="mono">VITE_MERCHANT_ADDRESS</code>, sau đó restart dev server.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {writeError && (
                      <p className="text-xs mb-4 px-1" style={{ color: 'var(--danger)' }}>
                        {parseOnchainError(writeError)}
                      </p>
                    )}

                    {/* CTA */}
                    <button
                      disabled={isDisabled}
                      onClick={handlePay}
                      className="w-full rounded-2xl py-3.5 text-sm font-600 text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ background: 'var(--accent)' }}
                    >
                      {ctaContent()}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ReceiptRow({ label, value, valueColor, mono }: { label: string; value: string; valueColor?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
      <span
        className={`text-xs font-600 tabular-nums ${mono ? 'mono' : ''}`}
        style={{ color: valueColor ?? 'var(--ink-2)' }}
      >
        {value}
      </span>
    </div>
  )
}

function InlineLoader({ text }: { text: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="size-4 animate-spin" />
      {text}
    </span>
  )
}

function ItemIconMini({ colorFrom, colorTo }: { colorFrom: string; colorTo: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="mini-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colorFrom} />
          <stop offset="100%" stopColor={colorTo} />
        </linearGradient>
      </defs>
      <path d="M17 8h1a4 4 0 0 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" stroke="url(#mini-g)" />
    </svg>
  )
}
