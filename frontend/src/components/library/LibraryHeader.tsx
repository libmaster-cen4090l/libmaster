// src/components/library/LibraryHeader.tsx
import React from "react";
import { Link } from "react-router-dom";

interface LibraryHeaderProps {
    title: string;
    onRefresh: () => Promise<void>;
}

const LibraryHeader: React.FC<LibraryHeaderProps> = ({ title, onRefresh }) => {
    const MY_RES_LINK_CN = `bg-emerald-400 text-center shadow hover:bg-emerald-500
    text-white px-4 max-h-10 min-w-40 transition-colors py-2 rounded-lg`;
    const REFRESH_BUTTON_CN = `bg-blue-400 shadow hover:bg-blue-500 text-white px-4
    transition-colors py-2 rounded-lg`;
    const LOGOUT_LINK_CN = `bg-gray-400 shadow hover:bg-slate-500 text-white px-4
    transition-colors py-2 rounded-lg`;

    return (
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-bold">
                {/* added garnet and gold for site header. go noles! */}
                <span className="text-[#782F40]">Lib</span>
                <span className="text-[#CEB888]">Master</span>
            </h1>
            <div className="flex max-h-10 mt-2 gap-3">
                <Link to="/my-reservations" className={MY_RES_LINK_CN}>
                    My Reservations
                </Link>
                <button onClick={onRefresh} className={REFRESH_BUTTON_CN}>
                    Refresh
                </button>
                <Link to="/logout" className={LOGOUT_LINK_CN}>
                    Logout
                </Link>
            </div>
        </div>
    );
};

export default LibraryHeader;
