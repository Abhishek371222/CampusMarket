import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import type { Location, Institution } from "@shared/schema";

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  institutionId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileEdit() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [originalLocationId, setOriginalLocationId] = useState<string | null>(null);
  const [locationLoaded, setLocationLoaded] = useState(false);

  const { data: userLocation } = useQuery<Location>({
    queryKey: ["/api/locations", user?.locationId],
    enabled: !!user?.locationId,
  });

  const { data: countries } = useQuery<string[]>({
    queryKey: ["/api/locations/countries"],
  });

  const { data: states } = useQuery<string[]>({
    queryKey: ["/api/locations/states", selectedCountry],
    enabled: !!selectedCountry,
  });

  const { data: cities } = useQuery<string[]>({
    queryKey: ["/api/locations/cities", selectedCountry, selectedState],
    enabled: !!selectedCountry && !!selectedState,
  });

  const { data: pincodes } = useQuery<string[]>({
    queryKey: ["/api/locations/pincodes", selectedCountry, selectedState, selectedCity],
    enabled: !!selectedCountry && !!selectedState && !!selectedCity,
  });

  const locationChanged = userLocation ? (
    selectedCountry !== userLocation.country ||
    selectedState !== userLocation.state ||
    selectedCity !== userLocation.city
  ) : (selectedCountry || selectedState || selectedCity);

  const effectiveLocationId = locationChanged ? undefined : user?.locationId;

  const { data: institutions } = useQuery<Institution[]>({
    queryKey: ["/api/institutions", { locationId: effectiveLocationId }],
    queryFn: async () => {
      const url = effectiveLocationId 
        ? `/api/institutions?locationId=${effectiveLocationId}` 
        : "/api/institutions";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch institutions");
      return res.json();
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      avatar: "",
      phone: "",
      bio: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      institutionId: "",
    },
  });

  useEffect(() => {
    if (user && !locationLoaded) {
      form.reset({
        name: user.name || "",
        avatar: user.avatar || "",
        phone: user.phone || "",
        bio: user.bio || "",
        country: "",
        state: "",
        city: "",
        pincode: "",
        institutionId: user.institutionId || "",
      });
      setOriginalLocationId(user.locationId || null);
    }
  }, [user, form, locationLoaded]);

  useEffect(() => {
    if (userLocation && !locationLoaded) {
      setSelectedCountry(userLocation.country);
      setSelectedState(userLocation.state);
      setSelectedCity(userLocation.city);
      
      form.setValue("country", userLocation.country);
      form.setValue("state", userLocation.state);
      form.setValue("city", userLocation.city);
      form.setValue("pincode", userLocation.pincode);
      
      setLocationLoaded(true);
    }
  }, [userLocation, form, locationLoaded]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; avatar?: string | null; phone?: string | null; bio?: string | null; locationId?: string | null; institutionId?: string | null }) => {
      const res = await apiRequest("PATCH", "/api/auth/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setLocation("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: { country: string; state: string; city: string; pincode: string }) => {
      const res = await apiRequest("POST", "/api/locations", data);
      return res.json();
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      let locationId: string | null = originalLocationId;

      const hasLocationChanged = userLocation ? (
        values.country !== userLocation.country ||
        values.state !== userLocation.state ||
        values.city !== userLocation.city ||
        values.pincode !== userLocation.pincode
      ) : (values.country && values.state && values.city && values.pincode);

      if (hasLocationChanged && values.country && values.state && values.city && values.pincode) {
        const location = await createLocationMutation.mutateAsync({
          country: values.country,
          state: values.state,
          city: values.city,
          pincode: values.pincode,
        });
        locationId = location.id;
      } else if (!values.country && !values.state && !values.city && !values.pincode) {
        locationId = null;
      }

      await updateProfileMutation.mutateAsync({
        name: values.name,
        avatar: values.avatar || null,
        phone: values.phone || null,
        bio: values.bio || null,
        locationId,
        institutionId: values.institutionId || null,
      });
    } catch (error) {
      console.error("Profile update error:", error);
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const avatarUrl = form.watch("avatar");

  return (
    <div className="container px-4 md:px-6 py-8 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => setLocation("/profile")}
        className="mb-6"
        data-testid="button-back-profile"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Profile
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarUrl || undefined} alt={user.name} />
                  <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                          data-testid="input-avatar"
                        />
                      </FormControl>
                      <FormDescription>Enter a URL for your profile picture</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormDescription>Your contact phone number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormDescription>A short description about yourself (max 500 characters)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCountry(value);
                            setSelectedState("");
                            setSelectedCity("");
                            form.setValue("state", "");
                            form.setValue("city", "");
                            form.setValue("pincode", "");
                          }}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries?.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
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
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedState(value);
                            setSelectedCity("");
                            form.setValue("city", "");
                            form.setValue("pincode", "");
                          }}
                          disabled={!selectedCountry}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states?.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedCity(value);
                            form.setValue("pincode", "");
                          }}
                          disabled={!selectedState}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cities?.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
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
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedCity}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-pincode">
                              <SelectValue placeholder="Select pincode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {pincodes?.map((pincode) => (
                              <SelectItem key={pincode} value={pincode}>
                                {pincode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="institutionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-institution">
                          <SelectValue placeholder="Select your institution" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {institutions?.map((institution) => (
                          <SelectItem key={institution.id} value={institution.id}>
                            {institution.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select your college, university, or school</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending || createLocationMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {(updateProfileMutation.isPending || createLocationMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
