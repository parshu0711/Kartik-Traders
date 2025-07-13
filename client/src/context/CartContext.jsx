import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          // Validate cart data structure
          if (Array.isArray(parsedCart)) {
            const validCart = parsedCart.filter(item => 
              item && 
              item.product && 
              item.product._id && 
              item.quantity > 0 &&
              typeof item.price === 'number'
            )
            setCart(validCart)
            console.log('Cart loaded from localStorage:', validCart.length, 'items')
          } else {
            console.warn('Invalid cart data in localStorage, clearing...')
            localStorage.removeItem('cart')
            setCart([])
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('cart')
        setCart([])
      } finally {
        setIsInitialized(true)
      }
    }

    loadCart()
  }, [])

  // Save cart to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      try {
    localStorage.setItem('cart', JSON.stringify(cart))
        console.log('Cart saved to localStorage:', cart.length, 'items')
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [cart, isInitialized])

  const addToCart = (product, quantity = 1, size = null, color = null) => {
    if (!product || !product._id) {
      console.error('Invalid product data:', product)
      toast.error('Invalid product data')
      return
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => 
          item.product._id === product._id && 
          item.size === size && 
          item.color === color
      )

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex].quantity += quantity
        toast.success(`Updated ${product.name} in cart`)
        return updatedCart
      } else {
        // Add new item
        const newItem = {
          product,
          quantity,
          size,
          color,
          price: product.discount > 0 
            ? product.price - (product.price * product.discount / 100)
            : product.price
        }
        toast.success(`Added ${product.name} to cart`)
        return [...prevCart, newItem]
      }
    })
  }

  const removeFromCart = (index) => {
    setCart(prevCart => {
      if (index < 0 || index >= prevCart.length) {
        console.error('Invalid cart index:', index)
        return prevCart
      }
      
      const item = prevCart[index]
      const updatedCart = prevCart.filter((_, i) => i !== index)
      toast.success(`Removed ${item.product.name} from cart`)
      return updatedCart
    })
  }

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index)
      return
    }

    setCart(prevCart => {
      if (index < 0 || index >= prevCart.length) {
        console.error('Invalid cart index:', index)
        return prevCart
      }

      const updatedCart = [...prevCart]
      updatedCart[index].quantity = quantity
      return updatedCart
    })
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('cart')
    toast.success('Cart cleared')
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity)
    }, 0)
  }

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const getCartItems = () => {
    return cart.map((item, index) => ({
      ...item,
      index
    }))
  }

  const isInCart = (productId, size = null, color = null) => {
    return cart.some(
      item => 
        item.product._id === productId && 
        item.size === size && 
        item.color === color
    )
  }

  // Function to sync cart with server (for logged-in users)
  const syncCartWithServer = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setLoading(true)
      // You can implement server-side cart sync here if needed
      // For now, we'll just log that we could sync
      console.log('Cart could be synced with server for logged-in user')
    } catch (error) {
      console.error('Error syncing cart with server:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debug function to help troubleshoot cart issues
  const debugCart = () => {
    console.log('=== Cart Debug Info ===')
    console.log('Cart state:', cart)
    console.log('Cart length:', cart.length)
    console.log('Is initialized:', isInitialized)
    console.log('localStorage cart:', localStorage.getItem('cart'))
    console.log('Cart total:', getCartTotal())
    console.log('Cart count:', getCartCount())
    console.log('=======================')
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItems,
    isInCart,
    loading,
    setLoading,
    isInitialized,
    syncCartWithServer,
    debugCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
} 