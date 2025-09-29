import React, { useState } from "react";
import { useAuthContext } from "../../../contexts/AuthContext";
import { LuCircleUserRound } from "react-icons/lu";
import axios from "axios";

export default function Profile() {
    const { user, dispatch } = useAuthContext();
    const [state, setState] = useState({
        username: user?.username || "",
        email: user?.email || "",
        oldPassword: "",
        newPassword: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) =>
        setState((s) => ({ ...s, [e.target.name]: e.target.value }));

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.patch(`${import.meta.env.VITE_HOST}/profile/update`, state);

            if (res.data.user) dispatch({ type: "SET_LOGGED_IN", payload: res.data.user });

            setMessage(res.data.message || "Profile updated successfully");
            setState((s) => ({ ...s, oldPassword: "", newPassword: "" }));
        } catch (err) {
            setMessage(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-container py-10">
            <h4 className="flex items-center gap-2 text-[var(--primary)]">
                <LuCircleUserRound /> Profile
            </h4>
            <p className="text-[14px] bg-[var(--light)] text-[var(--dark)] w-fit px-2 py-1 rounded-[6px] mt-2 mb-6">
                Manage profile settings here
            </p>

            <form
                className="w-full bg-white p-6 rounded-xl shad"
                onSubmit={handleUpdateProfile}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                        {/* Username */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={state.username}
                                placeholder="Enter username"
                                className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={state.email}
                                placeholder="Enter email"
                                className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {/* Old Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Old Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={state.oldPassword}
                                placeholder="Enter current password"
                                className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                                onChange={handleChange}
                            />
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={state.newPassword}
                                placeholder="Enter new password"
                                className="w-full border border-gray-300 text-sm focus:outline-none focus:border-[var(--secondary)]"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center gap-2 bg-[var(--secondary)] text-white p-3 mt-6 text-sm font-semibold rounded-[8px] transition-all duration-150 ease-linear hover:bg-[var(--secondary)]/75"
                >
                    {loading ? "Updating..." : "Update Profile"}
                </button>

                {message && <p className="text-sm mt-2">{message}</p>}
            </form>
        </div>
    );
}