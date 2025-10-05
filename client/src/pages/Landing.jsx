import { useNavigate } from "react-router-dom";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
                <div className="text-center space-y-6">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        EcoResolve
                    </h1>
                    <p className="text-gray-600">
                        Report. Track. Resolve.
                    </p>
                    <div className="flex flex-col gap-4 mt-6">
                        <button
                            onClick={() => navigate("/signup")}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 hover:scale-105 transition cursor-pointer"
                        >
                            Sign Up (Citizen)
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 hover:scale-105 transition cursor-pointer"
                        >
                            Login (Citizen / Staff / Admin)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
