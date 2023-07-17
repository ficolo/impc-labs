import React, { useState } from "react";

function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const [pageRange, setPageRange] = useState([1, 2, 3]);

  const handlePageChange = (page: number) => {
    onPageChange(page);
    updatePageRange(page, totalPages);
  };

  const updatePageRange = (page: number, totalPages: number) => {
    let rangeStart = Math.max(1, page - 2);
    let rangeEnd = Math.min(totalPages, page + 2);

    if (rangeEnd - rangeStart < 4) {
      // If the range is too small, adjust it to always show 5 pages
      if (page <= 3) {
        rangeEnd = Math.min(totalPages, 5);
      } else {
        rangeStart = Math.max(1, totalPages - 4);
      }
    }

    setPageRange(
      Array.from(
        { length: rangeEnd - rangeStart + 1 },
        (_, i) => rangeStart + i
      )
    );
  };

  const isFirstPageActive = currentPage === 1;
  const isLastPageActive = currentPage === totalPages;

  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${isFirstPageActive ? "disabled" : ""}`}>
          <button
            className="page-link"
            aria-label="Previous"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>
        {pageRange[0] > 1 && (
          <>
            <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
              <button
                className="page-link"
                aria-label="Previous"
                onClick={() => handlePageChange(1)}
              >
                <span aria-hidden="true">1</span>
              </button>
            </li>
            {pageRange[0] > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}
        {pageRange.map((pageNumber) => (
          <li
            key={pageNumber}
            className={`page-item ${
              currentPage === pageNumber ? "active" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => handlePageChange(pageNumber)}
            >
              {pageNumber}
            </button>
          </li>
        ))}
        {pageRange[pageRange.length - 1] < totalPages && (
          <>
            {pageRange[pageRange.length - 1] < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li
              className={`page-item ${
                currentPage === totalPages ? "active" : ""
              }`}
            >
              <button
                className="page-link"
                aria-label="Previous"
                onClick={() => handlePageChange(totalPages)}
              >
                <span aria-hidden="true">{totalPages}</span>
              </button>
            </li>
          </>
        )}
        <li className={`page-item ${isLastPageActive ? "disabled" : ""}`}>
          <button
            className="page-link"
            aria-label="Next"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default PaginationComponent;
