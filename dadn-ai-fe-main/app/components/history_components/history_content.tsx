// history_content.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { IoMdCalendar } from "react-icons/io"; 
import type { ContentProp } from "../home_components/Content";
import HistoryTable from "./HistoryTable";
import Pagination from "./Pagination";

// 1. Định nghĩa kiểu dữ liệu
type ActionFromAPI = {
    _id: string;
    time: string;
    action: string;
    trigger: string;
};

export type DataProp = ActionFromAPI[];

export default function HistoryContent({ className = "" }: ContentProp) {
    // --- State Management ---
    const [allActions, setAllActions] = useState<DataProp>([]); 
    
    // State hiển thị
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5); 
    const [startDate, setStartDate] = useState<string>("");   
    const [endDate, setEndDate] = useState<string>("");       
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Refs riêng cho 2 ô input để xử lý click icon lịch ---
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchAllHistory = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const response = await fetch(
                    `http://localhost:3000/api/actionHistory?limit=1000`, 
                    { credentials: 'include' }
                );

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.statusText}`);
                }

                const data: { totalPages: number, actions: DataProp } = await response.json();

                if (!data.actions) {
                    throw new Error("Invalid data format from API response.");
                }

                const sortedActions = data.actions.sort((a, b) => {
                    const dateA = new Date(a.time);
                    const dateB = new Date(b.time);
                    return dateB.getTime() - dateA.getTime();
                });

                setAllActions(sortedActions);

            } catch (e) {
                const error = e as Error;
                setError(error.message || "An unknown error occurred.");
                setAllActions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllHistory();
    }, []);

    // --- LOGIC FRONTEND ---
    const filteredData = useMemo(() => {
        if (!startDate && !endDate) return allActions;

        // --- FIX BUG TIMEZONE ---
        // Input datetime-local trả về string dạng "YYYY-MM-DDTHH:mm" (Hiểu là Local Time)
        // Nhưng bảng HistoryTable lại hiển thị giờ UTC.
        // -> Cần thêm "Z" vào cuối để ép Date() hiểu input của user là giờ UTC cho khớp với dữ liệu.
        
        const start = startDate ? new Date(`${startDate}Z`).getTime() : -Infinity;
        const end = endDate ? new Date(`${endDate}Z`).getTime() : Infinity;

        return allActions.filter(item => {
            const itemTime = new Date(item.time).getTime();
            // So sánh timestamp
            return itemTime >= start && itemTime <= end;
        });
    }, [allActions, startDate, endDate]);

    const totalPagesFrontend = Math.ceil(filteredData.length / entriesPerPage) || 1;

    const currentTableData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * entriesPerPage;
        const lastPageIndex = firstPageIndex + entriesPerPage;
        return filteredData.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, entriesPerPage, filteredData]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, startDate, endDate]);

    // --- Hàm xử lý click icon lịch ---
    const handleCalendarClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        const input = ref.current;
        if (input) {
            if (typeof (input as any).showPicker === 'function') {
                (input as any).showPicker();
            } else {
                input.focus(); 
            }
        }
    };

    return (
        <div className={`${className} flex flex-col`}>
            <div className="w-full rounded-xl bg-white p-10 flex-1 min-h-0 overflow-y-auto text-gray-900 shadow-sm">
                
                <h1 className="font-bold text-2xl px-3 mb-6">History</h1>

                {/* --- TOOLBAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 px-3 gap-4 text-sm font-medium text-gray-600">
                    
                    {/* Dropdown */}
                    <div className="flex items-center gap-2">
                        <span>Show</span>
                        <select 
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            className="h-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-md 
                                       focus:outline-none focus:border-gray-500 focus:ring-0 
                                       block px-3 shadow-sm cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>entries</span>
                    </div>

                    {/* Date Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                        
                        {/* Ô Start Date */}
                        <div className="flex items-center border border-gray-300 rounded-md px-3 h-10 shadow-sm bg-white hover:border-gray-400 transition-colors">
                            <input 
                                ref={startDateRef}
                                type="datetime-local" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="outline-none border-none text-gray-600 bg-transparent cursor-pointer text-xs md:text-sm focus:ring-0 p-0 w-32 sm:w-auto"
                                placeholder="Start Date"
                            />
                            <IoMdCalendar 
                                onClick={() => handleCalendarClick(startDateRef)}
                                className="text-lg text-gray-500 ml-2 cursor-pointer hover:text-black active:scale-95" 
                            />
                        </div>

                        <span className="text-gray-400">-</span>

                        {/* Ô End Date */}
                        <div className="flex items-center border border-gray-300 rounded-md px-3 h-10 shadow-sm bg-white hover:border-gray-400 transition-colors">
                            <input 
                                ref={endDateRef}
                                type="datetime-local" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="outline-none border-none text-gray-600 bg-transparent cursor-pointer text-xs md:text-sm focus:ring-0 p-0 w-32 sm:w-auto"
                                placeholder="End Date"
                            />
                            <IoMdCalendar 
                                onClick={() => handleCalendarClick(endDateRef)}
                                className="text-lg text-gray-500 ml-2 cursor-pointer hover:text-black active:scale-95" 
                            />
                        </div>
                        
                        {/* Nút Clear */}
                        {(startDate || endDate) && (
                            <button 
                                onClick={() => {setStartDate(""); setEndDate("");}}
                                className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline whitespace-nowrap"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* --- TABLE & PAGINATION --- */}
                {isLoading ? (
                    <div className="p-10 text-center text-gray-500">Loading history...</div>
                ) : error ? (
                    <div className="p-10 text-center text-red-600">
                        <strong>Error:</strong> {error}
                    </div>
                ) : (
                    <>
                        <HistoryTable data={currentTableData} />
                        
                        {currentTableData.length === 0 && (
                            <div className="text-center p-10 text-gray-500 italic bg-gray-50 rounded-lg mt-4 border border-gray-100">
                                No records found matching your selection.
                            </div>
                        )}

                        <div className="mt-6 flex justify-center">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPagesFrontend} 
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}