import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchBar } from "@/components/ui/search-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useProducts, useInstitutions, useLocations } from "@/lib/api-hooks";
import { useAuth } from "@/lib/auth";
import { Loader2, MapPin, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Marketplace() {
  const [routeLocation] = useLocation();
  const { user } = useAuth();
  
  const queryParams = new URLSearchParams(window.location.search);
  const initialCategory = queryParams.get("category") || "All";
  const initialSearch = queryParams.get("q") || "";

  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  
  const categories = ["All", "Textbooks", "Electronics", "Furniture", "Clothing", "Other"];
  const allConditions = ["New", "Like New", "Good", "Fair"];

  const { data: locations = [] } = useLocations();

  const { data: institutions = [] } = useInstitutions(selectedLocationId || undefined);

  const { data: products = [], isLoading, error } = useProducts({
    search: initialSearch,
    category: category !== "All" ? category : undefined,
    locationId: selectedLocationId || undefined,
    institutionId: selectedInstitutionId || undefined,
  });

  const uniqueCities = useMemo(() => {
    const cityMap = new Map<string, typeof locations[number]>();
    locations.forEach(loc => {
      const key = `${loc.city}-${loc.state}-${loc.country}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, loc);
      }
    });
    return Array.from(cityMap.values());
  }, [locations]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const price = parseFloat(p.price);
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesCondition = conditions.length === 0 || conditions.includes(p.condition);
      
      return matchesPrice && matchesCondition;
    });
  }, [products, priceRange, conditions]);

  const toggleCondition = (cond: string) => {
    setConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  if (error) {
    return (
      <div className="container px-4 py-16 text-center">
        <p className="text-lg text-destructive">Failed to load products. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div>
            <h3 className="font-heading font-semibold mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => setCategory(cat)}
                  data-testid={`button-category-${cat.toLowerCase()}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-heading font-semibold mb-4">Price Range</h3>
            <Slider
              defaultValue={[0, 500]}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={setPriceRange}
              className="mb-4"
              data-testid="slider-price-range"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="text-price-min">${priceRange[0]}</span>
              <span data-testid="text-price-max">${priceRange[1]}+</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-heading font-semibold mb-4">Condition</h3>
            <div className="space-y-3">
              {allConditions.map((cond) => (
                <div key={cond} className="flex items-center space-x-2">
                  <Checkbox 
                    id={cond} 
                    checked={conditions.includes(cond)}
                    onCheckedChange={() => toggleCondition(cond)}
                    data-testid={`checkbox-condition-${cond.toLowerCase().replace(/\s/g, '-')}`}
                  />
                  <Label htmlFor={cond} className="text-sm font-normal cursor-pointer">
                    {cond}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </h3>
            <Select
              value={selectedLocationId}
              onValueChange={(value) => {
                setSelectedLocationId(value === "all" ? "" : value);
                setSelectedInstitutionId("");
              }}
            >
              <SelectTrigger data-testid="select-location-filter">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {uniqueCities.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.city}, {loc.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Institution
            </h3>
            <Select
              value={selectedInstitutionId}
              onValueChange={(value) => setSelectedInstitutionId(value === "all" ? "" : value)}
            >
              <SelectTrigger data-testid="select-institution-filter">
                <SelectValue placeholder="All institutions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All institutions</SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 space-y-4">
            <h1 className="text-3xl font-heading font-bold">
              {category === "All" ? "All Listings" : category}
            </h1>
            <SearchBar initialValue={initialSearch} className="max-w-xl" />
            <p className="text-muted-foreground" data-testid="text-results-count">
              Showing {filteredProducts.length} results
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </motion.div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.p 
                className="text-lg font-medium mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                No items found
              </motion.p>
              <motion.p 
                className="text-muted-foreground mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Try adjusting your filters or search terms.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCategory("All");
                    setConditions([]);
                    setPriceRange([0, 500]);
                    setSelectedLocationId("");
                    setSelectedInstitutionId("");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
