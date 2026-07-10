import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PostLogin from "@/(root)/PostLogin.tsx";
import AdminDashboard from "@/(root)/AdminDashboard.tsx";
import HotelDashboard from "@/(root)/HotelDashboard.tsx";
import MyBookings from "@/(root)/MyBookings.tsx";
import Search from "@/components/Search.tsx";
import HotelDetail from "@/pages/HotelDetail.tsx";




function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/hotels/:slug" element={<HotelDetail />} />
            <Route path="/redirect" element={<PostLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/hotel-dashboard" element={<HotelDashboard />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;