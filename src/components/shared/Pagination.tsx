"use client";

import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("ellipsis-1");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("ellipsis-2");
    if (!pages.includes(totalPages)) pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-xl border-primary/10 hover:bg-primary/5 hover:text-primary disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5">
        {pages.map((page, index) => {
          if (typeof page === "string") {
            return (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            );
          }

          const isActive = page === currentPage;

          return (
            <Button
              key={page}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`min-w-[40px] h-10 rounded-xl font-bold transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110"
                  : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-xl border-primary/10 hover:bg-primary/5 hover:text-primary disabled:opacity-30"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
