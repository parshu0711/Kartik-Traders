import { Link } from 'react-router-dom'
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-xl font-bold">Kartik Traders</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your one-stop destination for premium clothing, jeans, shirts, and fashion accessories. 
              Quality fashion for every occasion.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaFacebook className="text-xl" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-300 hover:text-white transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/shop?category=jeans" className="text-gray-300 hover:text-white transition-colors">
                  Jeans
                </Link>
              </li>
              <li>
                <Link to="/shop?category=shirts" className="text-gray-300 hover:text-white transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=t-shirts" className="text-gray-300 hover:text-white transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=jackets" className="text-gray-300 hover:text-white transition-colors">
                  Jackets
                </Link>
              </li>
              <li>
                <Link to="/shop?category=accessories" className="text-gray-300 hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-primary-400" />
                <span className="text-gray-300 text-sm">
                  Building No./Flat No.: C-145, S 1<br />
                    Road/Street: Unnamed Road<br />
                    Nearby Landmark: Misri Lal Kabuli<br />
                    City/Town/Village: Jodhpur<br />
                    District: Jodhpur<br />
                    State: Rajasthan<br />
                    PIN Code: 342014<br />
                    Name Of Premises/Building: Vaishali Township/ SHIV GAURI APARTMENT.
                </span>
              </div>
{/*               <div className="flex items-center space-x-3">
                <FaPhone className="text-primary-400" />
                <a href="tel:+919876543210" className="text-gray-300 text-sm hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </div> */}
              <div className="flex items-center space-x-3">
                <FaEnvelope className="text-primary-400" />
                <a href="mailto:bharatkarwani70@gmail.com" className="text-gray-300 text-sm hover:text-white transition-colors">
                  bharatkarwani70@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Kartik Traders. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="/shipping" className="text-gray-400 hover:text-white text-sm transition-colors">
                Shipping Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 
