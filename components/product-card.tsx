import Image from "next/image";
import { Star, Heart } from "lucide-react";
import type { Product } from "@/lib/data";

const GENDER_COLOR: Record<string, string> = {
  남성: "bg-blue-500/20 text-blue-400",
  여성: "bg-pink-500/20 text-pink-400",
  공용: "bg-purple-500/20 text-purple-400",
  남녀공용: "bg-purple-500/20 text-purple-400",
};

export default function ProductCard({ p }: { p: Product }) {
  const star = (p.review_score || 0) / 20;
  const hasDiscount = p.discount_rate && p.discount_rate !== "0%";
  const hasOriginal = p.original_price > p.price;
  const genderClass =
    GENDER_COLOR[p.gender || ""] || "bg-gray-500/20 text-gray-400";

  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] transition-colors"
    >
      <div className="relative aspect-square bg-[#1a1d24]">
        {p.thumbnail ? (
          <Image
            src={p.thumbnail}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--muted)] text-xs">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2 bg-[var(--accent)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          #{p.rank}
        </div>
        {hasDiscount && (
          <div className="absolute top-2 right-2 bg-[var(--danger)] text-white text-xs font-bold px-2 py-1 rounded">
            {p.discount_rate}
          </div>
        )}
        {p.gender && (
          <div className={`absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded ${genderClass}`}>
            {p.gender}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] truncate">
          {p.brand}
        </div>
        <div className="text-xs mt-1 line-clamp-2 min-h-[32px]">{p.name}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">{p.price.toLocaleString()}원</span>
          {hasOriginal && (
            <span className="text-[10px] text-[var(--muted)] line-through">
              {p.original_price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[var(--muted)]">
          <span className="flex items-center gap-0.5">
            <Star size={10} className="fill-yellow-500 text-yellow-500" />
            {star.toFixed(1)}
          </span>
          <span>·</span>
          <span>리뷰 {p.review_count.toLocaleString()}</span>
          {(p.like_count ?? 0) > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Heart size={10} className="fill-red-500 text-red-500" />
                {(p.like_count ?? 0).toLocaleString()}
              </span>
            </>
          )}
        </div>
        {p.tags && p.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[9px] px-1.5 py-0.5 bg-[var(--background)] text-[var(--muted)] rounded"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
