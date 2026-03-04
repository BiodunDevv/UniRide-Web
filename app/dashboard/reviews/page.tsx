"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  StatsCard,
  PageHeader,
  SearchInput,
  LoadingState,
} from "@/components/shared";
import {
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Award,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useReviewStore } from "@/store/useReviewStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { Review } from "@/store/useReviewStore";
import { ProfileAvatar } from "@/components/shared/profile-avatar";

export default function ReviewsPage() {
  const { token } = useAuthStore();
  const {
    reviews,
    total,
    isLoading,
    getAllReviews,
    toggleFeatured,
    toggleApproval,
    deleteReview,
  } = useReviewStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "featured" | "pending">("all");

  useEffect(() => {
    if (token) getAllReviews(token);
  }, [token, getAllReviews]);

  const filteredReviews = useMemo(() => {
    let result = reviews;

    if (filter === "featured") {
      result = result.filter((r) => r.is_featured);
    } else if (filter === "pending") {
      result = result.filter((r) => !r.is_approved);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.message.toLowerCase().includes(q) ||
          r.user_id?.name?.toLowerCase().includes(q) ||
          r.user_id?.email?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [reviews, filter, searchQuery]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  const handleToggleFeatured = async (id: string) => {
    if (token) await toggleFeatured(token, id);
  };

  const handleToggleApproval = async (id: string) => {
    if (token) await toggleApproval(token, id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    if (token) await deleteReview(token, id);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Reviews"
        description="Manage user reviews and select which ones to feature on the landing page"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatsCard
          icon={MessageSquare}
          value={reviews.length}
          label="Total Reviews"
        />
        <StatsCard
          icon={Star}
          iconColor="text-[#D4A017]"
          value={avgRating}
          label="Average Rating"
        />
        <StatsCard
          icon={Award}
          iconColor="text-green-500"
          value={reviews.filter((r) => r.is_featured).length}
          label="Featured"
        />
        <StatsCard
          icon={XCircle}
          iconColor="text-destructive"
          value={reviews.filter((r) => !r.is_approved).length}
          label="Unapproved"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm">All Reviews</CardTitle>
              <CardDescription className="text-xs">
                {filteredReviews.length} review
                {filteredReviews.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search reviews..."
              />
              <div className="flex gap-1">
                {(["all", "featured", "pending"] as const).map((f) => (
                  <Button
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="text-xs capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reviews found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onToggleFeatured={handleToggleFeatured}
                  onToggleApproval={handleToggleApproval}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({
  review,
  onToggleFeatured,
  onToggleApproval,
  onDelete,
}: {
  review: Review;
  onToggleFeatured: (id: string) => Promise<void>;
  onToggleApproval: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (
    action: (id: string) => Promise<void>,
    name: string,
  ) => {
    setLoading(name);
    await action(review._id);
    setLoading(null);
  };

  return (
    <div className="rounded-lg border p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <ProfileAvatar
          src={review.user_id?.profile_picture}
          name={review.user_id?.name || "User"}
          size="sm"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {review.user_id?.name || "Deleted User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {review.user_id?.email}
            </span>
            <Badge variant="outline" className="text-[10px] capitalize">
              {review.user_id?.role || "user"}
            </Badge>
            {review.is_featured && (
              <Badge className="bg-[#D4A017]/10 text-[#D4A017] border-[#D4A017]/20 text-[10px]">
                ⭐ Featured
              </Badge>
            )}
            {!review.is_approved && (
              <Badge variant="destructive" className="text-[10px]">
                Unapproved
              </Badge>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= review.rating
                    ? "fill-[#D4A017] text-[#D4A017]"
                    : "fill-none text-gray-300"
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">
              {review.rating}/5
            </span>
          </div>

          <h4 className="font-medium text-sm mt-2">{review.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {review.message}
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <Button
                variant={review.is_featured ? "default" : "outline"}
                size="sm"
                className="h-7 text-[10px] px-2"
                disabled={loading !== null || !review.is_approved}
                onClick={() => handleAction(onToggleFeatured, "featured")}
                title={
                  !review.is_approved
                    ? "Approve first to feature"
                    : review.is_featured
                      ? "Remove from homepage"
                      : "Show on homepage"
                }
              >
                {review.is_featured ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Unfeature
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Feature
                  </>
                )}
              </Button>

              <Button
                variant={review.is_approved ? "outline" : "default"}
                size="sm"
                className="h-7 text-[10px] px-2"
                disabled={loading !== null}
                onClick={() => handleAction(onToggleApproval, "approval")}
              >
                {review.is_approved ? (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Unapprove
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-2 text-destructive hover:bg-destructive/10"
                disabled={loading !== null}
                onClick={() => handleAction(onDelete, "delete")}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
