'use client'
// ============================================================
// COMPUNIL — Language Store + Translations (EN/AR complete)
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'en' | 'ar'

interface LangStore {
  lang:   Lang
  toggle: () => void
  setLang:(l: Lang) => void
  isRTL:  () => boolean
  t:      (key: string) => string
}

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home', 'nav.shop': 'Shop', 'nav.categories': 'Categories',
    'nav.deals': 'Deals', 'nav.cart': 'Cart', 'nav.account': 'Account',
    'nav.search': 'Search products…', 'nav.wishlist': 'Wishlist',
    'nav.allProducts': 'All Products', 'nav.admin': 'Admin',
    'nav.freeDelivery': 'Free delivery on orders over 500 EGP',
    'nav.freeDeliveryShort': 'Free delivery ',
    // Categories
    'cat.all': 'All Products', 'cat.laptops': 'Laptops', 'cat.components': 'PC Components',
    'cat.gaming': 'Gaming', 'cat.networking': 'Networking', 'cat.cctv': 'CCTV',
    'cat.services': 'Services', 'cat.hotDeals': 'Hot Deals',
    // Product
    'product.addToCart': 'Add to Cart', 'product.buyNow': 'Buy Now',
    'product.inStock': 'In Stock', 'product.outOfStock': 'Out of Stock',
    'product.lowStock': 'Only {n} left', 'product.reviews': 'Reviews',
    'product.specs': 'Specifications', 'product.description': 'Description',
    'product.related': 'Related Products', 'product.quantity': 'Quantity',
    'product.share': 'Share', 'product.category': 'Category',
    'product.brand': 'Brand', 'product.freeShipping': 'Free Shipping',
    'product.warranty': 'Official Warranty', 'product.authentic': 'Authentic Product',
    'product.addedToCart': 'added to cart!', 'product.reviewsCount': '{n} reviews',
    'product.writeReview': 'Write a Review', 'product.noReviews': 'No reviews yet',
    'product.helpful': 'found this helpful',
    // Cart
    'cart.title': 'Shopping Cart', 'cart.empty': 'Your cart is empty',
    'cart.emptyDesc': 'Start shopping to add items', 'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping', 'cart.total': 'Total', 'cart.free': 'Free',
    'cart.checkout': 'Proceed to Checkout', 'cart.continue': 'Continue Shopping',
    'cart.remove': 'Remove', 'cart.items': 'items', 'cart.item': 'item',
    'cart.clearCart': 'Clear Cart', 'cart.yourCart': 'Your Cart',
    // Checkout
    'checkout.title': 'Checkout', 'checkout.info': 'Your Info',
    'checkout.address': 'Address', 'checkout.confirm': 'Confirm',
    'checkout.personalInfo': 'Personal Information', 'checkout.fullName': 'Full Name',
    'checkout.email': 'Email Address', 'checkout.phone': 'Mobile Number',
    'checkout.deliveryAddress': 'Delivery Address', 'checkout.street': 'Street Address',
    'checkout.city': 'City', 'checkout.governorate': 'Governorate',
    'checkout.notes': 'Delivery Notes', 'checkout.continueAddress': 'Continue to Address',
    'checkout.reviewOrder': 'Review Order', 'checkout.back': 'Back',
    'checkout.placeOrder': 'Place Order', 'checkout.placing': 'Placing Order…',
    'checkout.payment': 'Cash on Delivery', 'checkout.paymentDesc': 'Pay when your order arrives',
    'checkout.orderSummary': 'Order Summary', 'checkout.selectGov': 'Select governorate…',
    'checkout.orderConfirmed': 'Order Confirmed!', 'checkout.thankYou': 'Thank you',
    'checkout.orderId': 'Order ID', 'checkout.trackOrder': 'Track My Order',
    'checkout.success': 'Order placed successfully! 🎉', 'checkout.loginRequired': 'Please sign in to checkout',
    // Auth
    'auth.login': 'Sign In', 'auth.register': 'Create Account', 'auth.logout': 'Sign Out',
    'auth.email': 'Email', 'auth.password': 'Password', 'auth.name': 'Full Name',
    'auth.welcomeBack': 'Welcome back', 'auth.signInDesc': 'Sign in to your Compunil account',
    'auth.continueGoogle': 'Continue with Google', 'auth.orEmail': 'or sign in with email',
    'auth.orRegisterEmail': 'or register with email', 'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?", 'auth.hasAccount': 'Already have an account?',
    'auth.createOne': 'Create one', 'auth.signInLink': 'Sign in',
    'auth.createAccount': 'Create your account', 'auth.joinDesc': 'Join Compunil for the best tech deals',
    'auth.confirmPassword': 'Confirm Password', 'auth.phone': 'Phone Number',
    'auth.resetPassword': 'Reset Password', 'auth.resetDesc': "Enter your email and we'll send you a link to reset your password.",
    'auth.sendReset': 'Send Reset Link', 'auth.backToLogin': 'Back to Login',
    'auth.checkEmail': 'Check your email', 'auth.welcome': 'Welcome!',
    'auth.signedOut': 'Signed out',
    // Account
    'account.myOrders': 'My Orders', 'account.ordersPlaced': 'orders placed',
    'account.totalOrders': 'Total Orders', 'account.totalSpent': 'Total Spent',
    'account.noOrders': 'No orders yet', 'account.startShopping': 'Start shopping to see your orders here',
    'account.shopNow': 'Shop Now', 'account.settings': 'Account Settings',
    'account.profile': 'Profile', 'account.changePassword': 'Change Password',
    'account.currentPassword': 'Current password', 'account.newPassword': 'New password (min 6 characters)',
    'account.confirmNew': 'Confirm new password', 'account.updatePassword': 'Update Password',
    'account.orderDate': 'Order Date', 'account.viewDetails': 'View Details',
    // Wishlist
    'wishlist.title': 'My Wishlist', 'wishlist.empty': 'Your wishlist is empty',
    'wishlist.emptyDesc': 'Save items you love to buy them later', 'wishlist.browse': 'Browse Products',
    'wishlist.saved': 'saved item', 'wishlist.savedPlural': 'saved items',
    // Shop
    'shop.title': 'Shop', 'shop.filters': 'Filters', 'shop.clearFilters': 'Clear Filters',
    'shop.categories': 'Categories', 'shop.priceRange': 'Price Range', 'shop.brands': 'Brands',
    'shop.minRating': 'Minimum Rating', 'shop.inStockOnly': 'In Stock Only',
    'shop.results': 'results', 'shop.result': 'result', 'shop.noResults': 'No products found',
    'shop.noResultsDesc': 'Try adjusting your filters', 'shop.sortNewest': 'Newest',
    'shop.sortPriceLow': 'Price: Low to High', 'shop.sortPriceHigh': 'Price: High to Low',
    'shop.sortRating': 'Top Rated', 'shop.sortPopular': 'Most Popular',
    'shop.showing': 'Showing', 'shop.products': 'Products',
    // Common
    'common.egp': 'EGP', 'common.loading': 'Loading…', 'common.error': 'Something went wrong',
    'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete',
    'common.edit': 'Edit', 'common.add': 'Add', 'common.viewAll': 'View All',
    'common.sortBy': 'Sort by', 'common.filter': 'Filter', 'common.price': 'Price',
    'common.brand': 'Brand', 'common.rating': 'Rating', 'common.close': 'Close',
    'common.apply': 'Apply', 'common.tryAgain': 'Try Again', 'common.goHome': 'Go Home',
    'common.search': 'Search', 'common.all': 'All',
    // Home
    'home.hero.title': "Egypt's #1 Tech Store",
    'home.hero.subtitle': 'Latest laptops, components & gaming gear at unbeatable prices',
    'home.hero.shopNow': 'Shop Now', 'home.hero.viewDeals': 'View Deals',
    'home.hero.upTo': 'Up to 30% Off',
    'slide.cctv.title': 'CCTV & Security Systems', 'slide.cctv.sub': 'Protect what matters — professional installation available',
    'slide.cctv.cta': 'View CCTV', 'slide.cctv.badge': 'Free Installation',
    'slide.gaming.title': 'Gaming Accessories', 'slide.gaming.sub': 'Level up your setup — keyboards, mice, headsets & more',
    'slide.gaming.cta': 'Shop Gaming', 'slide.gaming.badge': 'New Arrivals',
    'home.featured': 'Featured Products', 'home.bestsellers': 'Best Sellers',
    'home.deals': "Today's Deals", 'home.hotDeals': 'Hot Deals',
    'home.shopByCategory': 'Shop by Category', 'home.whyUs': 'Why Compunil?',
    'home.perk.delivery': 'Free Delivery', 'home.perk.deliverySub': 'On orders over 500 EGP',
    'home.perk.warranty': 'Official Warranty', 'home.perk.warrantySub': 'Guaranteed authentic products',
    'home.perk.support': 'Expert Support', 'home.perk.supportSub': 'Sat–Thu 9AM–8PM',
    'home.perk.returns': 'Easy Returns', 'home.perk.returnsSub': '14-day return policy',
    // 404
    'notFound.title': 'Page Not Found', 'notFound.desc': "The page you're looking for doesn't exist or has been moved.",
    'notFound.browse': 'Browse Products',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية', 'nav.shop': 'المتجر', 'nav.categories': 'الفئات',
    'nav.deals': 'العروض', 'nav.cart': 'السلة', 'nav.account': 'حسابي',
    'nav.search': 'ابحث عن منتجات…', 'nav.wishlist': 'المحفوظات',
    'nav.allProducts': 'جميع المنتجات', 'nav.admin': 'الإدارة',
    'nav.freeDelivery': 'شحن مجاني للطلبات فوق 500 ج.م',
    'nav.freeDeliveryShort': 'شحن مجاني ',
    // Categories
    'cat.all': 'جميع المنتجات', 'cat.laptops': 'لابتوبات', 'cat.components': 'مكونات الكمبيوتر',
    'cat.gaming': 'الألعاب', 'cat.networking': 'الشبكات', 'cat.cctv': 'كاميرات المراقبة',
    'cat.services': 'الخدمات', 'cat.hotDeals': 'عروض حصرية',
    // Product
    'product.addToCart': 'أضف للسلة', 'product.buyNow': 'اشتري الآن',
    'product.inStock': 'متوفر', 'product.outOfStock': 'غير متوفر',
    'product.lowStock': 'باقي {n} فقط', 'product.reviews': 'التقييمات',
    'product.specs': 'المواصفات', 'product.description': 'الوصف',
    'product.related': 'منتجات مشابهة', 'product.quantity': 'الكمية',
    'product.share': 'مشاركة', 'product.category': 'الفئة',
    'product.brand': 'الماركة', 'product.freeShipping': 'شحن مجاني',
    'product.warranty': 'ضمان رسمي', 'product.authentic': 'منتج أصلي',
    'product.addedToCart': 'أُضيف للسلة!', 'product.reviewsCount': '{n} تقييم',
    'product.writeReview': 'اكتب تقييماً', 'product.noReviews': 'لا توجد تقييمات بعد',
    'product.helpful': 'وجدوا هذا مفيداً',
    // Cart
    'cart.title': 'سلة التسوق', 'cart.empty': 'سلتك فارغة',
    'cart.emptyDesc': 'ابدأ التسوق لإضافة منتجات', 'cart.subtotal': 'المجموع',
    'cart.shipping': 'الشحن', 'cart.total': 'الإجمالي', 'cart.free': 'مجاني',
    'cart.checkout': 'إتمام الشراء', 'cart.continue': 'مواصلة التسوق',
    'cart.remove': 'إزالة', 'cart.items': 'منتجات', 'cart.item': 'منتج',
    'cart.clearCart': 'إفراغ السلة', 'cart.yourCart': 'سلتك',
    // Checkout
    'checkout.title': 'إتمام الشراء', 'checkout.info': 'بياناتك',
    'checkout.address': 'العنوان', 'checkout.confirm': 'التأكيد',
    'checkout.personalInfo': 'المعلومات الشخصية', 'checkout.fullName': 'الاسم الكامل',
    'checkout.email': 'البريد الإلكتروني', 'checkout.phone': 'رقم الموبايل',
    'checkout.deliveryAddress': 'عنوان التوصيل', 'checkout.street': 'عنوان الشارع',
    'checkout.city': 'المدينة', 'checkout.governorate': 'المحافظة',
    'checkout.notes': 'ملاحظات التوصيل', 'checkout.continueAddress': 'التالي: العنوان',
    'checkout.reviewOrder': 'مراجعة الطلب', 'checkout.back': 'رجوع',
    'checkout.placeOrder': 'تأكيد الطلب', 'checkout.placing': 'جاري التأكيد…',
    'checkout.payment': 'الدفع عند الاستلام', 'checkout.paymentDesc': 'ادفع عند وصول طلبك',
    'checkout.orderSummary': 'ملخص الطلب', 'checkout.selectGov': 'اختر المحافظة…',
    'checkout.orderConfirmed': 'تم تأكيد الطلب!', 'checkout.thankYou': 'شكراً لك',
    'checkout.orderId': 'رقم الطلب', 'checkout.trackOrder': 'تتبع طلبي',
    'checkout.success': 'تم تأكيد الطلب بنجاح! 🎉', 'checkout.loginRequired': 'سجّل الدخول لإتمام الشراء',
    // Auth
    'auth.login': 'تسجيل الدخول', 'auth.register': 'إنشاء حساب', 'auth.logout': 'تسجيل الخروج',
    'auth.email': 'البريد الإلكتروني', 'auth.password': 'كلمة المرور', 'auth.name': 'الاسم الكامل',
    'auth.welcomeBack': 'مرحباً بعودتك', 'auth.signInDesc': 'سجّل الدخول إلى حسابك في كومبيونيل',
    'auth.continueGoogle': 'المتابعة عبر جوجل', 'auth.orEmail': 'أو سجّل الدخول بالبريد',
    'auth.orRegisterEmail': 'أو أنشئ حساباً بالبريد', 'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.noAccount': 'ليس لديك حساب؟', 'auth.hasAccount': 'لديك حساب بالفعل؟',
    'auth.createOne': 'أنشئ حساباً', 'auth.signInLink': 'سجّل الدخول',
    'auth.createAccount': 'أنشئ حسابك', 'auth.joinDesc': 'انضم لكومبيونيل لأفضل عروض التكنولوجيا',
    'auth.confirmPassword': 'تأكيد كلمة المرور', 'auth.phone': 'رقم الهاتف',
    'auth.resetPassword': 'إعادة تعيين كلمة المرور', 'auth.resetDesc': 'أدخل بريدك وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.',
    'auth.sendReset': 'إرسال رابط الإعادة', 'auth.backToLogin': 'العودة لتسجيل الدخول',
    'auth.checkEmail': 'تحقق من بريدك', 'auth.welcome': 'أهلاً بك!',
    'auth.signedOut': 'تم تسجيل الخروج',
    // Account
    'account.myOrders': 'طلباتي', 'account.ordersPlaced': 'طلب',
    'account.totalOrders': 'إجمالي الطلبات', 'account.totalSpent': 'إجمالي المصروف',
    'account.noOrders': 'لا توجد طلبات بعد', 'account.startShopping': 'ابدأ التسوق لرؤية طلباتك هنا',
    'account.shopNow': 'تسوق الآن', 'account.settings': 'إعدادات الحساب',
    'account.profile': 'الملف الشخصي', 'account.changePassword': 'تغيير كلمة المرور',
    'account.currentPassword': 'كلمة المرور الحالية', 'account.newPassword': 'كلمة مرور جديدة (6 أحرف على الأقل)',
    'account.confirmNew': 'تأكيد كلمة المرور الجديدة', 'account.updatePassword': 'تحديث كلمة المرور',
    'account.orderDate': 'تاريخ الطلب', 'account.viewDetails': 'عرض التفاصيل',
    // Wishlist
    'wishlist.title': 'قائمة المفضّلة', 'wishlist.empty': 'قائمة مفضّلتك فارغة',
    'wishlist.emptyDesc': 'احفظ المنتجات التي تحبها لشرائها لاحقاً', 'wishlist.browse': 'تصفّح المنتجات',
    'wishlist.saved': 'منتج محفوظ', 'wishlist.savedPlural': 'منتجات محفوظة',
    // Shop
    'shop.title': 'المتجر', 'shop.filters': 'التصفية', 'shop.clearFilters': 'مسح التصفية',
    'shop.categories': 'الفئات', 'shop.priceRange': 'نطاق السعر', 'shop.brands': 'الماركات',
    'shop.minRating': 'أقل تقييم', 'shop.inStockOnly': 'المتوفر فقط',
    'shop.results': 'نتيجة', 'shop.result': 'نتيجة', 'shop.noResults': 'لا توجد منتجات',
    'shop.noResultsDesc': 'جرّب تعديل خيارات التصفية', 'shop.sortNewest': 'الأحدث',
    'shop.sortPriceLow': 'السعر: من الأقل', 'shop.sortPriceHigh': 'السعر: من الأعلى',
    'shop.sortRating': 'الأعلى تقييماً', 'shop.sortPopular': 'الأكثر رواجاً',
    'shop.showing': 'عرض', 'shop.products': 'منتجات',
    // Common
    'common.egp': 'ج.م', 'common.loading': 'جاري التحميل…', 'common.error': 'حدث خطأ ما',
    'common.save': 'حفظ', 'common.cancel': 'إلغاء', 'common.delete': 'حذف',
    'common.edit': 'تعديل', 'common.add': 'إضافة', 'common.viewAll': 'عرض الكل',
    'common.sortBy': 'ترتيب حسب', 'common.filter': 'تصفية', 'common.price': 'السعر',
    'common.brand': 'الماركة', 'common.rating': 'التقييم', 'common.close': 'إغلاق',
    'common.apply': 'تطبيق', 'common.tryAgain': 'حاول مجدداً', 'common.goHome': 'الرئيسية',
    'common.search': 'بحث', 'common.all': 'الكل',
    // Home
    'home.hero.title': 'متجر التكنولوجيا الأول في مصر',
    'home.hero.subtitle': 'أحدث اللابتوبات والمكونات ومعدات الألعاب بأفضل الأسعار',
    'home.hero.shopNow': 'تسوق الآن', 'home.hero.viewDeals': 'عروض الأسعار',
    'home.hero.upTo': 'خصم حتى 30%',
    'slide.cctv.title': 'أنظمة المراقبة والأمان', 'slide.cctv.sub': 'احمِ ما يهمك — التركيب الاحترافي متاح',
    'slide.cctv.cta': 'تصفّح الكاميرات', 'slide.cctv.badge': 'تركيب مجاني',
    'slide.gaming.title': 'إكسسوارات الألعاب', 'slide.gaming.sub': 'طوّر إعدادك — كيبورد، ماوس، سماعات والمزيد',
    'slide.gaming.cta': 'تسوق الألعاب', 'slide.gaming.badge': 'وصل حديثاً',
    'home.featured': 'منتجات مميزة', 'home.bestsellers': 'الأكثر مبيعاً',
    'home.deals': 'عروض اليوم', 'home.hotDeals': 'عروض حصرية',
    'home.shopByCategory': 'تسوق حسب الفئة', 'home.whyUs': 'لماذا كومبيونيل؟',
    'home.perk.delivery': 'شحن مجاني', 'home.perk.deliverySub': 'للطلبات فوق 500 ج.م',
    'home.perk.warranty': 'ضمان رسمي', 'home.perk.warrantySub': 'منتجات أصلية مضمونة',
    'home.perk.support': 'دعم متخصص', 'home.perk.supportSub': 'السبت–الخميس 9ص–8م',
    'home.perk.returns': 'إرجاع سهل', 'home.perk.returnsSub': 'سياسة إرجاع 14 يوم',
    // 404
    'notFound.title': 'الصفحة غير موجودة', 'notFound.desc': 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
    'notFound.browse': 'تصفّح المنتجات',
  },
}

export const useLangStore = create<LangStore>()(
  persist(
    (set, get) => ({
      lang: 'ar',
      toggle:  () => set(s => ({ lang: s.lang === 'en' ? 'ar' : 'en' })),
      setLang: l => set({ lang: l }),
      isRTL:   () => get().lang === 'ar',
      t: key => translations[get().lang][key] ?? key,
    }),
    { name: 'compunil-lang' },
  ),
)
