import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Menu,
  X,
  AlignJustify,
  User,
  MessageSquare,
  Trophy,
  Home,
  ClipboardList,
  LogOut,
  Settings,
  Search,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { authAPI, type User as UserType } from "@/data/mockData";
import axios from "axios";

const baseURL = import.meta.env.VITE_BASE_URL;

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const location = useLocation();
  const [xp, setXp] = useState(0);
  const [lvl, setLvl] = useState(0);
  const decodeJwt = (token: string): any | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };
  useEffect(() => {
    const fetchdetails = async () => {
      const id = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${baseURL}/api/user/lvl/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { lvl, xp } = res.data;
        setXp(xp);
        setLvl(lvl);
    
      }  
      fetchdetails();
  } , []);
  useEffect(() => {
    // Prefer real token from backend if available
    const token = localStorage.getItem("token");
    if (token) {
      const payload = decodeJwt(token);
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload && (!payload.exp || payload.exp > nowSec)) {
        // Map JWT payload to UI user shape
        const uiUser: UserType = {
          id: payload.id || "",
          name: payload.name || "User",
          email: payload.email || "",
          avatar: "/logo.png",
          bio: "",
          skills: [],
          level: payload.lvl ?? payload.level ?? 0,
          xp: payload.xp ?? 0,
          badges: [],
          isOnline: true,
        };
        setCurrentUser(uiUser);
        return;
      } else {
        // Expired/invalid
        localStorage.removeItem("token");
      }
    }
    // Fallback to mock auth state
    setCurrentUser(authAPI.getCurrentUser());
  }, [location.pathname]);

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsMenuOpen(false);
  };

  const navigation = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Discover", href: "/discover", icon: Trophy },
    { name: "Search", href: "/search", icon: Search },
    { name: "My Posts", href: "/myPost", icon: AlignJustify },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Requests", href: "/requests", icon: ClipboardList },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const loggedInRoutes = navigation.map((n) => n.href);
  const isLandingPage = location.pathname === "/";
  const isLoggedInRoute = loggedInRoutes.includes(location.pathname);
  const isLoggedIn = !!currentUser;

  const AuthActions = () => {
    if (isLoggedIn && currentUser) {
      return (

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex items-center space-x-2 rounded-lg px-2 py-1 focus:outline-none"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{currentUser.name}</span>
              <span className="text-xs text-gray-500">• {xp} XP</span>
            </motion.button>
          </DropdownMenuTrigger>

          <AnimatePresence>
            <DropdownMenuContent asChild className="w-56" align="end" forceMount>
              <motion.div
                key="dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <div className="px-2 py-1.5 text-sm font-medium">{currentUser.name}</div>
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Level {lvl} • {xp} XP
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </motion.div>
            </DropdownMenuContent>
          </AnimatePresence>
        </DropdownMenu>


      );
    }

    // Show Sign In / Sign Up if not logged in
    return (
      <>
        <Button asChild variant="outline" size="sm">
          <Link to="/signup">Sign Up</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/signin">Sign In</Link>
        </Button>
      </>
    );
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="SkillSwap Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <span className="text-xl font-bold gradient-text">SkillSwap</span>
          </Link>



          {/* Desktop Navigation */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map(({ name, href, icon: Icon }) => (
                <Link
                  key={name}
                  to={href}
                  className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon size={18} />
                  <span>{name}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-purple-300 hover:text-primary-foreground"
              >
                <Link to="/post">Post Skill</Link>
              </Button>
            )}
            <ThemeToggle />
            <AuthActions />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-4">
              {isLoggedIn &&
                navigation.map(({ name, href, icon: Icon }) => (
                  <Link
                    key={name}
                    to={href}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
                  >
                    <Icon size={18} />
                    <span>{name}</span>
                  </Link>
                ))}

              <div className="border-t pt-4 space-y-2">
                {!isLandingPage && (
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/post">Post Skill</Link>
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <AuthActions />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
