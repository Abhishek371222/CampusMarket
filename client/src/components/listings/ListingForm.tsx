import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X, FileText } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Validation schema for the form
const listingFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title cannot exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description cannot exceed 1000 characters"),
  price: z.coerce.number().min(0, "Price must be at least 0").max(10000, "Price cannot exceed $10,000"),
  condition: z.string().min(1, "Please select a condition"),
  location: z.string().min(1, "Please select a location"),
  categoryId: z.coerce.number().min(1, "Please select a category"),
  isUrgent: z.boolean().default(false),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

const ListingForm = ({ isEditing, listing, isLoading }) => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [images, setImages] = useState<File[]>([]);
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Initialize the form
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      condition: "",
      location: "",
      categoryId: 0,
      isUrgent: false,
    },
  });

  // Set form values if editing an existing listing
  useEffect(() => {
    if (isEditing && listing && !isLoading) {
      form.reset({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        condition: listing.condition,
        location: listing.location,
        categoryId: listing.categoryId,
        isUrgent: listing.isUrgent,
      });

      if (listing.images && listing.images.length > 0) {
        setExistingImages(listing.images);
      }

      if (listing.attachments && listing.attachments.length > 0) {
        setExistingAttachments(listing.attachments);
      }
    }
  }, [isEditing, listing, isLoading, form]);

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/listings", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing created",
        description: "Your listing has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      navigate("/my-listings");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update listing mutation
  const updateListingMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const response = await apiRequest("PUT", `/api/listings/${id}`, formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Listing updated",
        description: "Your listing has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      navigate("/my-listings");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update listing. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (values: ListingFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add form field values as JSON
      formData.append("data", JSON.stringify(values));
      
      // Append new image files
      images.forEach((image) => {
        formData.append("images", image);
      });
      
      // Append new attachment files
      attachments.forEach((attachment) => {
        formData.append("images", attachment);
      });
      
      if (isEditing && listing) {
        // Update existing listing
        const updatedValues = {
          ...values,
          images: existingImages,
          attachments: existingAttachments,
        };
        
        formData.set("data", JSON.stringify(updatedValues));
        
        updateListingMutation.mutate({ id: listing.id, formData });
      } else {
        // Create new listing
        createListingMutation.mutate(formData);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages = Array.from(files);
    setImages((prev) => [...prev, ...newImages]);

    // Generate previews
    const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
    setImagesPreviews((prev) => [...prev, ...newPreviews]);

    // Reset the input
    e.target.value = "";
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = Array.from(files);
    setAttachments((prev) => [...prev, ...newAttachments]);

    // Reset the input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagesPreviews[index]);
    
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    navigate(isEditing ? "/my-listings" : "/");
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a descriptive title for your listing" {...field} />
                  </FormControl>
                  <FormDescription>
                    Be clear and specific about what you're selling.
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
                      placeholder="Describe your item in detail (condition, features, etc.)"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include relevant details like brand, model, condition, and any defects.
                  </FormDescription>
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
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>Enter price in USD.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the category that best fits your item.
                    </FormDescription>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
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
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="North Campus">North Campus</SelectItem>
                        <SelectItem value="South Campus">South Campus</SelectItem>
                        <SelectItem value="East Residence">East Residence</SelectItem>
                        <SelectItem value="West Residence">West Residence</SelectItem>
                        <SelectItem value="Student Center">Student Center</SelectItem>
                        <SelectItem value="Science Building">Science Building</SelectItem>
                        <SelectItem value="Library">Library</SelectItem>
                        <SelectItem value="West Dorms">West Dorms</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Mark as Urgent</FormLabel>
                    <FormDescription>
                      Urgent listings get more visibility and show an urgent badge.
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

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Images</h3>
                <p className="text-sm text-gray-500">
                  Upload up to 5 images of your item. First image will be used as cover.
                </p>
              </div>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">Current Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border">
                          <img
                            src={image}
                            alt={`Existing image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Image Previews */}
              {imagesPreviews.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium mb-2">New Images</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagesPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border">
                          <img
                            src={preview}
                            alt={`Upload preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {(existingImages.length + images.length < 5) && (
                <div className="mt-2">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-[#6B46C1] transition-colors"
                  >
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <div className="text-sm font-medium">Click to upload images</div>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, GIF. Max 5MB each.
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* PDF Attachments Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Attachments (Optional)</h3>
                <p className="text-sm text-gray-500">
                  Upload PDF files such as textbook information, manuals, or additional details.
                </p>
              </div>

              {/* Existing Attachments */}
              {existingAttachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  <h4 className="text-sm font-medium">Current Attachments</h4>
                  <div className="space-y-2">
                    {existingAttachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-[#6B46C1] mr-2" />
                          <span className="text-sm font-medium">
                            {getFileName(attachment)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Attachments */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  <h4 className="text-sm font-medium">New Attachments</h4>
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-[#6B46C1] mr-2" />
                          <span className="text-sm font-medium">{attachment.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="mt-2">
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-[#6B46C1] transition-colors"
                >
                  <div className="space-y-1">
                    <FileText className="h-6 w-6 text-gray-400 mx-auto" />
                    <div className="text-sm font-medium">Click to upload PDF attachments</div>
                    <p className="text-xs text-gray-500">
                      PDF files only. Max 10MB each.
                    </p>
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Any unsaved changes will be lost. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, continue editing</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel}>
                      Yes, discard changes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button 
                type="submit" 
                className="bg-[#6B46C1] hover:bg-[#6B46C1]/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <>{isEditing ? "Update Listing" : "Create Listing"}</>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ListingForm;
