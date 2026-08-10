"use client";

import {
  Building,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  FileText,
  Globe,
  Hash,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  Map,
  MapPin,
  Phone,
  PhoneCall,
  Sparkles,
  Store,
  Upload,
  User,
  X,
} from "lucide-react";

// Custom SVG Icons for Instagram & Facebook to guarantee compatibility
const InstagramIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { authClient, signUp } from "@/lib/auth-client";
import {
  INDIAN_CITIES,
  lookupByPincode,
  lookupStateByCity,
} from "@/utils/indianGeoLookup";
import {
  STANDARD_TIME_OPTIONS,
  normalizeTimeFormat,
} from "@/utils/timeUtils";

const CATEGORIES = [
  { id: "fashion", label: "Fashion & Clothing" },
  { id: "food", label: "Food & Dining" },
  { id: "electronics", label: "Electronics & Gadgets" },
  { id: "beauty", label: "Beauty & Wellness" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "home", label: "Home & Living" },
  { id: "home-improvement", label: "Home Improvement" },
  { id: "fitness", label: "Fitness & Healthcare" },
  { id: "education", label: "Education & Courses" },
  { id: "kids-baby", label: "Kids & Baby Products" },
  { id: "jewellery", label: "Jewellery & Accessories" },
  { id: "automotive", label: "Automobile & Auto Services" },
  { id: "entertainment", label: "Gaming & Entertainment" },
  { id: "grocery", label: "Grocery & Essentials" },
  { id: "finance", label: "Finance & Insurance" },
  { id: "others", label: "Others / Special Category" },
];

const BUSINESS_CONSTITUTIONS = [
  { id: "proprietorship", label: "Proprietorship" },
  { id: "partnership", label: "Partnership" },
  { id: "llp", label: "Limited Liability Partnership (LLP)" },
  { id: "pvt_ltd", label: "Private Limited Company (Pvt Ltd)" },
  { id: "others", label: "Others" },
];

const DESIGNATIONS = [
  { id: "owner", label: "Owner / Proprietor" },
  { id: "partner", label: "Managing Partner" },
  { id: "manager", label: "General Manager / Operations Head" },
  { id: "others", label: "Others / Authorized Liaison" },
];

const COMMISSION_TABLE = [
  {
    id: "fashion",
    category: "Fashion & Clothing",
    rate: "5%",
    model: "CPA",
    notes: "Uniform across apparel",
  },
  {
    id: "food",
    category: "Food & Dining",
    rate: "3% dine-in / 2% delivery",
    model: "CPA",
    notes: "Never charge on Zomato-fulfilled orders",
  },
  {
    id: "electronics",
    category: "Electronics & Gadgets",
    rate: "2.5% blended",
    model: "CPA",
    notes: "Accessories 4%, handsets 1.5%",
  },
  {
    id: "beauty",
    category: "Beauty & Wellness",
    rate: "6% services / 4% retail",
    model: "CPA",
    notes: "Split by service vs product",
  },
  {
    id: "travel",
    category: "Travel & Hospitality",
    rate: "5% hotels / 4% packages",
    model: "CPA",
    notes: "Hotels pay less than MakeMyTrip",
  },
  {
    id: "home",
    category: "Home & Living",
    rate: "5%",
    model: "CPA",
    notes: "Furniture and décor",
  },
  {
    id: "home-improvement",
    category: "Home Improvement",
    rate: "2% products / 3% services",
    model: "CPA",
    notes: "In-store attribution via code",
  },
  {
    id: "fitness",
    category: "Fitness & Healthcare",
    rate: "6% gyms / 2% pharmacy / ₹200 CPL clinics",
    model: "CPA + CPL",
    notes: "Two models in one category",
  },
  {
    id: "education",
    category: "Education & Courses",
    rate: "₹300 CPL local / 8% online",
    model: "CPL + CPA",
    notes: "CPL for offline institutes",
  },
  {
    id: "kids-baby",
    category: "Kids & Baby Products",
    rate: "5%",
    model: "CPA",
    notes: "Clean, simple rate",
  },
  {
    id: "jewellery",
    category: "Jewellery & Accessories",
    rate: "1.5% gold / 6% fashion / 3% blended",
    model: "CPA",
    notes: "Split by product type",
  },
  {
    id: "automotive",
    category: "Automobile & Auto Services",
    rate: "4%",
    model: "CPA",
    notes: "White space — you set the standard",
  },
  {
    id: "entertainment",
    category: "Gaming & Entertainment",
    rate: "4–5%",
    model: "CPA",
    notes: "Cafés higher, retail lower",
  },
  {
    id: "grocery",
    category: "Grocery & Essentials",
    rate: "2% regular / 4% organic",
    model: "CPA",
    notes: "Start with premium segment",
  },
  {
    id: "finance",
    category: "Finance & Insurance",
    rate: "₹150–₹350 CPL",
    model: "CPL",
    notes: "Pure lead model",
  },
];

const FieldTip = ({ text }) => (
  <p className="text-[10px] text-blue-600 font-medium mt-0.5 leading-tight text-left">
    {text}
  </p>
);

export function MerchantOnboardingWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser } = useUser();

  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings?public=true");
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data?.settings || json?.settings || null;
    },
    staleTime: 5000,
  });

  const commitmentItems = publicSettings?.merchant_commitments || [
    {
      id: "commit1",
      key: "commit1",
      text: "All submitted business information is accurate and real.",
      required: true,
    },
    {
      id: "commit2",
      key: "commit2",
      text: "I will honour every verified offer published on Vouchiqo.",
      required: true,
    },
    {
      id: "commit3",
      key: "commit3",
      text: "I will submit only genuine, working offer codes and deals.",
      required: true,
    },
    {
      id: "commit4",
      key: "commit4",
      text: "I will enter actual transaction values when confirming codes.",
      required: true,
    },
    {
      id: "commit5",
      key: "commit5",
      text: "I understand Vouchiqo earns performance commission.",
      required: true,
    },
    {
      id: "commit6",
      key: "commit6",
      text: "I will keep counter staff informed about active offers.",
      required: true,
    },
    {
      id: "commit7",
      key: "commit7",
      text: "I will pause offers if stock runs out or terms change.",
      required: true,
    },
  ];

  const policyItems = publicSettings?.policy_agreements || [
    {
      id: "merchant_agreement",
      key: "policy1",
      title: "Agree to Merchant Agreement",
      link: "https://drive.google.com/file/d/1_sample_merchant_agreement/view?usp=sharing",
      required: true,
    },
    {
      id: "terms_of_service",
      key: "policy2",
      title: "Agree to Terms of Service",
      link: "https://drive.google.com/file/d/1_sample_terms_of_service/view?usp=sharing",
      required: true,
    },
    {
      id: "privacy_policy",
      key: "policy3",
      title: "Agree to Privacy Policy",
      link: "https://drive.google.com/file/d/1_sample_privacy_policy/view?usp=sharing",
      required: true,
    },
    {
      id: "verification_policy",
      key: "policy4",
      title: "Agree to Verification Policy",
      link: "https://drive.google.com/file/d/1_sample_verification_policy/view?usp=sharing",
      required: true,
    },
    {
      id: "refund_cancellation",
      key: "policy5",
      title: "Agree to Refund & Cancellation Policy",
      link: "https://drive.google.com/file/d/1_sample_refund_policy/view?usp=sharing",
      required: true,
    },
  ];

  const [plansFromDb, setPlansFromDb] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDynamicPlans() {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const json = await res.json();
          const dbPlans = json?.data?.plans || json?.plans;
          if (Array.isArray(dbPlans) && dbPlans.length > 0 && isMounted) {
            setPlansFromDb(dbPlans.filter((p) => p.active !== false));
          }
        }
      } catch (err) {
        console.error("[MerchantWizard] Error fetching dynamic plans:", err);
      }
    }
    loadDynamicPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const merchantPlans = plansFromDb || publicSettings?.merchant_plans || [
    {
      id: "starter",
      name: "STARTER FREE",
      badge: "Popular",
      priceText: "₹0",
      priceSuffix: "/ month free forever",
      originalPrice: "",
      subCaption: "Start listing. Pay only when a customer visits.",
      features: [
        "Up to 3 active verified listings",
        "Smart Code redemption at your counter",
        "Vouchiqo Verified badge on all listings",
        "Basic dashboard — views and Smart Codes",
        "Founding Partner badge if within first 100",
        "No campaigns — No push sends",
      ],
      footerNote:
        "Commission charged only on confirmed customer transactions — never on views or clicks.",
      buttonText: "Select Starter",
      theme: "blue",
      active: true,
    },
    {
      id: "growth",
      name: "GROWTH PARTNER",
      badge: "Founding Rate -33%",
      priceText: "₹999",
      originalPrice: "₹1,499",
      priceSuffix: "/ month",
      subCaption:
        "More listings. Campaigns. Revival included. 14-day free trial.",
      features: [
        "Up to 15 active listings (5× Starter)",
        "4 platform campaigns per year",
        "5 Expired Offer Revivals / month",
        "Analytics — redemptions, clicks, category rank",
        "Founding badge + 12 month commission rate lock",
        "14 day free trial — no charge until Day 15",
      ],
      footerNote:
        "No payment collected today. Trial starts on account activation.",
      buttonText: "Select Growth — ₹999/mo",
      theme: "orange",
      active: true,
    },
    {
      id: "pro",
      name: "PRO PARTNER",
      badge: "Best Value",
      priceText: "₹2,999",
      originalPrice: "₹3,999",
      priceSuffix: "/ month",
      subCaption:
        "Unlimited listings, campaigns, and push sends. Full power.",
      features: [
        "Unlimited active listings",
        "Unlimited campaigns — no annual cap",
        "50 Expired Offer Revivals / month",
        "Push notifications to customer segments",
        "Advanced analytics — revenue attribution, heatmap",
        "Priority 24h support • 14-day free trial",
      ],
      footerNote:
        "Commission rate locked for 12 months under Founding Program.",
      buttonText: "Select Pro — ₹2,999/mo",
      theme: "emerald",
      active: true,
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      badge: "Scale",
      priceText: "Custom pricing",
      originalPrice: "",
      priceSuffix: "",
      subCaption:
        "Dedicated manager. API access. Multi-location. Custom SLA.",
      features: [
        "Everything in Pro, all limits removed",
        "Dedicated named account manager",
        "Direct API access — POS and CRM integration",
        "Multi-location under one dashboard",
        "Custom SLA and guaranteed response times",
        "10% Year 1 discount under Founding Program",
      ],
      footerNote:
        "No self-serve signup. Our team contacts you within 24 hours.",
      buttonText: "Contact us — partners@vouchiqo.com",
      theme: "indigo",
      active: true,
    },
  ];
  const masterCpaRates = publicSettings?.master_cpa_rates || COMMISSION_TABLE;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState({});
  const [checkingExistingMerchant, setCheckingExistingMerchant] = useState(true);
  const [showMasterCpaTable, setShowMasterCpaTable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkExisting() {
      try {
        const isMerchantFlag =
          typeof window !== "undefined" &&
          sessionStorage.getItem("vouchiqo_is_merchant") === "true";

        const res = await fetch("/api/merchants/me");
        if (!res.ok) {
          if (isMerchantFlag && authUser) {
            router.replace("/merchant/dashboard");
            return;
          }
          if (isMounted) setCheckingExistingMerchant(false);
          return;
        }

        const json = await res.json();
        const merchant = json?.data?.merchant || json?.data;

        if (merchant && (merchant._id || merchant.status || merchant.businessName)) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("vouchiqo_is_merchant", "true");
          }
          if (merchant.status === "approved") {
            router.replace("/merchant/dashboard");
          } else {
            router.replace("/merchant/application-status");
          }
        } else {
          if (isMerchantFlag && authUser) {
            router.replace("/merchant/dashboard");
            return;
          }
          if (isMounted) setCheckingExistingMerchant(false);
        }
      } catch {
        if (isMounted) setCheckingExistingMerchant(false);
      }
    }

    checkExisting();

    return () => {
      isMounted = false;
    };
  }, [authUser, router]);

  // File Uploading States
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingShopPhoto, setUploadingShopPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  // Location Geolocation State
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Sub-category tags
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoryTags, setSubCategoryTags] = useState([
    "Dine-in Offers",
    "Special Combos",
  ]);

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const clearFieldError = (fieldName) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const [formData, setFormData] = useState({
    // Section A: Business Identity & Location
    registeredName: "",
    tradingName: "",
    constitution: "proprietorship",
    category: "food",
    customCategoryNotes: "",
    businessType: "Physical Store / Retail Shop",
    address: "",
    city: "Ranchi",
    state: "Jharkhand",
    pincode: "834001",
    latitude: "",
    longitude: "",

    // Section B: Contact & Account Setup
    contactName: "",
    designation: "owner",
    mobile: "",
    whatsapp: "",
    email: "",
    password: "",
    websiteUrl: "",
    instagramHandle: "",
    facebookUrl: "",
    googleUrl: "",

    // Section C: Documents & Uploads
    docType: "GST Registration Certificate",
    docFileUrl: "",
    shopPhotoUrl: "",
    logoUrl: "",
    bannerUrl: "",
    signatureUrl: "",

    // Section D: Plan
    selectedPlan: "starter",
    referralCode: "",

    // Section E: Commission & Hours
    commissionAgreed: false,
    openingTime: "10:00 AM",
    closingTime: "08:00 PM",
    operatingHours: {
      Monday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
      Tuesday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
      Wednesday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
      Thursday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
      Friday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
      Saturday: { isOpen: true, openTime: "10:00 AM", closeTime: "08:00 PM" },
      Sunday: { isOpen: true, openTime: "10:00 AM", closeTime: "11:00 PM" },
    },

    // Section F: Declarations
    commit1: false,
    commit2: false,
    commit3: false,
    commit4: false,
    commit5: false,
    commit6: false,
    commit7: false,
    policy1: false,
    policy2: false,
    policy3: false,
    policy4: false,
    policy5: false,
    signatoryName: "",
    digitalInitials: "",
  });

  const MASTER_STEPS = [
    { stepNum: 1, title: "Business & Location", label: "Sections A & B" },
    { stepNum: 2, title: "Documents & Plan", label: "Sections C & D" },
    { stepNum: 3, title: "Hours & Submit", label: "Sections E & F" },
  ];

  const handleFileUpload = async (file, targetField, setUploadingState) => {
    if (!file) return;
    setUploadingState(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "merchants");

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "Upload failed");
      }

      const json = await res.json();
      const fileUrl = json.data?.url;
      setFormData((prev) => ({ ...prev, [targetField]: fileUrl }));
      toast.success("File uploaded successfully!");
    } catch (err) {
      toast.error(err.message || "File upload failed.");
    } finally {
      setUploadingState(false);
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        setIsFetchingLocation(false);
        toast.success(
          `Location captured: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`,
        );
      },
      (err) => {
        setIsFetchingLocation(false);
        toast.error(
          "Could not fetch location. Please allow browser permissions.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && subCategoryInput.trim()) {
      e.preventDefault();
      if (!subCategoryTags.includes(subCategoryInput.trim())) {
        setSubCategoryTags([...subCategoryTags, subCategoryInput.trim()]);
      }
      setSubCategoryInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSubCategoryTags(subCategoryTags.filter((t) => t !== tagToRemove));
  };

  const customCategoryCharCount = (formData.customCategoryNotes || "").trim().length;

  const checkDuplicateField = async (field, value) => {
    if (!value || !value.trim()) {
      setDuplicateErrors((prev) => ({ ...prev, [field]: null }));
      return true;
    }
    try {
      const res = await fetch("/api/merchants/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, value }),
      });
      const json = await res.json();
      if (json.data && !json.data.available) {
        setDuplicateErrors((prev) => ({ ...prev, [field]: json.data.message }));
        toast.error(json.data.message);
        return false;
      } else {
        setDuplicateErrors((prev) => ({ ...prev, [field]: null }));
        return true;
      }
    } catch {
      return true;
    }
  };

  const handleAutoSuggestPassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnpqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "@#$%!&*=";
    const allChars = upper + lower + numbers + symbols;

    // Ensure at least one character from each set
    const pwdArr = [
      upper.charAt(Math.floor(Math.random() * upper.length)),
      lower.charAt(Math.floor(Math.random() * lower.length)),
      numbers.charAt(Math.floor(Math.random() * numbers.length)),
      symbols.charAt(Math.floor(Math.random() * symbols.length)),
    ];

    for (let i = 0; i < 8; i++) {
      pwdArr.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
    }

    // Shuffle array for randomness
    const suggested = pwdArr.sort(() => Math.random() - 0.5).join("");
    setFormData((prev) => ({ ...prev, password: suggested }));
    setShowPassword(true);
    toast.success(`Generated 12-char complex password!`);
  };

  const handleNext = async () => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.registeredName.trim()) {
        newErrors.registeredName = "Registered Business Name is required";
      }
      if (!formData.category) {
        newErrors.category = "Primary Category is required";
      }
      if (formData.category === "others") {
        if (!formData.customCategoryName?.trim()) {
          newErrors.customCategoryName = "Custom Category Name is required";
        }
        if (customCategoryCharCount < 80) {
          newErrors.customCategoryNotes = `At least ${80 - customCategoryCharCount} more character(s) required (minimum 80 chars).`;
        }
      }
      if (!formData.address.trim()) {
        newErrors.address = "Operating Store Address is required";
      }
      if (!formData.pincode || formData.pincode.length < 6) {
        newErrors.pincode = "Valid 6-digit PIN Code is required";
      }
      if (!formData.city.trim()) {
        newErrors.city = "City / District is required";
      }
      if (!formData.state.trim()) {
        newErrors.state = "State is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        toast.error("Please complete the required fields highlighted in red.");
        return;
      }
      setFieldErrors({});
    } else if (currentStep === 2) {
      if (!formData.contactName.trim()) {
        newErrors.contactName = "Authorised Liaison Name is required";
      }
      if (!formData.designation) {
        newErrors.designation = "Designation is required";
      }
      if (!formData.mobile.trim() || formData.mobile.length < 10) {
        newErrors.mobile = "Valid 10-digit Mobile Number is required";
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        newErrors.email = "Valid Business Email is required";
      }
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        toast.error("Please complete the required fields highlighted in red.");
        return;
      }
      setFieldErrors({});

      const emailOk = await checkDuplicateField("email", formData.email);
      const phoneOk = await checkDuplicateField("phone", formData.mobile);
      if (!emailOk || !phoneOk) return;
    } else if (currentStep === 3) {
      // Section C: Not mandatory at all
      setFieldErrors({});
    } else if (currentStep === 4) {
      if (!formData.selectedPlan) {
        newErrors.selectedPlan = "Please select a Merchant Plan";
        setFieldErrors(newErrors);
        toast.error("Please select a Merchant Plan");
        return;
      }
      setFieldErrors({});
    } else if (currentStep === 5) {
      if (!formData.commissionAgreed) {
        newErrors.commissionAgreed =
          "Please acknowledge and accept the performance commission structure to proceed";
        setFieldErrors(newErrors);
        toast.error(
          "Please acknowledge and accept the performance commission structure.",
        );
        return;
      }
      setFieldErrors({});
    }
    setCurrentStep((prev) => Math.min(6, prev + 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    commitmentItems.forEach((c, idx) => {
      if (c.required === false) return;
      const itemKey = c.key || `commit${idx + 1}`;
      const isChecked =
        !!formData[itemKey] || !!formData.commitmentsAccepted?.[c.id];
      if (!isChecked) {
        newErrors[itemKey] = true;
      }
    });

    policyItems.forEach((p, idx) => {
      if (p.required === false) return;
      const itemKey = p.key || `policy${idx + 1}`;
      const isChecked =
        !!formData[itemKey] || !!formData.policiesAccepted?.[p.id];
      if (!isChecked) {
        newErrors[itemKey] = true;
      }
    });

    const effectiveSignatoryName = (
      formData.contactName ||
      formData.signatoryName ||
      ""
    ).trim();
    if (!effectiveSignatoryName) {
      newErrors.contactName = "Please enter Authorized Liaison Name in Section B";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Please accept all mandatory agreements highlighted with red outlines.");
      return;
    }
    setFieldErrors({});

    setIsSubmitting(true);
    try {
      if (!authUser) {
        const { data, error } = await signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.tradingName || formData.registeredName,
          data: {
            role: "merchant",
            phoneNumber: formData.mobile,
          },
        });

        if (
          error &&
          !error.message?.includes("already registered") &&
          !error.message?.includes("already exists")
        ) {
          throw new Error(error.message || "Registration failed.");
        }
      }

      const cleanPhone = (p) => (p || "").replace(/\D/g, "").slice(-10);
      const cleanUrl = (u) => {
        if (!u || !u.trim()) return "";
        const trimmed = u.trim();
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      };

      const merchantPayload = {
        businessName: formData.tradingName || formData.registeredName,
        slug:
          (formData.tradingName || formData.registeredName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 50) || "merchant",
        category: formData.category,
        customCategoryNotes: formData.customCategoryNotes,
        constitution: formData.constitution,
        location: {
          address: formData.address,
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
          country: "IN",
          coordinates: {
            lat: formData.latitude ? Number(formData.latitude) : undefined,
            lng: formData.longitude ? Number(formData.longitude) : undefined,
          },
        },
        contactEmail: (formData.email || authUser?.email || "").toLowerCase().trim(),
        password: formData.password || undefined,
        contactPhone: cleanPhone(formData.mobile || authUser?.phoneNumber),
        whatsappNumber: cleanPhone(formData.whatsapp || formData.mobile),
        website: cleanUrl(formData.websiteUrl),
        liaisonName: effectiveSignatoryName,
        signatoryName: effectiveSignatoryName,
        liaisonDesignation: formData.designation,
        liaisonPhone: cleanPhone(formData.mobile),
        docType: formData.docType,
        docImage: formData.docFileUrl,
        docFileUrl: formData.docFileUrl,
        shopImage: formData.shopPhotoUrl,
        shopPhotoUrl: formData.shopPhotoUrl,
        logo: formData.logoUrl,
        logoUrl: formData.logoUrl,
        banner: formData.bannerUrl,
        bannerUrl: formData.bannerUrl,
        plan: formData.selectedPlan,
        commissionRate: (() => {
          const matchedComm = masterCpaRates.find(
            (c) =>
              (c.id && c.id === formData.category) ||
              c.category.toLowerCase().includes(formData.category.toLowerCase()) ||
              c.category.toLowerCase().startsWith(formData.category.slice(0, 4).toLowerCase()),
          );
          return matchedComm ? matchedComm.rate : "3% – 5%";
        })(),
        commissionModel: (() => {
          const matchedComm = masterCpaRates.find(
            (c) =>
              (c.id && c.id === formData.category) ||
              c.category.toLowerCase().includes(formData.category.toLowerCase()) ||
              c.category.toLowerCase().startsWith(formData.category.slice(0, 4).toLowerCase()),
          );
          return matchedComm ? matchedComm.model : "CPA";
        })(),
        commissionAgreed: formData.commissionAgreed,
        gmapsLink: cleanUrl(formData.googleUrl),
        operatingHours: formData.operatingHours,
      };

      const merchantRes = await fetch("/api/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merchantPayload),
      });

      if (!merchantRes.ok) {
        const errJson = await merchantRes.json().catch(() => ({}));
        throw new Error(
          errJson.message ||
            errJson.error ||
            "Failed to submit merchant application.",
        );
      }

      try {
        await authClient.getSession({ query: { disableCookieCache: true } });
      } catch (_) {}

      await queryClient.invalidateQueries({
        queryKey: ["merchant-application-status"],
      });
      await queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      await queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });

      if (typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
      }

      toast.success(
        "Application submitted! Welcome to Vouchiqo for Merchants.",
      );

      router.push("/merchant/application-status");
    } catch (err) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeMasterStep = currentStep <= 2 ? 1 : currentStep <= 4 ? 2 : 3;

  if (checkingExistingMerchant) {
    return (
      <div className="py-24 text-center flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm max-w-xl mx-auto my-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-700">
          Checking merchant account status...
        </p>
      </div>
    );
  }

  const shadowInputClass =
    "pl-8 bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus:outline-none transition-all duration-150 text-xs h-9 rounded-lg font-normal text-slate-900 placeholder:text-slate-400";
  const shadowSelectClass =
    "w-full bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] hover:shadow-[0_3px_10px_rgba(37,99,235,0.14)] hover:border-blue-400 rounded-lg text-xs h-9 px-3 font-normal text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_2px_12px_rgba(37,99,235,0.22)] focus:outline-none transition-all duration-150";

  const getLabelClass = (fieldName, defaultClass = "text-xs font-medium text-slate-700") => {
    if (fieldErrors[fieldName]) {
      return "text-xs font-bold text-slate-900 transition-all";
    }
    return defaultClass;
  };

  const getInputClass = (fieldName, defaultClass = shadowInputClass) => {
    if (fieldErrors[fieldName]) {
      return "pl-8 bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 text-xs h-9 rounded-lg font-normal placeholder:text-slate-400 focus:outline-none transition-all";
    }
    return defaultClass;
  };

  const getSelectClass = (fieldName, defaultClass = shadowSelectClass) => {
    if (fieldErrors[fieldName]) {
      return "w-full bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 text-xs h-9 px-3 font-normal focus:outline-none transition-all";
    }
    return defaultClass;
  };

  const getTextareaClass = (fieldName, defaultClass = "bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] text-xs rounded-lg font-normal placeholder:text-slate-400 hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25 transition-all") => {
    if (fieldErrors[fieldName]) {
      return "bg-rose-50/30 border-2 border-rose-500 text-slate-900 shadow-[0_2px_8px_rgba(244,63,94,0.12)] text-xs rounded-lg font-normal placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/25 transition-all";
    }
    return defaultClass;
  };

  return (
    <div className="w-full max-w-full space-y-3 text-left font-sans text-slate-900 pb-0">
      {/* Header Banner & Stepper Bar */}
      <div className="bg-white border border-slate-200/90 shadow-sm rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Merchant Onboarding Application
              </h1>
              <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
                Founding Partner
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Fill in your store details to list offers and reach Ranchi shoppers • Rates locked for 6 months • ₹0 Starter plan available
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 p-1.5 rounded-lg border border-slate-200/80">
            <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-md shadow-2xs border border-blue-100">
              Section {currentStep} of 6
            </span>
            <span className="text-[11px] font-semibold text-slate-600 px-1">
              {Math.round((currentStep / 6) * 100)}% Complete
            </span>
          </div>
        </div>

        {/* Stepper Horizontal Navigation Bar - Vibrant Colorful Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MASTER_STEPS.map((m) => {
            const isActive = activeMasterStep === m.stepNum;
            const isCompleted = activeMasterStep > m.stepNum;

            const colorThemes = {
              1: {
                active: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-blue-500/25 border-0 ring-2 ring-blue-500/30",
                completed: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-0",
                upcoming: "bg-blue-50/80 border-blue-200/80 text-blue-950 hover:bg-blue-100/70 hover:border-blue-300",
                numberActive: "bg-white text-blue-700 font-extrabold shadow-2xs",
                numberCompleted: "bg-white text-emerald-700 font-extrabold shadow-2xs",
                numberUpcoming: "bg-blue-100/90 text-blue-700 font-bold border border-blue-200/80",
                labelActive: "text-blue-100 font-semibold",
                labelCompleted: "text-emerald-100 font-semibold",
                labelUpcoming: "text-blue-700/80 font-semibold",
              },
              2: {
                active: "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/25 border-0 ring-2 ring-purple-500/30",
                completed: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-0",
                upcoming: "bg-purple-50/80 border-purple-200/80 text-purple-950 hover:bg-purple-100/70 hover:border-purple-300",
                numberActive: "bg-white text-purple-700 font-extrabold shadow-2xs",
                numberCompleted: "bg-white text-emerald-700 font-extrabold shadow-2xs",
                numberUpcoming: "bg-purple-100/90 text-purple-700 font-bold border border-purple-200/80",
                labelActive: "text-purple-100 font-semibold",
                labelCompleted: "text-emerald-100 font-semibold",
                labelUpcoming: "text-purple-700/80 font-semibold",
              },
              3: {
                active: "bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white shadow-md shadow-orange-500/25 border-0 ring-2 ring-orange-500/30",
                completed: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm border-0",
                upcoming: "bg-amber-50/80 border-amber-200/80 text-amber-950 hover:bg-amber-100/70 hover:border-amber-300",
                numberActive: "bg-white text-orange-700 font-extrabold shadow-2xs",
                numberCompleted: "bg-white text-emerald-700 font-extrabold shadow-2xs",
                numberUpcoming: "bg-amber-100/90 text-amber-800 font-bold border border-amber-200/80",
                labelActive: "text-amber-100 font-semibold",
                labelCompleted: "text-emerald-100 font-semibold",
                labelUpcoming: "text-amber-700/80 font-semibold",
              },
            };

            const theme = colorThemes[m.stepNum] || colorThemes[1];
            const containerStyle = isActive
              ? theme.active
              : isCompleted
                ? theme.completed
                : theme.upcoming;

            const numberStyle = isActive
              ? theme.numberActive
              : isCompleted
                ? theme.numberCompleted
                : theme.numberUpcoming;

            const labelStyle = isActive
              ? theme.labelActive
              : isCompleted
                ? theme.labelCompleted
                : theme.labelUpcoming;

            return (
              <div
                key={m.stepNum}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 ${containerStyle}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${numberStyle}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    m.stepNum
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-[9.5px] uppercase tracking-wider block leading-none truncate ${labelStyle}`}
                  >
                    Step {m.stepNum}: {m.label}
                  </span>
                  <span
                    className={`text-xs font-bold block leading-tight truncate mt-0.5 ${
                      isActive || isCompleted ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {m.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: BUSINESS IDENTITY & LOCATION */}
      {currentStep === 1 && (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section A: Business Identity &amp; Location
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Enter legal registered name and store operating address
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 1 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            {/* 4-Column Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("registeredName")}>
                  Registered Business Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.registeredName ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type="text"
                    placeholder="Marbella Tiles & Sanitary Pvt Ltd"
                    value={formData.registeredName}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        registeredName: e.target.value,
                      });
                      clearFieldError("registeredName");
                    }}
                    className={getInputClass("registeredName")}
                  />
                </div>
                {fieldErrors.registeredName ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.registeredName}</p>
                ) : (
                  <FieldTip text="Used for official business verification & tax invoicing." />
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Brand / Store Display Name <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Store className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Marbella"
                    value={formData.tradingName}
                    onChange={(e) =>
                      setFormData({ ...formData, tradingName: e.target.value })
                    }
                    className={shadowInputClass}
                  />
                </div>
                <FieldTip text="Customer-facing store name on deal cards & vouchers." />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Business Constitution <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.constitution}
                  onValueChange={(val) =>
                    setFormData({ ...formData, constitution: val })
                  }
                >
                  <SelectTrigger className={shadowSelectClass}>
                    <SelectValue placeholder="Select constitution" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {BUSINESS_CONSTITUTIONS.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldTip text="Determines statutory compliance requirements." />
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("category")}>
                  Primary Category <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) => {
                    setFormData({ ...formData, category: val });
                    clearFieldError("category");
                  }}
                >
                  <SelectTrigger className={getSelectClass("category")}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.category ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.category}</p>
                ) : (
                  <FieldTip text="Places your store in the correct offer section." />
                )}
              </div>
            </div>

            {/* Special Category Custom Field */}
            {formData.category === "others" && (
              <div className="space-y-3 p-3 bg-blue-50/60 border border-blue-200 rounded-lg">
                <div className="space-y-1">
                  <Label className={getLabelClass("customCategoryName", "text-xs font-semibold text-blue-950")}>
                    Custom Category Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Handmade Crafts, Event Management..."
                    value={formData.customCategoryName || ""}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        customCategoryName: e.target.value,
                      });
                      clearFieldError("customCategoryName");
                    }}
                    className={getInputClass("customCategoryName", "bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] text-xs rounded-lg h-9 px-3 font-normal text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/25")}
                  />
                  {fieldErrors.customCategoryName && (
                    <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.customCategoryName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className={getLabelClass("customCategoryNotes", "text-xs font-semibold text-blue-950")}>
                      Explain your business in detail <span className="text-rose-500">*</span>
                    </Label>
                    <span
                      className={`text-[11px] font-mono ${
                        customCategoryCharCount >= 80
                          ? "text-emerald-700 font-bold"
                          : "text-amber-700 font-semibold"
                      }`}
                    >
                      Characters: {customCategoryCharCount} / 80 min
                    </span>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Describe your offerings, unique products, services and store operational setup in detail (minimum 80 characters required)..."
                    value={formData.customCategoryNotes}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        customCategoryNotes: e.target.value,
                      });
                      clearFieldError("customCategoryNotes");
                    }}
                    className={getTextareaClass("customCategoryNotes")}
                  />
                  {fieldErrors.customCategoryNotes ? (
                    <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.customCategoryNotes}</p>
                  ) : customCategoryCharCount < 80 ? (
                    <p className="text-[10px] text-amber-700 font-medium">
                      ⚠️ Please write at least {80 - customCategoryCharCount} more character(s)
                      explaining your business.
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {/* Sub-Category Chips */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-700">
                Sub-Category Tags Chips (Press Enter)
              </Label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-white border-2 border-blue-300/80 shadow-[0_2px_6px_rgba(37,99,235,0.08)] rounded-lg min-h-[38px] items-center focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/25 focus-within:shadow-[0_2px_12px_rgba(37,99,235,0.22)] transition-all">
                {subCategoryTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-slate-100 text-slate-800 border-slate-200 text-xs font-medium py-0.5 px-2 flex items-center gap-1 shadow-2xs"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  type="text"
                  placeholder="Type tag & press Enter..."
                  value={subCategoryInput}
                  onChange={(e) => setSubCategoryInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="bg-transparent text-xs outline-none flex-1 min-w-[140px] font-normal text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <FieldTip text="Helps shoppers find your specific offers using search & filter keywords." />
            </div>

            {/* Operating Address & GMB Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("address")}>
                  Operating Store Address <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  rows={2}
                  placeholder="Shop No. 14, Lalpur Chowk, Main Road, Ranchi, Jharkhand – 834001"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    clearFieldError("address");
                  }}
                  className={getTextareaClass("address")}
                />
                {fieldErrors.address ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.address}</p>
                ) : (
                  <FieldTip text="Customers will visit this exact address to redeem in-store vouchers." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("googleUrl")}>
                  Google Maps / GMB Profile Location Link <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  rows={2}
                  placeholder="https://maps.google.com/?q=... or GMB Profile Link"
                  value={formData.googleUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, googleUrl: e.target.value });
                    clearFieldError("googleUrl");
                  }}
                  className={getTextareaClass("googleUrl")}
                />
                {fieldErrors.googleUrl ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.googleUrl}</p>
                ) : (
                  <FieldTip text="Powers 1-tap Google Maps directions on deal vouchers." />
                )}
              </div>
            </div>

            {/* Geo & Pin Code Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("pincode")}>
                  PIN Code <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Hash className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.pincode ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="834001"
                    value={formData.pincode}
                    onChange={async (e) => {
                      const pin = e.target.value;
                      setFormData((prev) => ({ ...prev, pincode: pin }));
                      clearFieldError("pincode");
                      if (pin.length === 6) {
                        const geo = await lookupByPincode(pin);
                        if (geo) {
                          setFormData((prev) => ({
                            ...prev,
                            city: geo.city || prev.city,
                            state: geo.state || prev.state,
                          }));
                        }
                      }
                    }}
                    className={getInputClass("pincode")}
                  />
                </div>
                {fieldErrors.pincode ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.pincode}</p>
                ) : (
                  <FieldTip text="Groups your store under pin code offer filters." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("city")}>
                  City / District <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => {
                    const geo = lookupStateByCity(val);
                    setFormData((prev) => ({
                      ...prev,
                      city: val,
                      state: geo ? geo.state : prev.state,
                      pincode:
                        geo && !prev.pincode ? geo.pincode : prev.pincode,
                    }));
                    clearFieldError("city");
                  }}
                >
                  <SelectTrigger className={getSelectClass("city")}>
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {INDIAN_CITIES.map((c) => (
                      <SelectItem
                        key={`${c.city}-${c.state}`}
                        value={c.city}
                        className="text-xs"
                      >
                        {c.city} ({c.state})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.city ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.city}</p>
                ) : (
                  <FieldTip text="Lists your store under regional city offer hubs." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("state")}>
                  State <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Map className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.state ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type="text"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      clearFieldError("state");
                    }}
                    className={getInputClass("state")}
                  />
                </div>
                {fieldErrors.state ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.state}</p>
                ) : (
                  <FieldTip text="Required for state GST & statutory compliance." />
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Store GPS Location <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-300/80 font-semibold text-xs h-9 rounded-lg cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                >
                  {isFetchingLocation ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>
                    {formData.latitude ? "GPS Captured ✓" : "Fetch GPS Coordinates"}
                  </span>
                </Button>
                {formData.latitude && formData.longitude ? (
                  <FieldTip text={`Captured: ${formData.latitude}° N, ${formData.longitude}° E`} />
                ) : (
                  <FieldTip text="Auto-detect exact lat & lng for maps navigation." />
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 2: CONTACT & ACCOUNT SETUP */}
      {currentStep === 2 && (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section B: Contact Details &amp; Account Setup
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Management liaison contact and account login password
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 2 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            {/* 4-Column Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("contactName")}>
                  Authorized Liaison Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.contactName ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type="text"
                    placeholder="Rajan Kumar Singh"
                    value={formData.contactName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        contactName: val,
                        signatoryName: val,
                      }));
                      clearFieldError("contactName");
                    }}
                    className={getInputClass("contactName")}
                  />
                </div>
                {fieldErrors.contactName ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.contactName}</p>
                ) : (
                  <FieldTip text="Person managing store offers & official updates." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("designation")}>
                  Designation <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={formData.designation}
                  onValueChange={(val) => {
                    setFormData({ ...formData, designation: val });
                    clearFieldError("designation");
                  }}
                >
                  <SelectTrigger className={getSelectClass("designation")}>
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    {DESIGNATIONS.map((d) => (
                      <SelectItem key={d.id} value={d.id} className="text-xs">
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.designation ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.designation}</p>
                ) : (
                  <FieldTip text="Signatory privileges for partnership agreements." />
                )}
              </div>

              <div className="space-y-1">
                <Label className={getLabelClass("mobile")}>
                  Primary Mobile Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.mobile ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, mobile: e.target.value });
                      clearFieldError("mobile");
                    }}
                    className={getInputClass("mobile")}
                  />
                </div>
                {fieldErrors.mobile ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.mobile}</p>
                ) : (
                  <FieldTip text="Used for account security OTPs & deal alerts." />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-slate-700">
                    WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.mobile) {
                        toast.error("Please enter Primary Mobile Number first.");
                        return;
                      }
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: prev.mobile,
                      }));
                      toast.success("Copied Mobile to WhatsApp!");
                    }}
                    className="text-[9.5px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                  >
                    Same as Mobile
                  </button>
                </div>
                <div className="relative">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className={shadowInputClass}
                  />
                </div>
                <FieldTip text="Sends instant offer claim notifications." />
              </div>
            </div>

            {/* Email & Password (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={getLabelClass("email")}>
                  Business Email (Login ID) <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.email ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type="email"
                    placeholder="info@marbella.in"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      clearFieldError("email");
                    }}
                    className={getInputClass("email")}
                  />
                </div>
                {fieldErrors.email ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.email}</p>
                ) : (
                  <FieldTip text="Your primary account login email for accessing Merchant panel." />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className={getLabelClass("password")}>
                    Create Password <span className="text-rose-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={handleAutoSuggestPassword}
                    className="text-[10px] text-blue-700 hover:text-blue-900 font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>⚡ Auto-Suggest Password</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${fieldErrors.password ? "text-rose-500" : "text-slate-400"}`} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      clearFieldError("password");
                    }}
                    className={getInputClass("password") + " pr-9"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password ? (
                  <p className="text-[11px] font-normal text-rose-600 mt-0.5">{fieldErrors.password}</p>
                ) : (
                  <FieldTip text="Security password for signing into merchant dashboard." />
                )}
              </div>
            </div>

            {/* Social Web Links (3 Columns) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
                Web Presence &amp; Social Links (Optional)
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Website URL
                  </Label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://www.marbella.in"
                      value={formData.websiteUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, websiteUrl: e.target.value })
                      }
                      className={shadowInputClass}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Instagram Handle
                  </Label>
                  <div className="relative">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="@marbellatiles"
                      value={formData.instagramHandle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          instagramHandle: e.target.value,
                        })
                      }
                      className={shadowInputClass}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-medium text-slate-600">
                    Facebook URL
                  </Label>
                  <div className="relative">
                    <FacebookIcon className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="url"
                      placeholder="https://facebook.com/marbellatiles"
                      value={formData.facebookUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          facebookUrl: e.target.value,
                        })
                      }
                      className={shadowInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 3: BUSINESS VERIFICATION DOCUMENTS */}
      {currentStep === 3 && (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section C: Business Verification Documents (Optional)
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Upload identity proof now or later from your Merchant Dashboard
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-amber-200 bg-amber-50 text-amber-800"
            >
              Optional Section
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Primary Document Type & Upload Box (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Primary Identity Document Type <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Select
                  value={formData.docType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, docType: val })
                  }
                >
                  <SelectTrigger className={shadowSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[300]">
                    <SelectItem value="GST Registration Certificate" className="text-xs">
                      GST Registration Certificate (Preferred)
                    </SelectItem>
                    <SelectItem value="Udyam / MSME Certificate" className="text-xs">
                      Udyam / MSME Registration Certificate
                    </SelectItem>
                    <SelectItem value="Trade Licence" className="text-xs">
                      Trade Licence (Municipal Corporation)
                    </SelectItem>
                    <SelectItem value="Shop & Establishment Act" className="text-xs">
                      Shop &amp; Establishment Act Certificate
                    </SelectItem>
                    <SelectItem value="Owner PAN Card" className="text-xs">
                      Owner PAN Card
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FieldTip text="Used for official Blue Verified Merchant badge." />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Upload {formData.docType || "Identity Document"} <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <div className="h-9 px-3 bg-white border-2 border-dashed border-blue-300/80 hover:border-blue-400 rounded-lg flex items-center justify-between gap-2 shadow-[0_2px_6px_rgba(37,99,235,0.08)] transition-all">
                  {formData.docFileUrl ? (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <a
                        href={formData.docFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 underline font-medium truncate"
                      >
                        Document Uploaded ✓
                      </a>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-normal truncate">
                      Select document file (JPG, PNG, PDF up to 5 MB)
                    </span>
                  )}
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "docFileUrl",
                          setUploadingDoc,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingDoc}
                    />
                    <Button
                      type="button"
                      disabled={uploadingDoc}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs h-6 px-2.5 rounded border-0 cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      {uploadingDoc ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>{formData.docFileUrl ? "Change" : "Upload"}</span>
                    </Button>
                  </div>
                </div>
                <FieldTip text="Supports PDF, PNG, JPG up to 5 MB." />
              </div>
            </div>

            {/* 3 Store Visual Images Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* 1. Shop Photograph */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Shop Photo
                  </span>
                </div>
                <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 h-28 overflow-hidden shadow-2xs transition-all">
                  {formData.shopPhotoUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.shopPhotoUrl}
                        alt="Shop Photo"
                        className="max-h-12 max-w-full object-contain rounded border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Photo Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0.5">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Shop Photo
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "shopPhotoUrl",
                          setUploadingShopPhoto,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingShopPhoto}
                    />
                    <Button
                      type="button"
                      disabled={uploadingShopPhoto}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingShopPhoto ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.shopPhotoUrl ? "Change Photo (1200×800)" : "Upload Photo (1200×800)"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 2. Store Logo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Store Logo
                  </span>
                </div>
                <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 h-28 overflow-hidden shadow-2xs transition-all">
                  {formData.logoUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.logoUrl}
                        alt="Store Logo"
                        className="max-h-12 max-w-full object-contain rounded border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Logo Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0.5">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Store Logo
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "logoUrl",
                          setUploadingLogo,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      disabled={uploadingLogo}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.logoUrl ? "Change Logo (400×400)" : "Upload Logo (400×400)"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* 3. Banner Image */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    Banner Image
                  </span>
                </div>
                <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:bg-blue-50/30 hover:border-blue-400 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1.5 h-28 overflow-hidden shadow-2xs transition-all">
                  {formData.bannerUrl ? (
                    <div className="space-y-1 w-full flex flex-col items-center">
                      <img
                        src={formData.bannerUrl}
                        alt="Banner Image"
                        className="max-h-12 max-w-full object-contain rounded border border-slate-200 bg-white p-0.5"
                      />
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Banner Uploaded
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-0.5">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-500 font-medium">
                        Upload Banner Image
                      </span>
                    </div>
                  )}
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          e.target.files[0],
                          "bannerUrl",
                          setUploadingBanner,
                        )
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      disabled={uploadingBanner}
                    />
                    <Button
                      type="button"
                      disabled={uploadingBanner}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] h-7 rounded-lg border-0 cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                    >
                      {uploadingBanner ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Upload className="w-3 h-3" />
                      )}
                      <span>
                        {formData.bannerUrl ? "Change Banner (1200×400)" : "Upload Banner (1200×400)"}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 4: PLAN SELECTION */}
      {currentStep === 4 && (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section D: Select Subscription Plan
              </h3>
              <p className="text-xs text-emerald-700 font-medium">
                Select your plan below — No payment is initiated today during registration (14-day instant free trial on paid plans)
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-semibold border-emerald-300 bg-emerald-50 text-emerald-800"
            >
              No Payment Required Today
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {merchantPlans
              .filter((p) => p.active !== false)
              .map((plan) => {
                const isSelected = formData.selectedPlan === plan.id;

                let bgTheme = "bg-sky-50/60 border-sky-200/90 hover:border-sky-300";
                let badgeTheme = "bg-sky-100 text-sky-800 border-sky-200";
                let btnTheme = "bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-50";

                if (plan.theme === "orange" || plan.id === "growth") {
                  bgTheme = "bg-amber-50/60 border-amber-200/90 hover:border-amber-300";
                  badgeTheme = "bg-amber-100 text-amber-800 border-amber-200";
                  btnTheme = "bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-xs";
                } else if (plan.theme === "emerald" || plan.id === "pro") {
                  bgTheme = "bg-emerald-50/60 border-emerald-200/90 hover:border-emerald-300";
                  badgeTheme = "bg-emerald-100 text-emerald-800 border-emerald-200";
                  btnTheme = "bg-slate-900 hover:bg-slate-800 text-white border-0 shadow-xs";
                } else if (plan.theme === "indigo" || plan.id === "enterprise") {
                  bgTheme = "bg-indigo-50/60 border-indigo-200/90 hover:border-indigo-300";
                  badgeTheme = "bg-indigo-100 text-indigo-800 border-indigo-200";
                  btnTheme = "bg-white text-indigo-700 border-2 border-indigo-300 hover:bg-indigo-50";
                }

                return (
                  <div
                    key={plan.id}
                    onClick={() =>
                      setFormData({ ...formData, selectedPlan: plan.id })
                    }
                    className={`p-4 sm:p-5 rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-2 border-blue-600 shadow-xl ring-4 ring-blue-500/20 bg-white scale-[1.01]"
                        : `border ${bgTheme} shadow-2xs`
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Plan Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                              {plan.name}
                            </h4>
                            {isSelected && (
                              <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                            )}
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-2xl font-extrabold text-slate-900">
                              {plan.priceText ||
                                (typeof plan.priceMonthly === "number"
                                  ? plan.priceMonthly === 0
                                    ? "₹0"
                                    : `₹${plan.priceMonthly.toLocaleString("en-IN")}`
                                  : "Custom pricing")}
                            </span>
                            {plan.originalPrice && (
                              <span className="text-xs line-through text-slate-400 font-medium">
                                {plan.originalPrice}
                              </span>
                            )}
                            {plan.priceSuffix && (
                              <span className="text-xs font-normal text-slate-500">
                                {plan.priceSuffix}
                              </span>
                            )}
                          </div>
                          {plan.subCaption && (
                            <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                              {plan.subCaption}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {isSelected ? (
                            <Badge className="bg-blue-600 text-white font-bold text-[9.5px] px-2.5 py-0.5 shadow-sm border-0 flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" /> SELECTED
                            </Badge>
                          ) : plan.badge ? (
                            <Badge
                              variant="outline"
                              className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border ${badgeTheme}`}
                            >
                              {plan.badge}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {/* Feature Bullet List */}
                      {plan.features && plan.features.length > 0 && (
                        <ul className="space-y-1.5 pt-2 border-t border-slate-200/60">
                          {plan.features.map((feat, fIdx) => (
                            <li
                              key={fIdx}
                              className="text-[11.5px] text-slate-700 font-normal flex items-start gap-1.5 leading-snug"
                            >
                              <span className="text-slate-400 font-bold leading-none mt-0.5">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="space-y-2 pt-3">
                      {plan.footerNote && (
                        <p className="text-[10px] text-slate-500 font-normal italic">
                          {plan.footerNote}
                        </p>
                      )}
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, selectedPlan: plan.id });
                        }}
                        className={`w-full h-9 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-md shadow-blue-500/25"
                            : btnTheme
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Selected {plan.name}</span>
                          </>
                        ) : (
                          <span>{plan.buttonText || "Select Plan"}</span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="space-y-1 max-w-sm pt-1">
            <Label className="text-xs font-medium text-slate-700">
              Referral Code (Optional)
            </Label>
            <div className="relative">
              <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="FOUNDING100"
                value={formData.referralCode}
                onChange={(e) =>
                  setFormData({ ...formData, referralCode: e.target.value })
                }
                className="pl-8 bg-white border border-slate-200/90 shadow-2xs text-xs h-9 rounded-lg font-mono uppercase font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 5: COMMISSION & HOURS */}
      {currentStep === 5 && (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section E: Category Commission &amp; Store Hours (Optional)
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Category commission structure and store opening timings (Default 10 AM - 9 PM applied)
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-amber-200 bg-amber-50 text-amber-800"
            >
              Optional Section
            </Badge>
          </div>

          <div className="space-y-3">
            {(() => {
              const selectedCatObj = CATEGORIES.find(
                (c) => c.id === formData.category,
              );
              const selectedCatLabel = selectedCatObj
                ? selectedCatObj.label
                : "Selected Category";
              const matchedComm = masterCpaRates.find(
                (c) =>
                  (c.id && c.id === formData.category) ||
                  c.category.toLowerCase().includes(formData.category.toLowerCase()) ||
                  c.category.toLowerCase().startsWith(formData.category.slice(0, 4).toLowerCase()),
              ) || {
                category: selectedCatLabel,
                rate: "3% – 5% blended rate",
                model: "CPA",
                notes: "Category performance rate",
              };

              return (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <Label className="text-[11px] font-extrabold text-blue-950 uppercase tracking-wider block">
                      PERFORMANCE COMMISSION RATE ({selectedCatLabel.toUpperCase()})
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowMasterCpaTable(!showMasterCpaTable)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-800 underline cursor-pointer"
                    >
                      {showMasterCpaTable ? "Hide Master CPA Table" : "View Full Master CPA Table (15 Categories)"}
                    </button>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-blue-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {selectedCatLabel}:
                      </span>
                      <span className="font-mono text-xs text-blue-700 font-extrabold px-3 py-1 rounded-md bg-blue-50 border border-blue-200">
                        {matchedComm.rate}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 mt-1.5">
                      <span className="font-medium">
                        Model: <strong className="text-slate-900">{matchedComm.model || "CPA"}</strong>
                      </span>
                      {matchedComm.notes && (
                        <span className="italic text-slate-500 font-normal">
                          Notes: {matchedComm.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable Master CPA Rate Table matching exact user design screenshot */}
                  {showMasterCpaTable && (
                    <div className="pt-2 space-y-2">
                      <div className="border-b border-blue-200 pb-1 flex justify-between items-center">
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                          The Master CPA Rate Table
                        </h4>
                        <span className="text-[10px] text-slate-500 italic">
                          Single reference document for all merchant conversations
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="px-2.5 py-1.5 text-center w-8">#</th>
                              <th className="px-2.5 py-1.5 font-bold">Category</th>
                              <th className="px-2.5 py-1.5 font-bold">Base CPA / CPL</th>
                              <th className="px-2.5 py-1.5 font-bold">Model</th>
                              <th className="px-2.5 py-1.5 font-bold">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {masterCpaRates.map((row, idx) => (
                              <tr
                                key={row.id || idx}
                                className={
                                  row.category.toLowerCase().includes(formData.category.toLowerCase()) ||
                                  (row.id && row.id === formData.category)
                                    ? "bg-blue-50/90 font-bold text-blue-900"
                                    : "hover:bg-slate-50/60 text-slate-700"
                                }
                              >
                                <td className="px-2.5 py-1.5 text-center font-mono text-[10px]">
                                  {idx + 1}
                                </td>
                                <td className="px-2.5 py-1.5 font-medium">{row.category}</td>
                                <td className="px-2.5 py-1.5 font-mono text-blue-700 font-semibold">
                                  {row.rate}
                                </td>
                                <td className="px-2.5 py-1.5 font-semibold text-slate-800">
                                  {row.model}
                                </td>
                                <td className="px-2.5 py-1.5 text-[11px] text-slate-600 italic">
                                  {row.notes}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                fieldErrors.commissionAgreed
                  ? "bg-red-50/50 border-red-400"
                  : "bg-blue-50/50 border-blue-200/80 text-slate-900"
              }`}
            >
              <Checkbox
                checked={formData.commissionAgreed}
                onCheckedChange={(val) => {
                  setFormData({ ...formData, commissionAgreed: !!val });
                  if (val && fieldErrors.commissionAgreed) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      commissionAgreed: null,
                    }));
                  }
                }}
                className={
                  fieldErrors.commissionAgreed ? "border-red-500" : ""
                }
              />
              <span className="text-xs font-normal text-slate-800">
                I acknowledge and accept the Vouchiqo performance commission
                structure for my primary category.{" "}
                <span className="text-red-600 font-bold">*</span>
              </span>
            </label>
            {fieldErrors.commissionAgreed && (
              <p className="text-xs text-red-600 font-normal mt-1">
                Please acknowledge and accept the performance commission structure to proceed
              </p>
            )}

            {/* Weekly Store Operating Hours Schedule */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
                    Weekly Store Operating Hours Schedule
                  </Label>
                  <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                    Select store opening &amp; closing timings per day (Default 10:00 AM – 08:00 PM).
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const monData = formData.operatingHours?.Monday || {
                      isOpen: true,
                      openTime: "10:00 AM",
                      closeTime: "08:00 PM",
                    };
                    const updatedHours = {};
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].forEach((d) => {
                      updatedHours[d] = {
                        isOpen: true,
                        openTime: monData.openTime,
                        closeTime: monData.closeTime,
                      };
                    });
                    setFormData((prev) => ({
                      ...prev,
                      operatingHours: updatedHours,
                    }));
                    toast.success("Applied Monday operating hours to all 7 days!");
                  }}
                  className="text-[10.5px] font-bold text-blue-700 border-blue-200 hover:bg-blue-50 h-7 px-2.5 rounded-lg cursor-pointer self-start sm:self-auto"
                >
                  Apply Monday Hours to All Days
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const dayData = formData.operatingHours?.[day] || {
                    isOpen: true,
                    openTime: "10:00 AM",
                    closeTime: day === "Sunday" ? "11:00 PM" : "08:00 PM",
                  };

                  const currentOpen = normalizeTimeFormat(dayData.openTime, "10:00 AM");
                  const currentClose = normalizeTimeFormat(dayData.closeTime, "08:00 PM");

                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-lg border transition-all flex flex-col justify-between gap-1.5 ${
                        dayData.isOpen
                          ? "bg-white border-slate-200/90 shadow-2xs"
                          : "bg-slate-100/80 border-slate-200 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`day-${day}`}
                            checked={dayData.isOpen}
                            onCheckedChange={(checked) => {
                              setFormData((prev) => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: {
                                    ...dayData,
                                    isOpen: !!checked,
                                  },
                                },
                              }));
                            }}
                          />
                          <label
                            htmlFor={`day-${day}`}
                            className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                          >
                            {day}
                          </label>
                        </div>
                        <Badge
                          className={`text-[9px] font-bold border-0 px-1.5 py-0 ${
                            dayData.isOpen
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {dayData.isOpen ? "OPEN" : "CLOSED"}
                        </Badge>
                      </div>

                      {dayData.isOpen ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <select
                            value={currentOpen}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: { ...dayData, openTime: val },
                                },
                              }));
                            }}
                            className="w-full h-7 text-[11px] bg-white border border-slate-200/90 shadow-2xs rounded px-1.5 font-mono text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {STANDARD_TIME_OPTIONS.map((tOpt) => (
                              <option key={`open-${tOpt}`} value={tOpt}>
                                {tOpt}
                              </option>
                            ))}
                          </select>
                          <span className="text-slate-400 font-bold text-xs">–</span>
                          <select
                            value={currentClose}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                operatingHours: {
                                  ...prev.operatingHours,
                                  [day]: { ...dayData, closeTime: val },
                                },
                              }));
                            }}
                            className="w-full h-7 text-[11px] bg-white border border-slate-200/90 shadow-2xs rounded px-1.5 font-mono text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                          >
                            {STANDARD_TIME_OPTIONS.map((tOpt) => (
                              <option key={`close-${tOpt}`} value={tOpt}>
                                {tOpt}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-rose-600 italic">
                          Closed
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SECTION 6: DECLARATIONS & SUBMIT */}
      {currentStep === 6 && (
        <Card className="border border-slate-200/90 shadow-xs rounded-xl bg-white p-3.5 sm:p-5 space-y-3.5">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Section F: Declarations, Agreements &amp; Submission
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                Final merchant commitments, policy agreements &amp; digital signature
              </p>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] font-medium border-slate-200 text-slate-600"
            >
              Section 6 of 6
            </Badge>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
              Merchant Commitments ({commitmentItems.length})
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {commitmentItems.map((c, idx) => {
                const itemKey = c.key || `commit${idx + 1}`;
                const isChecked =
                  !!formData[itemKey] ||
                  !!formData.commitmentsAccepted?.[c.id];
                const hasError = fieldErrors[itemKey];

                return (
                  <label
                    key={c.id || itemKey}
                    className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer select-none transition-all shadow-2xs ${
                      hasError
                        ? "bg-rose-50/40 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.12)]"
                        : "bg-slate-50 border border-slate-200/80 hover:bg-white"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(val) => {
                        setFormData((prev) => ({
                          ...prev,
                          [itemKey]: !!val,
                          commitmentsAccepted: {
                            ...(prev.commitmentsAccepted || {}),
                            [c.id || itemKey]: !!val,
                          },
                        }));
                        clearFieldError(itemKey);
                      }}
                      className={hasError ? "border-rose-500 mt-0.5" : "mt-0.5"}
                    />
                    <span className="font-normal text-slate-800">
                      {c.text}{" "}
                      {c.required !== false && (
                        <span className="text-rose-500 font-bold">*</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <Label className="text-xs font-semibold text-slate-900 uppercase tracking-wider block">
                Policy Agreements
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {policyItems.map((p, idx) => {
                  const itemKey = p.key || `policy${idx + 1}`;
                  const isChecked =
                    !!formData[itemKey] || !!formData.policiesAccepted?.[p.id];
                  const hasError = fieldErrors[itemKey];

                  const directDlUrl = (u) => {
                    if (!u || !u.trim()) return "";
                    const trimmed = u.trim();
                    const m =
                      trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                      trimmed.match(/id=([a-zA-Z0-9_-]+)/);
                    if (m && m[1]) {
                      return `https://drive.google.com/uc?export=download&id=${m[1]}`;
                    }
                    return /^https?:\/\//i.test(trimmed)
                      ? trimmed
                      : `https://${trimmed}`;
                  };

                  return (
                    <div
                      key={p.id || itemKey}
                      className={`flex items-center justify-between gap-2 p-2 rounded-lg transition-all shadow-2xs ${
                        hasError
                          ? "bg-rose-50/40 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-[0_2px_8px_rgba(244,63,94,0.12)]"
                          : "bg-slate-50 border border-slate-200/80 hover:bg-white"
                      }`}
                    >
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer select-none min-w-0">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(val) => {
                            setFormData((prev) => ({
                              ...prev,
                              [itemKey]: !!val,
                              policiesAccepted: {
                                ...(prev.policiesAccepted || {}),
                                [p.id || itemKey]: !!val,
                              },
                            }));
                            clearFieldError(itemKey);
                          }}
                          className={hasError ? "border-rose-500" : ""}
                        />
                        <span className="truncate">{p.title || p.text}</span>
                        {p.required !== false && (
                          <span className="text-rose-500 font-bold">*</span>
                        )}
                      </label>

                      {p.link && (
                        <a
                          href={directDlUrl(p.link)}
                          download
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-all shadow-2xs shrink-0"
                        >
                          <FileText className="w-3 h-3 text-rose-500 shrink-0" />
                          <span>PDF</span>
                          <Download className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Signatory Full Name */}
            <div className="pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-medium text-slate-700">
                  Authorised Signatory Full Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    readOnly
                    value={
                      formData.contactName ||
                      formData.signatoryName ||
                      "Fill Authorized Liaison Name in Section B"
                    }
                    className="pl-8 bg-slate-100 border border-slate-200/90 shadow-2xs text-xs h-9 rounded-lg font-medium text-slate-800 cursor-not-allowed"
                  />
                </div>
                <FieldTip text="Auto-synced from Authorized Liaison Name (Section B)." />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <div className="sticky bottom-0 z-30 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] rounded-t-xl p-3 flex items-center justify-between transition-all">
        <div>
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              className="text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg h-9 px-4 cursor-pointer border border-slate-200/90 shadow-2xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <span className="text-xs font-medium text-slate-500 pl-1">
              Step 1 of 6 • Business Details
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium text-slate-500 hidden sm:inline-block">
            Section {currentStep} of 6
          </span>
          {currentStep < 6 ? (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs h-9.5 px-6 rounded-lg border-0 cursor-pointer shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all duration-200 flex items-center gap-1.5"
            >
              <span>Next Section</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs h-9.5 px-6 rounded-lg border-0 cursor-pointer shadow-md shadow-emerald-500/25 hover:shadow-lg transition-all duration-200 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
