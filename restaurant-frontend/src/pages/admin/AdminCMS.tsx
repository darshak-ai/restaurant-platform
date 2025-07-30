import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Image,
  FileText,
  Megaphone
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useStore } from '../../store/useStore';
import { cmsApi } from '../../services/api';
import { CMSContent } from '../../types';

interface ExtendedCMSContent extends CMSContent {
  type: string;
  is_published?: boolean;
}

export function AdminCMS() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [content, setContent] = useState<ExtendedCMSContent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    loadContent();
  }, [user, navigate]);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const [pages, gallery, banners, announcements] = await Promise.all([
        cmsApi.getPublishedPages().catch(() => []),
        cmsApi.getGalleryImages().catch(() => []),
        cmsApi.getHeroBanners().catch(() => []),
        cmsApi.getAnnouncements().catch(() => [])
      ]);
      
      const allContent = [
        ...pages.map(item => ({ ...item, type: 'page' })),
        ...gallery.map(item => ({ ...item, type: 'gallery' })),
        ...banners.map(item => ({ ...item, type: 'banner' })),
        ...announcements.map(item => ({ ...item, type: 'announcement' }))
      ];
      
      setContent(allContent);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return <FileText className="h-5 w-5" />;
      case 'gallery':
        return <Image className="h-5 w-5" />;
      case 'banner':
        return <Image className="h-5 w-5" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page':
        return 'bg-blue-100 text-blue-800';
      case 'gallery':
        return 'bg-green-100 text-green-800';
      case 'banner':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                <p className="text-sm text-gray-600">Manage website content, gallery, and announcements</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                View Restaurant
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Actions */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="page">Pages</option>
              <option value="gallery">Gallery</option>
              <option value="banner">Banners</option>
              <option value="announcement">Announcements</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Content</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(item => item.type === 'page').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Image className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Gallery Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(item => item.type === 'gallery').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Image className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Banners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(item => item.type === 'banner').length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Megaphone className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Announcements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {content.filter(item => item.type === 'announcement').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading content...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No content found</p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        {item.content ? item.content.substring(0, 100) + '...' : 'No content'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        {item.slug && (
                          <span className="text-xs text-gray-500">/{item.slug}</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {item.is_published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
