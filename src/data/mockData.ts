// Mock data for local backend simulation
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  skills: string[];
  level: number;
  xp: number;
  badges: string[];
  isOnline: boolean;
}

export interface SkillPost {
  id: string;
  userId: string;
  user: User;
  title: string;
  description: string;
  skillOffered: string;
  skillWanted: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: User;
  toUser: User;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

// Mock current user
export const currentUser: User = {
  id: "user-1",
  name: "Alex Chen",
  email: "user@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  bio: "Full-stack developer passionate about React and Node.js. Always eager to learn new technologies!",
  skills: ["React", "Node.js", "TypeScript", "Python"],
  level: 3,
  xp: 350,
  badges: ["First Swap", "Helper", "Quick Learner"],
  isOnline: true
};

// Mock users
export const mockUsers: User[] = [
  {
    id: "user-2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e8dc31?w=400&h=400&fit=crop&crop=face",
    bio: "UI/UX designer with 5 years of experience. Love creating beautiful and functional designs.",
    skills: ["Figma", "Sketch", "Photoshop", "User Research"],
    level: 4,
    xp: 580,
    badges: ["Design Master", "Mentor"],
    isOnline: true
  },
  {
    id: "user-3",
    name: "Mike Rodriguez",
    email: "mike@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Data scientist specializing in machine learning and AI. Love working with Python and R.",
    skills: ["Python", "Machine Learning", "Data Analysis", "R"],
    level: 5,
    xp: 720,
    badges: ["Data Expert", "AI Pioneer"],
    isOnline: false
  }
];

// Mock skill posts
export const mockSkillPosts: SkillPost[] = [
  {
    id: "post-1",
    userId: "user-2",
    user: mockUsers[0],
    title: "Figma Design Skills for React Development",
    description: "I'm a UI/UX designer looking to learn React development. I can help you create beautiful designs in return!",
    skillOffered: "Figma Design",
    skillWanted: "React Development",
    createdAt: "2024-01-15T10:30:00Z",
    likes: 15,
    comments: 8
  },
  {
    id: "post-2",
    userId: "user-3",
    user: mockUsers[1],
    title: "Python & Data Science for Web Development",
    description: "Experienced data scientist willing to teach Python and ML concepts in exchange for modern web development skills.",
    skillOffered: "Python & Machine Learning",
    skillWanted: "Modern Web Development",
    createdAt: "2024-01-14T15:45:00Z",
    likes: 23,
    comments: 12
  }
];

// Mock messages
export const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderId: "user-2",
    receiverId: "user-1",
    content: "Hi! I saw your post about React development. I'd love to learn more!",
    timestamp: "2024-01-15T14:30:00Z",
    read: false
  },
  {
    id: "msg-2",
    senderId: "user-1",
    receiverId: "user-2",
    content: "That sounds great! I'd be happy to help you with React. Your design skills would be amazing to learn!",
    timestamp: "2024-01-15T14:45:00Z",
    read: true
  }
];

// Mock swap requests
export const mockSwapRequests: SwapRequest[] = [
  {
    id: "req-1",
    fromUserId: "user-2",
    toUserId: "user-1",
    fromUser: mockUsers[0],
    toUser: currentUser,
    skillOffered: "Figma Design",
    skillWanted: "React Development",
    message: "I'd love to trade my design skills for your React expertise!",
    status: "pending",
    createdAt: "2024-01-15T09:00:00Z"
  }
];

// Auth state management
let isAuthenticated = false;
let authUser: User | null = null;

export const authAPI = {
  login: (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === "user@example.com" && password === "12345678") {
          isAuthenticated = true;
          authUser = currentUser;
          resolve({ success: true, user: currentUser });
        } else {
          resolve({ success: false });
        }
      }, 1000);
    });
  },
  
  register: (email: string, password: string, name: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
  
  logout: () => {
    isAuthenticated = false;
    authUser = null;
  },
  
  getCurrentUser: (): User | null => authUser,
  
  isLoggedIn: (): boolean => isAuthenticated
};