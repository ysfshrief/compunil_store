'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { getProductById } from '@/lib/firestore';
import { formatEGP, productPlaceholder } from '@/lib/utils';
import StarRating from '@/components/ui/StarRating';
import type { Product } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { ids, toggle } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(ids.map(id => getProductById(id)));
        setProducts(results.filter(Boolean) as Product[]);
      } catch {
        // Fallback to mock data
        setProducts(MOCK_PRODUCTS.filter(p => ids.includes(p.id)));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ids]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const handleRemove = (product: Product) => {
    toggle(product.id);
    setProducts(prev => prev.filter(p => p.id !== product.id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
            <FiHeart className="w-6 h-6 text-red-500" />
            Wishlist
          </h1>
          <p className="text-gray-500 text-sm mt-1">{ids.length} saved item{ids.length !== 1 ? 's' : ''}</p>
        </div>
        {products.length > 0 && (
          <button
            onClick={() => {
              products.forEach(p => handleAddToCart(p));
              toast.success('All items added to cart!');
            }}
            className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-teal transition-colors"
          >
            <FiShoppingCart className="w-4 h-4" />
            Add All to Cart
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiHeart className="w-10 h-10 text-red-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
            Save products you love by clicking the heart icon while browsing
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-navy text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-teal transition-colors"
          >
            Browse Products <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {products.map((product, i) => {
              const price = product.price;
              const hasDiscount = product.originalPrice && product.originalPrice > product.price;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
                >
                  {/* Image */}
                  <Link href={`/product/${product.id}`} className="block relative h-48 overflow-hidden bg-gray-50">
                    <img
                      src={product.images?.[0] || productPlaceholder(product.name)}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).src = productPlaceholder(product.name); }}
                    />
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                      </div>
                    )}
                    <button
                      onClick={e => { e.preventDefault(); handleRemove(product); }}
                      className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                      title="Remove from wishlist"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </Link>

                  <div className="p-4">
                    <div className="text-xs text-gray-400 mb-1">{product.brand}</div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-brand-teal transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 mb-3">
                      <StarRating rating={product.rating || 0} size={12} />
                      <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-bold text-brand-navy">{formatEGP(price)}</div>
                        {hasDiscount && (
                          <div className="text-xs text-gray-400 line-through">{formatEGP(product.originalPrice!)}</div>
                        )}
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock === 0 ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-navy text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemove(product)}
                        className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Remove"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
