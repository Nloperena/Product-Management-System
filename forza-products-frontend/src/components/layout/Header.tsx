import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Home, Plus } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-forza-blue rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Forza Products</h1>
                <p className="text-xs text-gray-500">Product Management System</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-forza-blue text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link
              to="/product/new"
              className="flex items-center space-x-2 px-4 py-2 bg-forza-blue text-white rounded-lg hover:bg-forza-blue-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Product</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};