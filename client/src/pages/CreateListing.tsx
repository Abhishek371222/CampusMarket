import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertListingSchema, listingCategories, conditions } from "@shared/schema";
import { useUserContext } from "@/components/ui/animations";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeIn, fadeInUp } from "@/components/ui/animations";
import { AlertCircle, ArrowLeft, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extend the insert schema with client-side validation
const createListingSchema = insertListingSchema.extend({
  price: z.coerce.number().positive({ message: "Price must be a positive number" }),
  images: z.array(z.string()).min(1, { message: "At least one image is required" }),
  pdfUrl: z.string().optional(),
});

// For better TypeScript support
type CreateListingFormValues = z.infer<typeof createListingSchema>;

const CreateListing = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [isUploading, setIsUploading] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate("/login");
    toast({
      title: "Authentication required",
      description: "Please log in to create a listing.",
      variant: "destructive"
    });
    return null;
  }

  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      category: "furniture",
      condition: "good",
      location: "",
      images: [],
      pdfUrl: "",
      isUrgent: false,
      isSold: false,
      userId: user.id
    }
  });

  const createMutation = useMutation({
    mutationFn: async (values: CreateListingFormValues) => {
      return apiRequest("POST", "/api/listings", values);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/listings/featured'] });
      
      toast({
        title: "Listing created!",
        description: "Your item has been successfully listed.",
      });
      
      navigate(`/listings/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create listing",
        description: "Please check your information and try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: CreateListingFormValues) => {
    createMutation.mutate(values);
  };

  // Simulate image upload (in a real app, this would upload to a server)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const files = Array.from(e.target.files!);
      const imageUrls = form.getValues("images") || [];
      
      // For demo purposes, we're just using placeholder images
      // In a real app, you would upload the files to a server
      const newImageUrls = [
        ...imageUrls,
        ...files.map((_, index) => {
          const placeholders = [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80", // furniture
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // books
            "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", // laptop
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"  // accessories
          ];
          return placeholders[Math.floor(Math.random() * placeholders.length)];
        })
      ];
      
      form.setValue("images", newImageUrls);
      form.trigger("images");
      setIsUploading(false);
      
      // Reset file input
      e.target.value = '';
    }, 1500);
  };

  // Simulate PDF upload
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      // For demo purposes, just set a dummy URL
      form.setValue("pdfUrl", "https://example.com/sample.pdf");
      setIsUploading(false);
      
      // Reset file input
      e.target.value = '';
    }, 1500);
  };

  // Remove an image from the array
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
    form.trigger("images");
  };

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
      className="container mx-auto px-4 py-6"
    >
      {/* Back button */}
      <motion.div variants={fadeInUp} custom={0}>
        <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Button>
      </motion.div>

      <motion.div variants={fadeInUp} custom={1}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Create a new listing</CardTitle>
            <CardDescription>
              Fill out the form below to list your item for sale on CampusMarket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. MacBook Pro 2019 (13-inch)" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive title will help your item get noticed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your item, including any relevant details about its condition, features, etc."
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {listingCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condition</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {conditions.map((condition) => (
                              <SelectItem key={condition} value={condition}>
                                {condition.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select campus location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="north">North Campus</SelectItem>
                            <SelectItem value="south">South Campus</SelectItem>
                            <SelectItem value="east">East Residence</SelectItem>
                            <SelectItem value="west">West Residence</SelectItem>
                            <SelectItem value="downtown">Downtown</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {field.value.map((url, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={url} 
                                  alt={`Listing image ${index + 1}`} 
                                  className="h-24 w-full object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <label className="h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                              <Upload className="h-6 w-6 text-gray-400" />
                              <span className="text-sm text-gray-500 mt-1">Add image</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                          {field.value.length === 0 && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle>Required</AlertTitle>
                              <AlertDescription>
                                At least one image is required for your listing.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload clear photos of your item from different angles.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.getValues("category") === "textbooks" || form.getValues("category") === "academic" ? (
                  <FormField
                    control={form.control}
                    name="pdfUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PDF Document (Optional)</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value ? (
                              <div className="flex items-center space-x-2">
                                <div className="bg-gray-100 p-3 rounded-md flex items-center flex-1">
                                  <Upload className="h-5 w-5 text-gray-500 mr-2" />
                                  <span className="text-sm truncate">Uploaded document</span>
                                </div>
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => form.setValue("pdfUrl", "")}
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <label className="border border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Upload a PDF document (syllabus, notes, etc.)</span>
                                <input 
                                  type="file" 
                                  accept=".pdf" 
                                  className="hidden"
                                  onChange={handlePdfUpload}
                                  disabled={isUploading}
                                />
                              </label>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          For textbooks or academic materials, you can upload a PDF with additional information.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="isUrgent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mark as Urgent</FormLabel>
                        <FormDescription>
                          Urgent listings get more visibility and appear at the top of search results.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createMutation.isPending || isUploading}
                  >
                    {createMutation.isPending ? "Creating Listing..." : "Post Listing"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-gray-500 border-t pt-6">
            <p>All fields marked with * are required</p>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default CreateListing;
