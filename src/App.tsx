import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Messages from "./pages/Messages";
import Requests from "./pages/Requests";
import Post from "./pages/Post";
import EmailVerification from "./pages/EmailVerification";
import UserPage from "./pages/user";
import ForgotPassword from "./pages/ForgotPassword";
import Search from "./pages/SearchPeople";
import AuthSuccess from "./components/AuthSuccess";
import MyPostPage from "./pages/myPost";
import PrivateRoute from "./components/PrivateRouts";

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/email-verification" element={<EmailVerification />} />
             <Route path="/auth-success" element={<AuthSuccess />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />


            <Route path="/discover" element={<PrivateRoute><Discover /></PrivateRoute>} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
            <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
            <Route path="/post" element={<PrivateRoute><Post /></PrivateRoute>} />
            <Route path="/user" element={<PrivateRoute><UserPage /></PrivateRoute>} />
            <Route path="/forgot-password" element={<PrivateRoute><ForgotPassword /></PrivateRoute>} />
            <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
            <Route path="/user/:userId" element={<PrivateRoute><UserPage /></PrivateRoute>} />
            <Route path="/myPost" element={<PrivateRoute><MyPostPage /></PrivateRoute>} />

          </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  
);

export default App;