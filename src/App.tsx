import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import PostLogin from "@/(root)/PostLogin.tsx";
import HotelDashboard from "@/(root)/HotelDashboard.tsx";
import MyBookings from "@/(root)/MyBookings.tsx";






function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/redirect" element={<PostLogin />} />


            <Route path="/hotel-dashboard" element={<HotelDashboard />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;