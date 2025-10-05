import { useState } from "react";
import CitizenSignup from "./citizen/Signup";
import StaffSignup from "./staff/StaffSignup";

export default function TabbedSignup() {
    const [activeTab, setActiveTab] = useState("citizen");

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-md mx-auto">
                {/* Tab Headers */}
                <div className="bg-white rounded-t-xl shadow-md">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab("citizen")}
                            className={`flex-1 py-4 px-6 text-center font-semibold rounded-tl-xl transition cursor-pointer ${
                                activeTab === "citizen"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            👤 Citizen
                        </button>
                        <button
                            onClick={() => setActiveTab("staff")}
                            className={`flex-1 py-4 px-6 text-center font-semibold rounded-tr-xl transition cursor-pointer ${
                                activeTab === "staff"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            👷 Staff
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-b-xl shadow-md">
                    {activeTab === "citizen" && <CitizenSignup />}
                    {activeTab === "staff" && <StaffSignup />}
                </div>
            </div>
        </div>
    );
}