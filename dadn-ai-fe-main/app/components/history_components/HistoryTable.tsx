// HistoryTable.tsx

import type { DataProp } from "./history_content";

type HistoryProp = { data: DataProp }

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    
    // Sử dụng options để định dạng ngày giờ theo ý muốn
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',    // "2025"
        month: '2-digit',   // "10"
        day: '2-digit',     // "25"
        hour: '2-digit',    // "08"
        minute: '2-digit',  // "43"
        second: '2-digit',  // "35"
        hour12: true,       // Sử dụng định dạng 12 giờ (AM/PM)
        timeZone: 'Asia/Ho_Chi_Minh'
    };

    // 'vi-VN' để đảm bảo thứ tự Ngày/Tháng/Năm
    return date.toLocaleString("en-US", { timeZone: "UTC" });
}

export default function HistoryTable({ data }: HistoryProp) {
    return (
        <table className="w-full table-fixed border-collapse">
            <thead>
                <tr className="border-b border-gray-200">
                    <th className="w-1/4 p-4 text-left font-bold text-gray-700">Time</th>
                    <th className="w-1/3 p-4 text-left font-bold text-gray-700">Action</th>
                    <th className="w-5/12 p-4 text-left font-bold text-gray-700">Trigger</th>
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={row._id} className="bg-[#F7F6FE] border-b border-white">
                        <td className="w-1/4 p-4 whitespace-nowrap">
                            {/* Sử dụng hàm formatDateTime mới */}
                            {formatDateTime(row.time)}
                        </td>
                        <td className="w-1/3 p-4">{row.action}</td>
                        <td className="w-5/12 p-4">{row.trigger}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}