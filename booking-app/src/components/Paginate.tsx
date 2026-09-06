import { useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

interface PaginationProps {  
  totalPages: number;  
  page: number | string | undefined;  
  onChange: (pageNumber: number) => void;
}

export function Paginate({totalPages, page, onChange}: PaginationProps) {
  // const [currentPage, setCurrentPage] = useState(page === "" || page === undefined ? 1 : parseInt(page));

  const currentPage = page === "" || page === undefined ? 1 : parseInt(page);
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      //setCurrentPage(page);
      onChange(page)
    }
  };
  
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className={`cursor-pointer ${currentPage === 1 ? 'opacity-30 pointer-events-none' : ''}`}>Previous</PaginationPrevious>
        </PaginationItem>
        {[...Array(totalPages).keys()].map(page => (
        <PaginationItem key={page + 1}>
          <PaginationLink isActive={currentPage === page + 1} onClick={() => handlePageChange(page + 1)} className="cursor-pointer">{page + 1}</PaginationLink>
        </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className={`cursor-pointer ${currentPage === totalPages ? 'opacity-30 pointer-events-none' : ''}`} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}