import { ShopItem } from './ShopItem';
import { SHOP_ITEMS } from '@/data/shopItems';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Shop = () => {
  const categories = {
    food: SHOP_ITEMS.filter(item => item.type === 'food'),
    water: SHOP_ITEMS.filter(item => item.type === 'water'),
    upgrades: SHOP_ITEMS.filter(item => item.type === 'upgrade'),
    housing: SHOP_ITEMS.filter(item => item.type === 'house'),
    rabbits: SHOP_ITEMS.filter(item => item.type === 'rabbit'),
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-earth text-white rounded-2xl p-6 shadow-soft">
        <h2 className="text-2xl font-bold mb-2">🛒 Shop</h2>
        <p className="text-white/90">Purchase resources and upgrades for your rabbit colony</p>
      </div>

      <Tabs defaultValue="food" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="food">🥕 Food</TabsTrigger>
          <TabsTrigger value="water">💧 Water</TabsTrigger>
          <TabsTrigger value="upgrades">⭐ Upgrades</TabsTrigger>
          <TabsTrigger value="housing">🏠 Housing</TabsTrigger>
          <TabsTrigger value="rabbits">🐰 Rabbits</TabsTrigger>
        </TabsList>

        {Object.entries(categories).map(([key, items]) => (
          <TabsContent key={key} value={key} className="space-y-3">
            {items.map(item => (
              <ShopItem
                key={item.id}
                item={item}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
