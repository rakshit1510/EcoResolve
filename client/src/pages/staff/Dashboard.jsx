import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import axios from "axios";

export default function StaffDashboard() {
    const { user } = useAuth();
    const [workers, setWorkers] = useState([]);
    const [resources, setResources] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        selectedWorkers: [],
        selectedResources: [],
        startDate: "",
        endDate: "",
        location: "",
    });
    const [loading, setLoading] = useState(false);

    const fetchWorkers = async () => {
        const res = await axios.get("/api/workers", { withCredentials: true });
        setWorkers(res.data);
    };

    const fetchResources = async () => {
        const res = await axios.get("/api/resources", { withCredentials: true });
        setResources(res.data);
    };

    const fetchAssignments = async () => {
        const res = await axios.get("/api/assignments", { withCredentials: true });
        setAssignments(res.data);
    };

    useEffect(() => {
        fetchWorkers();
        fetchResources();
        fetchAssignments();
    }, []);

    const handleChange = (e) => {
        const { name, value, options } = e.target;
        if (options) {
            const selected = Array.from(options).filter((o) => o.selected).map((o) => o.value);
            setFormData({ ...formData, [name]: selected });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/api/assignments", formData, { withCredentials: true });
            setFormData({
                title: "",
                description: "",
                selectedWorkers: [],
                selectedResources: [],
                startDate: "",
                endDate: "",
                location: "",
            });
            fetchAssignments();
        } catch (err) {
            console.error(err);
            alert("Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome, {user.firstName}</h1>

            {/* Assignment Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-6 max-w-lg">
                <h2 className="text-xl font-semibold mb-4">Create Assignment</h2>

                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full p-2 mb-2 border rounded"
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="w-full p-2 mb-2 border rounded"
                />

                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full p-2 mb-2 border rounded"
                />

                <div className="flex gap-2 mb-2">
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="p-2 border rounded"
                    />
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="p-2 border rounded"
                    />
                </div>

                {/* Workers Multi-Select */}
                <select
                    name="selectedWorkers"
                    multiple
                    value={formData.selectedWorkers}
                    onChange={handleChange}
                    className="w-full p-2 mb-2 border rounded"
                >
                    {workers.map((w) => (
                        <option key={w._id} value={w._id}>
                            {w.name} ({w.department})
                        </option>
                    ))}
                </select>

                {/* Resources Multi-Select */}
                <select
                    name="selectedResources"
                    multiple
                    value={formData.selectedResources}
                    onChange={handleChange}
                    className="w-full p-2 mb-2 border rounded"
                >
                    {resources.map((r) => (
                        <option key={r._id} value={r._id}>
                            {r.resourceName} ({r.department})
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                >
                    {loading ? "Creating..." : "Create Assignment"}
                </button>
            </form>

            {/* Assignments List */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Assignments</h2>
                {assignments.length === 0 ? (
                    <p>No assignments yet.</p>
                ) : (
                    <ul>
                        {assignments.map((a) => (
                            <li key={a._id} className="border p-4 mb-2 rounded bg-white shadow">
                                <p><strong>Title:</strong> {a.title}</p>
                                <p><strong>Location:</strong> {a.location}</p>
                                <p><strong>Start:</strong> {a.startDate}</p>
                                <p><strong>End:</strong> {a.endDate}</p>
                                <p>
                                    <strong>Workers:</strong>{" "}
                                    {a.workers.map((w) => w.name).join(", ")}
                                </p>
                                <p>
                                    <strong>Resources:</strong>{" "}
                                    {a.resources.map((r) => r.resourceName).join(", ")}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
