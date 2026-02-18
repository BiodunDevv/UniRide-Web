"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDriverStore } from "@/store/useDriverStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Car,
  FileText,
  Phone,
  Hash,
  Users,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Mail,
  User,
  Upload,
  X,
  Eye,
  ArrowRight,
  Edit2,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Image from "next/image";

// ─── Shared Header ────────────────────────────────────────────────────────────
function PageHeader({ subtitle }: { subtitle?: string }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 p-4">
      <div className="mx-auto max-w-2xl">
        <div
          className={`flex items-center justify-between border border-transparent px-3 py-2 sm:px-6 sm:py-3 transition-all duration-300 ease-out ${
            isScrolled
              ? "bg-primary shadow-lg backdrop-blur-2xl"
              : "bg-transparent backdrop-blur-xl"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-white transition-opacity hover:opacity-80"
          >
            <Logo className="w-7 h-auto" variant="light" />
            <span>UniRide</span>
          </Link>
          {subtitle && (
            <span className="hidden sm:block text-xs text-white/50 font-medium tracking-wide">
              {subtitle}
            </span>
          )}
          <Button variant="secondary" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Shared Footer ────────────────────────────────────────────────────────────
function PageFooter() {
  return (
    <footer className="mt-auto pt-8 pb-6 px-4">
      <div className="max-w-2xl mx-auto">
        <Separator className="bg-white/10 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo className="w-6 h-auto opacity-60" variant="light" />
            <span className="text-xs text-white/50 font-medium">UniRide</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <Link
              href="/terms"
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Terms
            </Link>
            <span className="text-white/20">·</span>
            <a
              href="mailto:support@uniride.ng"
              className="hover:text-white/70 transition-colors flex items-center gap-1"
            >
              Support
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <span className="text-white/20">·</span>
            <span>© {new Date().getFullYear()} UniRide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function DriverApplyPage() {
  const router = useRouter();
  const { applyAsDriver, isLoading, error, clearError, application } =
    useDriverStore();

  const [step, setStep] = useState<"form" | "preview">("form");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    vehicle_model: "",
    plate_number: "",
    drivers_license: "",
    available_seats: "4",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload a valid image file (PNG, JPG, WEBP).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Image size must be less than 5MB.",
      });
      return;
    }

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const url = await new Promise<string>((resolve, reject) => {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        formDataUpload.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
        );

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            if (data.secure_url) {
              resolve(data.secure_url);
            } else {
              reject(new Error("No URL returned from upload"));
            }
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Network error during upload")),
        );
        xhr.addEventListener("abort", () =>
          reject(new Error("Upload cancelled")),
        );

        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        );
        xhr.send(formDataUpload);
      });

      setFormData((prev) => ({ ...prev, drivers_license: url }));
      setImagePreview(url);
      toast.success("Image uploaded successfully");
    } catch (err) {
      console.error("Error uploading image:", err);
      toast.error("Upload failed", {
        description: "Could not upload your image. Please try again.",
      });
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, drivers_license: "" }));
    setImagePreview("");
  };

  const handleSubmit = async () => {
    clearError();

    try {
      await applyAsDriver({
        ...formData,
        available_seats: parseInt(formData.available_seats) || 4,
      });
    } catch (err) {
      console.error("Application failed:", err);
      setStep("form");
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────
  if (application) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader subtitle="Driver Application" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#042F40] mb-2">
                  Application Submitted!
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your application is under review. We&apos;ll notify you within
                  24–48 hours.
                </p>
              </div>

              <Alert className="mb-5 border-blue-200 bg-blue-50">
                <ShieldCheck className="size-4 text-blue-700" />
                <AlertTitle className="text-blue-900 text-xs font-semibold">
                  What&apos;s Next?
                </AlertTitle>
                <AlertDescription className="text-blue-800 text-xs leading-relaxed">
                  Our team will review your application and send an email
                  notification once approved or if additional information is
                  needed.
                </AlertDescription>
              </Alert>

              <div className="border bg-muted/30 p-4 mb-6 space-y-2.5 text-xs">
                <p className="font-semibold text-[#042F40] text-sm mb-3">
                  Application Details
                </p>
                {[
                  ["Name", application.name],
                  ["Email", application.email],
                  ["Vehicle", application.vehicle_model],
                  ["Plate Number", application.plate_number],
                  ["Seats", String(application.available_seats)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <span className="font-medium text-[#042F40] truncate text-right">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-1">
                  <span className="text-muted-foreground shrink-0">Status</span>
                  <Badge
                    variant="outline"
                    className="text-yellow-700 border-yellow-300 bg-yellow-50"
                  >
                    {application.status}
                  </Badge>
                </div>
              </div>

              <Button onClick={() => router.push("/")} className="w-full">
                Return to Home
              </Button>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── Preview Step ─────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
        <PageHeader subtitle="Review Application" />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="bg-white p-5 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-[#042F40]">
                  Application Preview
                </h2>
                <Button
                  onClick={() => setStep("form")}
                  variant="outline"
                  size="sm"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                Review your information carefully before submitting.
              </p>

              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertCircle className="size-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <button
                      onClick={clearError}
                      className="text-destructive hover:opacity-70 ml-4 font-bold"
                    >
                      ×
                    </button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-[#042F40]" />
                    <h3 className="font-semibold text-[#042F40] text-sm">
                      Personal Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Full Name
                      </p>
                      <p className="text-sm font-medium text-[#042F40]">
                        {formData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Email Address
                      </p>
                      <p className="text-sm font-medium text-[#042F40] truncate">
                        {formData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Phone Number
                      </p>
                      <p className="text-sm font-medium text-[#042F40]">
                        {formData.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Vehicle Information */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-[#042F40]" />
                    <h3 className="font-semibold text-[#042F40] text-sm">
                      Vehicle Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Vehicle Model
                      </p>
                      <p className="text-sm font-medium text-[#042F40]">
                        {formData.vehicle_model}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Plate Number
                      </p>
                      <p className="text-sm font-medium text-[#042F40]">
                        {formData.plate_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Available Seats
                      </p>
                      <p className="text-sm font-medium text-[#042F40]">
                        {formData.available_seats}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Driver's License */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#042F40]" />
                    <h3 className="font-semibold text-[#042F40] text-sm">
                      Driver&apos;s License
                    </h3>
                  </div>
                  {formData.drivers_license && (
                    <div className="pl-6">
                      <div className="border overflow-hidden">
                        <Image
                          src={formData.drivers_license}
                          alt="Driver's License"
                          width={800}
                          height={500}
                          className="w-full h-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
                <Button
                  onClick={() => setStep("form")}
                  variant="outline"
                  className="sm:flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Edit
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="sm:flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <PageFooter />
      </div>
    );
  }

  // ─── Form Step ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40] flex flex-col">
      <PageHeader subtitle="Driver Application Portal" />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl py-6">
          <div className="bg-white p-5 sm:p-8 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#042F40] mb-1">
                Become a Driver
              </h2>
              <p className="text-xs text-muted-foreground">
                Join our community of drivers and start earning on your own
                schedule.
              </p>
            </div>

            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <FileText className="size-4 text-blue-700" />
              <AlertTitle className="text-blue-900 text-xs font-semibold">
                Requirements
              </AlertTitle>
              <AlertDescription className="text-blue-800">
                <ul className="mt-1 space-y-0.5 list-disc ml-4">
                  <li>Valid driver&apos;s license</li>
                  <li>Vehicle in good condition (2010 or newer)</li>
                  <li>Proof of vehicle registration</li>
                  <li>Must be 21 years or older</li>
                </ul>
              </AlertDescription>
            </Alert>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("preview");
              }}
              className="space-y-6"
            >
              {/* ── Personal Information ─────────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-[#042F40]" />
                  <h3 className="font-semibold text-[#042F40] text-sm">
                    Personal Information
                  </h3>
                </div>
                <div className="space-y-4 pl-6">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-medium text-foreground"
                    >
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-foreground"
                    >
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john.doe@example.com"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-medium text-foreground"
                    >
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+234 800 000 0000"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Vehicle Information ──────────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Car className="w-4 h-4 text-[#042F40]" />
                  <h3 className="font-semibold text-[#042F40] text-sm">
                    Vehicle Information
                  </h3>
                </div>
                <div className="space-y-4 pl-6">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="vehicle_model"
                      className="text-xs font-medium text-foreground"
                    >
                      Vehicle Model <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="vehicle_model"
                        name="vehicle_model"
                        type="text"
                        value={formData.vehicle_model}
                        onChange={handleInputChange}
                        placeholder="Toyota Camry 2020"
                        className="pl-8"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Include make, model, and year
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="plate_number"
                      className="text-xs font-medium text-foreground"
                    >
                      Plate Number <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="plate_number"
                        name="plate_number"
                        type="text"
                        value={formData.plate_number}
                        onChange={handleInputChange}
                        placeholder="ABC-123-XY"
                        className="pl-8"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="available_seats"
                      className="text-xs font-medium text-foreground"
                    >
                      Available Seats
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        id="available_seats"
                        name="available_seats"
                        type="number"
                        value={formData.available_seats}
                        onChange={handleInputChange}
                        min="1"
                        max="8"
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Default: 4 passengers
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Driver's License Upload ──────────────────────────────── */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-[#042F40]" />
                  <h3 className="font-semibold text-[#042F40] text-sm">
                    Driver&apos;s License
                  </h3>
                </div>
                <div className="pl-6">
                  <Label className="text-xs font-medium text-foreground mb-2 block">
                    Upload License Image{" "}
                    <span className="text-destructive">*</span>
                  </Label>

                  {!imagePreview ? (
                    <label
                      htmlFor="license-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-border p-8 cursor-pointer hover:border-[#042F40] hover:bg-muted/30 transition-colors"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="license-upload"
                        required={!formData.drivers_license}
                      />
                      {uploadingImage ? (
                        <div className="w-full space-y-4">
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 text-[#042F40] mb-3 animate-spin" />
                            <p className="text-sm font-medium text-foreground mb-1">
                              Uploading image...
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Upload progress
                              </span>
                              <span className="font-semibold text-[#042F40]">
                                {uploadProgress}%
                              </span>
                            </div>
                            <Progress value={uploadProgress} className="h-2" />
                          </div>
                          <p className="text-xs text-muted-foreground text-center">
                            Please wait while we upload your document
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                          <p className="text-sm font-medium text-foreground mb-1">
                            Click to upload
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG — up to 5MB
                          </p>
                        </>
                      )}
                    </label>
                  ) : (
                    <div className="relative">
                      <div className="border overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="License Preview"
                          width={800}
                          height={500}
                          className="w-full h-auto"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1.5 hover:opacity-80 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-green-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Uploaded successfully</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* ── Terms ────────────────────────────────────────────────── */}
              <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(v) => setTermsAccepted(!!v)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground cursor-pointer"
                >
                  <p className="leading-relaxed">
                    I agree to UniRide&apos;s{" "}
                    <Link
                      href="/terms"
                      className="text-[#042F40] font-medium hover:underline underline-offset-2"
                    >
                      Terms of Service
                    </Link>{" "}
                    and confirm that all information provided in this
                    application is accurate and complete.
                  </p>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!termsAccepted || uploadingImage}
              >
                <Eye className="w-4 h-4 mr-2" />
                Review Application
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
      <PageFooter />
    </div>
  );
}
