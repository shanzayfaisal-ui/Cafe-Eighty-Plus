import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Trash2, User, Mail, MessageSquare, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  created_at: string;
}

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
  setLoading(true);
  
  // 1. Tell Supabase to return an array of Feedback
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .returns<Feedback[]>() // Add this line
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase Error:", error);
    toast.error("Failed to load reviews");
  } else {
    // 2. Now TypeScript knows data is either Feedback[] or null
    setReviews(data || []);
  }
  setLoading(false);
};
  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    const { error } = await supabase.from("feedback").delete().eq("id", id);
    if (!error) {
      toast.success("Review deleted");
      fetchReviews();
    } else {
      toast.error("Error deleting review");
    }
  };

  return (
    <AdminLayout title="Customer Reviews" description="Manage and view feedback from your visitors">
      <div className="max-w-6xl space-y-8">
        
        {loading ? (
          <div className="text-center py-20 text-stone-400 font-medium">Loading feedback...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-md transition-all relative group">
                
                {/* Delete Button - Visible on Hover */}
                <button 
                  onClick={() => deleteReview(rev.id)}
                  className="absolute top-6 right-6 p-3 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-[#5D3A26]">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2D1B14]">{rev.name}</h4>
                    <div className="flex items-center gap-2 text-stone-400 text-xs mt-1">
                      <Mail size={12} /> {rev.email}
                    </div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={cn(
                        i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                      )} 
                    />
                  ))}
                </div>

                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 text-stone-50 w-8 h-8 -z-10" />
                  <p className="text-stone-600 text-sm leading-relaxed italic">
                    "{rev.message}"
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-stone-50 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-300">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#5D3A26] uppercase tracking-tighter">
                    <MessageSquare size={12} /> Verified Feedback
                  </div>
                </div>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="col-span-full py-20 text-center bg-stone-50/50 rounded-[3rem] border border-dashed border-stone-200">
                <p className="text-stone-400 font-medium italic">No reviews have been submitted yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviewsPage;