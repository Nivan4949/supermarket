import { Link } from 'react-router-dom';
import { ShoppingCart, Globe, Menu, Search, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { cartCount } = useCart();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">Sanabel</span>
            <span className="text-sm font-medium text-gray-500 hidden sm:block">
              {language === 'en' ? 'Mini Mart' : 'ميني ماركت'}
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('search')}
                className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-5 h-5`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin/User Link */}
            <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors">
              <User className="w-6 h-6" />
            </Link>

            {/* Mobile Menu */}
            <button className="md:hidden text-gray-600 dark:text-gray-300">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
