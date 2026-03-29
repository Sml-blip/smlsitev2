"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  pageName: string;
}

const Pagination = ({ pageName, totalPages, currentPage }: PaginationProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(pageName, page.toString());
    router.replace(`${pathname}?${params}`);
  };

  if (totalPages <= 1) return null;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 my-8 px-2">
      {/* Previous Button */}
      <button
        className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium
          bg-muted hover:bg-primary hover:text-black transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-muted disabled:hover:text-current"
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Précédent</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2 py-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={`min-w-[36px] sm:min-w-[40px] px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentPage === page 
                  ? "bg-primary text-black" 
                  : "bg-muted hover:bg-primary/20"
                }`}
              onClick={() => handleChange(page as number)}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        className="flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium
          bg-muted hover:bg-primary hover:text-black transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-muted disabled:hover:text-current"
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
