import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, MapPin, ChevronRight, ArrowLeft, Building2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const PAKISTAN_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Multan", 
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Abbottabad"
].sort();

const CustomerInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  // Initialize state cleanly. If an active checkout session is in progress, use it.
  // Otherwise, start with a pristine, blank form.
  const [customer, setCustomer] = useState(() => {
    const storedCustomer = localStorage.getItem("customer");
    if (storedCustomer) {
      const parsedData = JSON.parse(storedCustomer);
      if (parsedData.country === "Lahore" || !parsedData.country) {
        parsedData.country = "Pakistan";
      }
      return parsedData;
    }
    return {
      name: "",
      phone: "",
      email: "",
      streetAddress: "",
      city: "",
      country: "Pakistan",
    };
  });

  // This effect now ONLY runs if the user logs in mid-checkout or we explicitly need base contact info,
  // but it WILL NOT force-fill previous addresses if an order was just cleared.
  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");

    // If there's already active text being typed or an order session active, don't touch it
    if (storedCustomer) return;

    // Optional: Pre-fill basic contact info for logged-in accounts if they haven't typed anything yet,
    // but keep delivery address fields completely blank for a fresh slate.
    if (user || profile) {
      const savedName = profile?.full_name ?? user?.user_metadata?.full_name ?? "";
      const savedEmail = user?.email ?? "";
      const savedPhone = profile?.phone ?? "";

      setCustomer((prev) => ({
        ...prev,
        name: prev.name || savedName,
        email: prev.email || savedEmail,
        phone: prev.phone || savedPhone,
        streetAddress: "", // Always empty for a new order session
        city: "",          // Always unselected for a new order session
        country: "Pakistan"
      }));
    }
  }, [profile, user]);

  const handleChange = (field: string, value: string) => {
    if (field === "phone") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 11) {
        setCustomer((prev) => ({ ...prev, [field]: onlyNums }));
      }
      return;
    }
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name || !customer.phone || !customer.streetAddress || !customer.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *.",
        variant: "destructive",
      });
      return;
    }

    const isValidPKMobile = /^03\d{9}$/.test(customer.phone);
    if (!isValidPKMobile) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 11-digit number starting with 03.",
        variant: "destructive",
      });
      return;
    }

    const fullData = {
      ...customer,
      country: "Pakistan",
      address: `${customer.streetAddress}, ${customer.city}, Pakistan`
    };
    
    localStorage.setItem("customer", JSON.stringify(fullData));

    toast({
      title: "Details Saved",
      description: "Proceeding to payment...",
    });

    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-8 sm:p-10 border border-stone-50">
        
        <button 
          type="button"
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-[#5D3A26] transition-colors mb-6"
        >
          <ArrowLeft size={12} /> Back to Menu
        </button>

        <header className="mb-8 text-center">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-2">Step 1 of 2</p>
          <h2 className="text-3xl font-serif font-bold text-[#2D1B14]">Delivery Details</h2>
          <div className="h-0.5 w-12 bg-[#5D3A26] mx-auto mt-4"></div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <input
                required
                type="text"
                placeholder="Name"
                value={customer.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D3A26]/5 focus:border-[#5D3A26] transition-all text-[#2D1B14] placeholder:text-stone-300"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Mobile Number *</label>
            <div className="relative">
              <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${customer.phone.length > 0 && !/^03/.test(customer.phone) ? 'text-rose-400' : 'text-stone-300'}`} />
              <input
                required
                type="tel"
                placeholder="03XXXXXXXXX"
                value={customer.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={`w-full bg-stone-50/50 border rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 transition-all ${
                  customer.phone.length > 0 && !/^03/.test(customer.phone)
                  ? "border-rose-200 focus:ring-rose-50 focus:border-rose-400" 
                  : "border-stone-100 focus:ring-[#5D3A26]/5 focus:border-[#5D3A26]"
                }`}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email (Optional)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <input
                type="email"
                placeholder="email@example.com"
                value={customer.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D3A26]/5 focus:border-[#5D3A26] transition-all text-[#2D1B14] placeholder:text-stone-300"
              />
            </div>
          </div>

          {/* Street Address Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Street Address *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <input
                required
                type="text"
                placeholder="House No, Street, Area"
                value={customer.streetAddress}
                onChange={(e) => handleChange("streetAddress", e.target.value)}
                className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D3A26]/5 focus:border-[#5D3A26] transition-all text-[#2D1B14] placeholder:text-stone-300"
              />
            </div>
          </div>

          {/* City & Country Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">City *</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-300" />
                <select
                  required
                  value={customer.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full bg-stone-50/50 border border-stone-100 rounded-2xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5D3A26]/5 focus:border-[#5D3A26] transition-all text-[#2D1B14] appearance-none"
                >
                  <option value="">Select City</option>
                  {PAKISTAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Country</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-300" />
                <input
                  disabled
                  value="Pakistan"
                  className="w-full bg-stone-100 border border-stone-100 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2D1B14] text-[#EAD8C0] py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg hover:bg-[#5D3A26] transition-all mt-4 flex items-center justify-center gap-2"
          >
            Payment Details <ChevronRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerInfo;