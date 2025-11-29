// Pagination.tsx

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

// Đặt giới hạn số nút bấm trang. Bạn có thể đổi số 5 này thành 3 như ví dụ của bạn.
const MAX_VISIBLE_PAGES = 7;

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // --- Logic tính toán các trang hiển thị ---
    let startPage = 1;
    let endPage = totalPages;

    // Chỉ áp dụng logic cửa sổ trượt nếu tổng số trang lớn hơn giới hạn
    if (totalPages > MAX_VISIBLE_PAGES) {
        // Tính điểm bắt đầu
        startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
        
        // Tính điểm kết thúc
        endPage = startPage + MAX_VISIBLE_PAGES - 1;

        // Xử lý khi đến gần cuối:
        // Nếu endPage vượt quá tổng số trang, ta "khóa" endPage lại và tính lùi startPage
        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = totalPages - MAX_VISIBLE_PAGES + 1;
        }
    }
    
    // Tạo mảng các số trang để render, ví dụ: [3, 4, 5, 6, 7]
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }
    // ------------------------------------------

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div className="flex items-center justify-center gap-x-3 text-sm text-gray-500">
            {/* Nút Previous */}
            <button
                onClick={handlePrevious}
                disabled={isFirstPage}
                className={`hover:text-gray-800 ${isFirstPage ? 'cursor-not-allowed text-gray-300' : ''}`}
            >
                Previous
            </button>

            {/* Các nút số trang (đã được giới hạn) */}
            <div className="flex items-center gap-x-2">
                {/* Render "..." nếu cửa sổ trượt không bắt đầu từ trang 1 
                  (Ví dụ: khi đang ở trang 5, nút đầu tiên là 3, ta sẽ hiện ... 3 4 5 6 7)
                */}
                {startPage > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300">1</button>
                        <span className="p-1">...</span>
                    </>
                )}

                {/* Render các nút trang trong cửa sổ */}
                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            currentPage === page
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {/* Render "..." nếu cửa sổ trượt không kết thúc ở trang cuối
                  (Ví dụ: khi đang ở trang 3/10, ta sẽ hiện 1 2 3 4 5 ...)
                */}
                {endPage < totalPages && (
                     <>
                        <span className="p-1">...</span>
                        <button onClick={() => onPageChange(totalPages)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300">{totalPages}</button>
                    </>
                )}
            </div>

            {/* Nút Next */}
            <button
                onClick={handleNext}
                disabled={isLastPage}
                className={`hover:text-gray-800 ${isLastPage ? 'cursor-not-allowed text-gray-300' : ''}`}
            >
                Next
            </button>
        </div>
    );
}