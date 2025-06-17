import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, User, LogOut, Globe, ChevronDown, Clock, FileText, Package, Users, Activity } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

interface NotificationItem {
  id: number;
  type: 'user' | 'post' | 'product' | 'banner' | 'system';
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarCollapsed = false }) => {
  const { user, signOut } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' }
  ];

  // Mock recent activity data
  const recentNotifications: NotificationItem[] = [
    {
      id: 1,
      type: 'user',
      action: 'New user registered',
      user: 'Sarah Wilson',
      timestamp: '2 minutes ago',
      details: 'sarah.wilson@company.com'
    },
    {
      id: 2,
      type: 'product',
      action: 'Product updated',
      user: 'Mike Johnson',
      timestamp: '15 minutes ago',
      details: 'Premium Wireless Headphones - Stock updated'
    },
    {
      id: 3,
      type: 'post',
      action: 'News post published',
      user: 'Emma Davis',
      timestamp: '1 hour ago',
      details: 'Company Quarterly Results'
    },
    {
      id: 4,
      type: 'banner',
      action: 'Banner activated',
      user: 'John Smith',
      timestamp: '2 hours ago',
      details: 'Summer Sale Campaign'
    },
    {
      id: 5,
      type: 'system',
      action: 'System backup completed',
      user: 'System',
      timestamp: '3 hours ago',
      details: 'Daily backup successful'
    },
    {
      id: 6,
      type: 'user',
      action: 'User account suspended',
      user: 'Admin',
      timestamp: '4 hours ago',
      details: 'alex.chen@company.com'
    },
    {
      id: 7,
      type: 'product',
      action: 'Low stock alert',
      user: 'System',
      timestamp: '5 hours ago',
      details: 'Smart Fitness Watch - Only 2 items left'
    },
    {
      id: 8,
      type: 'post',
      action: 'Event scheduled',
      user: 'Marketing Team',
      timestamp: '6 hours ago',
      details: 'Annual Conference 2024'
    }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setIsDropdownOpen(false);
    console.log('Language changed to:', languageCode);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'banner':
        return <Activity className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-600';
      case 'post':
        return 'bg-green-100 text-green-600';
      case 'product':
        return 'bg-purple-100 text-purple-600';
      case 'banner':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative z-10">
      <div className="flex items-center justify-between h-20 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all group"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      {recentNotifications.length} new
                    </span>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.action}
                            </p>
                            <div className="flex items-center text-xs text-gray-500 ml-2">
                              <Clock className="w-3 h-3 mr-1" />
                              {notification.timestamp}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            by {notification.user}
                          </p>
                          {notification.details && (
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {notification.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <button className="w-full text-sm text-gray-900 hover:text-black font-medium text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors p-2"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-black rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="px-2 py-2">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </div>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedLanguage === language.code
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Globe className="w-4 h-4 mr-3" />
                      <span className="mr-2">{language.flag}</span>
                      <span className="flex-1 text-left">{language.name}</span>
                      {selectedLanguage === language.code && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-2"></div>

                {/* Logout */}
                <div className="px-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                  >
                    <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;