'use client';

import { useRouter } from 'next/navigation';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Button, Card, Badge } from '../../design-system';

interface Restaurant {
  id: number;
  name: string;
  phoneNumber?: string;
  description?: string;
}

interface Box {
  id: number;
  title: string;
  price: number | string;
  quantity: number;
  image?: string;
  isAvailable: boolean;
  restaurant: Restaurant;
}

interface BoxCardProps {
  box: Box;
  onToggleFavorite: (boxId: number) => void;
  onAddToWishlist: (box: Box) => void;
  isFavorite: (boxId: number) => boolean;
  isInWishlist: (boxId: number) => boolean;
  showRestaurantInfo?: boolean;
}

export function BoxCard({
  box,
  onToggleFavorite,
  onAddToWishlist,
  isFavorite,
  isInWishlist,
  showRestaurantInfo = true
}: BoxCardProps) {
  const router = useRouter();

  const handleRestaurantClick = () => {
    router.push(`/restaurants/${box.restaurant.id}`);
  };

  return (
    <Card
      variant="default"
      radius="lg"
      className="overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {box.image ? (
          <img
            src={box.image}
            alt={box.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Replace broken image with placeholder
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOWNhM2FmIj7wn42YPC90ZXh0Pjwvc3ZnPg==';
              target.style.objectFit = 'contain';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🥘</span>
          </div>
        )}
        
        {/* Favorites Button */}
        <button
          onClick={() => onToggleFavorite(box.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all"
          aria-label={isFavorite(box.id) ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite(box.id) ? (
            <HeartSolidIcon className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Availability Badge */}
        {!box.isAvailable && (
          <div className="absolute top-3 left-3">
            <Badge variant="danger" size="sm">
              Sold Out
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Restaurant Info */}
        {showRestaurantInfo && (
          <button 
            onClick={handleRestaurantClick}
            className="flex items-center space-x-2 mb-2 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors group"
          >
            <div className="h-6 w-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {box.restaurant.name.charAt(0)}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
              {box.restaurant.name}
            </span>
          </button>
        )}

        {/* Box Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {box.title}
        </h3>

        {/* Price and Quantity */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-orange-600">
            ${Number(box.price).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">
            {box.quantity > 0 ? `${box.quantity} left` : 'Out of stock'}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() => onAddToWishlist(box)}
          disabled={!box.isAvailable}
          variant={box.isAvailable ? "primary" : "secondary"}
          size="md"
          className={box.isAvailable ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 w-full" : "w-full"}
        >
          {box.isAvailable ? (isInWishlist(box.id) ? 'Remove from Cart' : 'Add to Cart') : 'Sold Out'}
        </Button>
      </div>
    </Card>
  );
}