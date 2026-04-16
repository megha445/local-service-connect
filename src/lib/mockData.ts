export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  priceInRupees: number;
  location: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  serviceType: string;
  serviceDate: string;
  timeSlot: string;
  customerName: string;
  phone: string;
  address: string;
  priceInRupees: number;
  paymentMethod: string;
  status: "Pending" | "Completed";
  createdAt: string;
}

export const TIME_SLOTS = [
  "09:00–10:00",
  "10:00–11:00",
  "11:00–12:00",
  "12:00–13:00",
  "13:00–14:00",
  "14:00–15:00",
  "15:00–16:00",
  "16:00–17:00",
  "17:00–18:00",
];

export function getBookedSlots(providerId: string, date: string): string[] {
  const appointments: Appointment[] = JSON.parse(localStorage.getItem("lsc_appointments") || "[]");
  return appointments
    .filter(a => a.providerId === providerId && a.serviceDate === date)
    .map(a => a.timeSlot);
}

export const serviceCategories = [
  { name: "Plumber", icon: "🔧", description: "Pipe repairs, installations & maintenance" },
  { name: "Electrician", icon: "⚡", description: "Wiring, fixtures & electrical repairs" },
  { name: "Cleaner", icon: "🧹", description: "Home & office deep cleaning services" },
  { name: "Mechanic", icon: "🔩", description: "Vehicle repair & maintenance services" },
];

const defaultProviders: Provider[] = [
  { id: "p1", name: "Rajesh Kumar", serviceType: "Plumber", rating: 4.8, priceInRupees: 500, location: "Koramangala, Bangalore", createdAt: new Date().toISOString() },
  { id: "p2", name: "Suresh Sharma", serviceType: "Plumber", rating: 4.5, priceInRupees: 450, location: "Indiranagar, Bangalore", createdAt: new Date().toISOString() },
  { id: "p3", name: "Amit Verma", serviceType: "Electrician", rating: 4.9, priceInRupees: 600, location: "HSR Layout, Bangalore", createdAt: new Date().toISOString() },
  { id: "p4", name: "Vikram Singh", serviceType: "Electrician", rating: 4.6, priceInRupees: 550, location: "Whitefield, Bangalore", createdAt: new Date().toISOString() },
  { id: "p5", name: "Priya Cleaning Services", serviceType: "Cleaner", rating: 4.7, priceInRupees: 800, location: "JP Nagar, Bangalore", createdAt: new Date().toISOString() },
  { id: "p6", name: "CleanHome Pro", serviceType: "Cleaner", rating: 4.4, priceInRupees: 700, location: "BTM Layout, Bangalore", createdAt: new Date().toISOString() },
  { id: "p7", name: "AutoFix Garage", serviceType: "Mechanic", rating: 4.8, priceInRupees: 1000, location: "Electronic City, Bangalore", createdAt: new Date().toISOString() },
  { id: "p8", name: "Ravi Auto Works", serviceType: "Mechanic", rating: 4.3, priceInRupees: 900, location: "Marathahalli, Bangalore", createdAt: new Date().toISOString() },
];

// Initialize localStorage with default data
function initData() {
  if (!localStorage.getItem("lsc_providers")) {
    localStorage.setItem("lsc_providers", JSON.stringify(defaultProviders));
  }
  if (!localStorage.getItem("lsc_appointments")) {
    localStorage.setItem("lsc_appointments", JSON.stringify([]));
  }
  if (!localStorage.getItem("lsc_users")) {
    // Seed admin user
    const admin: User = { id: "admin1", name: "Admin", email: "admin@localservice.com", role: "admin", createdAt: new Date().toISOString() };
    localStorage.setItem("lsc_users", JSON.stringify([admin]));
    // Store password separately (demo only)
    localStorage.setItem("lsc_passwords", JSON.stringify({ "admin@localservice.com": "admin123" }));
  }
}

initData();

// Auth helpers
export function register(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users: User[] = JSON.parse(localStorage.getItem("lsc_users") || "[]");
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem("lsc_passwords") || "{}");
  if (users.find(u => u.email === email)) return { success: false, error: "Email already registered" };
  const user: User = { id: `u${Date.now()}`, name, email, role: "user", createdAt: new Date().toISOString() };
  users.push(user);
  passwords[email] = password;
  localStorage.setItem("lsc_users", JSON.stringify(users));
  localStorage.setItem("lsc_passwords", JSON.stringify(passwords));
  return { success: true, user };
}

export function login(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users: User[] = JSON.parse(localStorage.getItem("lsc_users") || "[]");
  const passwords: Record<string, string> = JSON.parse(localStorage.getItem("lsc_passwords") || "{}");
  const user = users.find(u => u.email === email);
  if (!user || passwords[email] !== password) return { success: false, error: "Invalid email or password" };
  localStorage.setItem("lsc_currentUser", JSON.stringify(user));
  return { success: true, user };
}

export function logout() {
  localStorage.removeItem("lsc_currentUser");
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem("lsc_currentUser");
  return data ? JSON.parse(data) : null;
}

// Provider helpers
export function getProviders(serviceType?: string): Provider[] {
  const providers: Provider[] = JSON.parse(localStorage.getItem("lsc_providers") || "[]");
  return serviceType ? providers.filter(p => p.serviceType === serviceType) : providers;
}

export function addProvider(provider: Omit<Provider, "id" | "createdAt">): Provider {
  const providers: Provider[] = JSON.parse(localStorage.getItem("lsc_providers") || "[]");
  const newProvider: Provider = { ...provider, id: `p${Date.now()}`, createdAt: new Date().toISOString() };
  providers.push(newProvider);
  localStorage.setItem("lsc_providers", JSON.stringify(providers));
  return newProvider;
}

// Appointment helpers
export function createAppointment(apt: Omit<Appointment, "id" | "createdAt" | "status" | "paymentMethod">): Appointment {
  const appointments: Appointment[] = JSON.parse(localStorage.getItem("lsc_appointments") || "[]");
  // Check for double booking
  const conflict = appointments.find(a => a.providerId === apt.providerId && a.serviceDate === apt.serviceDate && a.timeSlot === apt.timeSlot);
  if (conflict) throw new Error("This time slot is already booked");
  const newApt: Appointment = { ...apt, id: `a${Date.now()}`, paymentMethod: "Cash on Delivery", status: "Pending", createdAt: new Date().toISOString() };
  appointments.push(newApt);
  localStorage.setItem("lsc_appointments", JSON.stringify(appointments));
  return newApt;
}

export function getMyAppointments(userId: string): Appointment[] {
  const appointments: Appointment[] = JSON.parse(localStorage.getItem("lsc_appointments") || "[]");
  return appointments.filter(a => a.userId === userId);
}

export function getAllAppointments(): Appointment[] {
  return JSON.parse(localStorage.getItem("lsc_appointments") || "[]");
}
