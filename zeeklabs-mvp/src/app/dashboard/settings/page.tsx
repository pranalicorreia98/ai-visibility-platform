"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  Settings,
  Building2,
  Globe,
  Users,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Tag,
  Wand2,
  RefreshCw,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useBrand } from "@/contexts/brand-context";

interface Competitor {
  id?: string;
  name: string;
  domain?: string;
  reason?: string;
}

interface Brand {
  id: string;
  name: string;
  domain?: string;
  alternateNames?: string;
  competitors: Competitor[];
}

export default function SettingsPage() {
  // Use shared brand context for auto-refresh across pages
  const { refreshData, setSelectedBrandId } = useBrand();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for new/editing brand
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    alternateNames: "",
    competitors: [] as Competitor[],
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
        if (data.length > 0) {
          selectBrand(data[0]);
        }
      }
    } catch (err) {
      setError("Failed to fetch brands");
    } finally {
      setLoading(false);
    }
  };

  const selectBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      domain: brand.domain || "",
      alternateNames: brand.alternateNames
        ? JSON.parse(brand.alternateNames).join(", ")
        : "",
      competitors: brand.competitors || [],
    });
    setError(null);
    setSuccess(null);

    // Update context so all pages reflect this brand selection
    setSelectedBrandId(brand.id);
  };

  const handleNewBrand = () => {
    setEditingBrand(null);
    setFormData({
      name: "",
      domain: "",
      alternateNames: "",
      competitors: [],
    });
    setError(null);
    setSuccess(null);
  };

  const discoverCompetitors = async () => {
    if (!formData.name.trim()) {
      setError("Please enter a brand name first");
      return;
    }

    setDiscovering(true);
    setError(null);

    try {
      const response = await fetch("/api/discover-competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: formData.name,
          domain: formData.domain || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to discover competitors");
      }

      setFormData({
        ...formData,
        competitors: data.competitors,
      });

      setSuccess(`Found ${data.competitors.length} competitors using AI`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to discover competitors");
    } finally {
      setDiscovering(false);
    }
  };

  const removeCompetitor = (index: number) => {
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Brand name is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: formData.name,
        domain: formData.domain || undefined,
        alternateNames: formData.alternateNames
          ? formData.alternateNames.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        competitors: formData.competitors.filter((c) => c.name.trim()),
      };

      const url = editingBrand ? `/api/brands/${editingBrand.id}` : "/api/brands";
      const method = editingBrand ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save brand");
      }

      setSuccess(editingBrand ? "Brand updated successfully" : "Brand created successfully");

      // Refresh brands list
      await fetchBrands();

      // Update the selected brand in context and refresh all data across pages
      if (editingBrand) {
        setSelectedBrandId(editingBrand.id);
      }
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingBrand) return;
    if (!confirm("Are you sure you want to delete this brand?")) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/brands/${editingBrand.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }

      setSuccess("Brand deleted successfully");
      handleNewBrand();
      await fetchBrands();
      // Refresh all data across pages
      refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-3">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 fade-in">
      {/* Back Navigation */}
      <Link
        href="/dashboard/analysis"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to AI Visibility
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your brand details - we&apos;ll automatically discover your competitors
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Brand List */}
        <Card className="lg:col-span-1 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Your Brands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => selectBrand(brand)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  editingBrand?.id === brand.id
                    ? "bg-primary/10 border-2 border-primary/50 text-foreground"
                    : "bg-muted/50 hover:bg-muted border-2 border-transparent hover:border-border"
                }`}
              >
                <div className="font-semibold">{brand.name}</div>
                {brand.domain && (
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {brand.domain}
                  </div>
                )}
                {brand.competitors?.length > 0 && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {brand.competitors.length} competitors
                  </Badge>
                )}
              </button>
            ))}
            <Button
              variant="outline"
              className="w-full mt-3 h-12 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
              onClick={handleNewBrand}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Brand
            </Button>
          </CardContent>
        </Card>

        {/* Brand Form */}
        <Card className="lg:col-span-3 border-border overflow-hidden">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
                {editingBrand ? (
                  <Building2 className="h-5 w-5 text-white" />
                ) : (
                  <Sparkles className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <CardTitle>{editingBrand ? "Edit Brand" : "New Brand"}</CardTitle>
                <CardDescription>
                  Enter your brand details and we&apos;ll find your competitors automatically
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Status messages */}
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                <p className="text-sm text-emerald-600">{success}</p>
              </div>
            )}

            {/* Brand details */}
            <div className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Brand Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Acme Software"
                    className="h-11 bg-muted/50 border-border focus:border-primary rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Website Domain
                  </label>
                  <Input
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="acmesoftware.com"
                    className="h-11 bg-muted/50 border-border focus:border-primary rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Alternative Names
                </label>
                <Input
                  value={formData.alternateNames}
                  onChange={(e) => setFormData({ ...formData, alternateNames: e.target.value })}
                  placeholder="Acme, ACME, Acme PM"
                  className="h-11 bg-muted/50 border-border focus:border-primary rounded-xl"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of name variations to search in AI responses
                </p>
              </div>
            </div>

            {/* Competitors section - Auto-discovered */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Competitors</h3>
                    <p className="text-sm text-muted-foreground">
                      Auto-discovered using AI analysis
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={discoverCompetitors}
                  disabled={discovering || !formData.name.trim()}
                  className="rounded-xl gap-2"
                >
                  {discovering ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Discovering...
                    </>
                  ) : formData.competitors.length > 0 ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Re-discover
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Discover Competitors
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {formData.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex gap-3 items-start p-4 rounded-xl bg-muted/30 border border-border"
                  >
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-amber-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{competitor.name}</span>
                        {competitor.domain && (
                          <Badge variant="outline" className="text-xs">
                            {competitor.domain}
                          </Badge>
                        )}
                      </div>
                      {competitor.reason && (
                        <p className="text-sm text-muted-foreground mt-1">{competitor.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCompetitor(index)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {formData.competitors.length === 0 && (
                  <div className="text-center py-12 rounded-xl bg-muted/30 border border-dashed border-border">
                    <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-medium">No competitors discovered yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Enter your brand name above and click &quot;Discover Competitors&quot; to automatically find your competition
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 rounded-xl"
                      onClick={discoverCompetitors}
                      disabled={discovering || !formData.name.trim()}
                    >
                      {discovering ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Discovering...
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Discover Competitors
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {formData.competitors.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  You can remove competitors you don&apos;t want to track. Click Re-discover to find new ones.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-premium rounded-xl h-11 px-6"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {editingBrand ? "Update Brand" : "Create Brand"}
              </Button>
              {editingBrand && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  disabled={saving}
                  className="rounded-xl h-11 px-6 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Brand
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
