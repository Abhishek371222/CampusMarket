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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Building2, GraduationCap } from "lucide-react";
import type { Institution } from "@shared/schema";

const profileSetupSchema = z.object({
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  pincode: z.string().min(1, "Pincode is required"),
  institutionId: z.string().optional(),
  institutionName: z.string().optional(),
});

type ProfileSetupValues = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [showNewInstitution, setShowNewInstitution] = useState(false);

  const { data: countries } = useQuery<string[]>({
    queryKey: ["/api/locations/countries"],
  });

  const { data: states } = useQuery<string[]>({
    queryKey: ["/api/locations/states", selectedCountry],
    queryFn: async () => {
      const res = await fetch(`/api/locations/states/${encodeURIComponent(selectedCountry)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedCountry,
  });

  const { data: cities } = useQuery<string[]>({
    queryKey: ["/api/locations/cities", selectedCountry, selectedState],
    queryFn: async () => {
      const res = await fetch(`/api/locations/cities/${encodeURIComponent(selectedCountry)}/${encodeURIComponent(selectedState)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedCountry && !!selectedState,
  });

  const { data: pincodes } = useQuery<string[]>({
    queryKey: ["/api/locations/pincodes", selectedCountry, selectedState, selectedCity],
    queryFn: async () => {
      const res = await fetch(`/api/locations/pincodes/${encodeURIComponent(selectedCountry)}/${encodeURIComponent(selectedState)}/${encodeURIComponent(selectedCity)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedCountry && !!selectedState && !!selectedCity,
  });

  const { data: institutions } = useQuery<Institution[]>({
    queryKey: ["/api/institutions"],
  });

  const form = useForm<ProfileSetupValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      country: "",
      state: "",
      city: "",
      pincode: "",
      institutionId: "",
      institutionName: "",
    },
  });

  const createLocationMutation = useMutation({
    mutationFn: async (data: { country: string; state: string; city: string; pincode: string }) => {
      const res = await apiRequest("POST", "/api/locations", data);
      return res.json();
    },
  });

  const createInstitutionMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; locationId: string }) => {
      const res = await apiRequest("POST", "/api/institutions", data);
      return res.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { locationId: string; institutionId?: string | null }) => {
      const res = await apiRequest("PATCH", "/api/auth/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile setup complete!",
        description: "Welcome to CampusMarket. You can now browse and sell items.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete profile setup",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: ProfileSetupValues) {
    try {
      const location = await createLocationMutation.mutateAsync({
        country: values.country,
        state: values.state,
        city: values.city,
        pincode: values.pincode,
      });

      let institutionId = values.institutionId || null;

      if (showNewInstitution && values.institutionName) {
        const institution = await createInstitutionMutation.mutateAsync({
          name: values.institutionName,
          type: "university",
          locationId: location.id,
        });
        institutionId = institution.id;
      }

      await updateProfileMutation.mutateAsync({
        locationId: location.id,
        institutionId,
      });
    } catch (error) {
      console.error("Profile setup error:", error);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (user?.locationId) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isSubmitting = createLocationMutation.isPending || createInstitutionMutation.isPending || updateProfileMutation.isPending;

  return (
    <div className="container px-4 md:px-6 py-8 max-w-xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            To connect you with your campus community, please provide your location details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Location Information
                </div>
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your country"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedCountry(e.target.value);
                            setSelectedState("");
                            setSelectedCity("");
                            form.setValue("state", "");
                            form.setValue("city", "");
                            form.setValue("pincode", "");
                          }}
                          data-testid="input-country"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your state"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedState(e.target.value);
                            setSelectedCity("");
                            form.setValue("city", "");
                            form.setValue("pincode", "");
                          }}
                          data-testid="input-state"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your city"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedCity(e.target.value);
                            form.setValue("pincode", "");
                          }}
                          data-testid="input-city"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your pincode"
                          {...field}
                          data-testid="input-pincode"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  Institution (Optional)
                </div>

                {!showNewInstitution ? (
                  <FormField
                    control={form.control}
                    name="institutionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Your Institution</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-institution">
                              <SelectValue placeholder="Choose your college/university" />
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
                        <FormDescription>
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => setShowNewInstitution(true)}
                          >
                            Can't find your institution? Add it here
                          </Button>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="institutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your college/university name"
                            {...field}
                            data-testid="input-institution-name"
                          />
                        </FormControl>
                        <FormDescription>
                          <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto text-sm"
                            onClick={() => {
                              setShowNewInstitution(false);
                              form.setValue("institutionName", "");
                            }}
                          >
                            Select from existing institutions
                          </Button>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="button-complete-setup"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
