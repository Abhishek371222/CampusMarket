import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

const FilterBar = ({ onApplyFilters }) => {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    condition: "any",
    location: "all",
  });

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      condition: "any",
      location: "all",
    });
    onApplyFilters({
      minPrice: "",
      maxPrice: "",
      condition: "any",
      location: "all",
    });
  };

  return (
    <motion.div 
      className="bg-white p-4 rounded-lg shadow-sm mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              className="w-full rounded-md border-gray-300 focus:border-[#6B46C1] focus:ring focus:ring-[#6B46C1]/20 py-2"
              value={filters.minPrice}
              onChange={(e) => handleChange("minPrice", e.target.value)}
              min={0}
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              className="w-full rounded-md border-gray-300 focus:border-[#6B46C1] focus:ring focus:ring-[#6B46C1]/20 py-2"
              value={filters.maxPrice}
              onChange={(e) => handleChange("maxPrice", e.target.value)}
              min={0}
            />
          </div>
        </div>

        <div className="md:w-1/5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
          <Select
            value={filters.condition}
            onValueChange={(value) => handleChange("condition", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="any">Any condition</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="like-new">Like new</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-1/5">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <Select
            value={filters.location}
            onValueChange={(value) => handleChange("location", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All campus" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All campus</SelectItem>
                <SelectItem value="North Campus">North Campus</SelectItem>
                <SelectItem value="South Campus">South Campus</SelectItem>
                <SelectItem value="East Residence">East Residence</SelectItem>
                <SelectItem value="West Residence">West Residence</SelectItem>
                <SelectItem value="Student Center">Student Center</SelectItem>
                <SelectItem value="Science Building">Science Building</SelectItem>
                <SelectItem value="West Dorms">West Dorms</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="md:flex-shrink-0 self-end flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="w-full md:w-auto"
          >
            Clear
          </Button>
          <Button 
            onClick={handleApply}
            className="w-full md:w-auto bg-[#6B46C1] hover:bg-[#6B46C1]/90"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterBar;
