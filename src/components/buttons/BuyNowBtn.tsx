'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { CartItem } from '@/types'
import useCartStore from '@/store/cartStore'
import { useRouter } from 'next/navigation'

const BuyNowBtn = ({ product }: { product: CartItem }) => {
  const { addToCart } = useCartStore()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBuyNow = () => {
    setIsLoading(true)
    addToCart(product)
    router.push('/checkout')
    // We don't set loading back to false because we are navigating away. 
    // If navigation fails or is cancelled, it might stick, but for simple push it's fine.
  }

  return (
    <Button
      onClick={handleBuyNow}
      disabled={isLoading}
      className='bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 hover:ring-2 hover:ring-yellow-400 duration-300 text-black text-xl p-8 rounded-full w-full flex items-center gap-4'
    >
      {isLoading ? (
        <Loader2 className='animate-spin' size={30} />
      ) : (
        <ArrowRight size={30} className='animate-pulse' />
      )}
      {isLoading ? "Veuillez patienter..." : "Acheter maintenant"}
    </Button>
  )
}

export default BuyNowBtn