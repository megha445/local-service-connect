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
  paymentMethod: "Cash on Delivery" | "Online Payment";
  paymentStatus: "Paid" | "Pending" | "Failed";
  status: "Pending" | "Completed";
  createdAt: string;
}

export interface Review {
  id: string;
  appointmentId: string;
  userId: string;
  userName: string;
  providerId: string;
  rating: number;
  reviewText: string;
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
    .filter(a => a.providerId === providerId && a.serviceDate === date && a.paymentStatus !== "Failed")
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

function initData() {
  if (!localStorage.getItem("lsc_providers")) {
    localStorage.setItem("lsc_providers", JSON.stringify(defaultProviders));
  }
  if (!localStorage.getItem("lsc_appointments")) {
    localStorage.setItem("lsc_appointments", JSON.stringify([]));
  }
  if (!localStorage.getItem("lsc_reviews")) {
    localStorage.setItem("lsc_reviews", JSON.stringify([]));
  }
  if (!localStorage.getItem("lsc_users")) {
    const admin: User = { id: "admin1", name: "Admin", email: "admin@localservice.com", role: "admin", createdAt: new Date().toISOString() };
    localStorage.setItem("lsc_users", JSON.stringify([admin]));
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
export function createAppointment(apt: Omit<Appointment, "id" | "createdAt" | "status">): Appointment {
  const appointments: Appointment[] = JSON.parse(localStorage.getItem("lsc_appointments") || "[]");
  const conflict = appointments.find(a => a.providerId === apt.providerId && a.serviceDate === apt.serviceDate && a.timeSlot === apt.timeSlot && a.paymentStatus !== "Failed");
  if (conflict) throw new Error("This time slot is already booked");
  const newApt: Appointment = { ...apt, id: `a${Date.now()}`, status: "Pending", createdAt: new Date().toISOString() };
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

export function markAppointmentCompleted(appointmentId: string): void {
  const appointments: Appointment[] = JSON.parse(localStorage.getItem("lsc_appointments") || "[]");
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx >= 0) {
    appointments[idx].status = "Completed";
    // For Cash on Delivery, mark payment as Paid once the service is completed
    if (
      appointments[idx].paymentMethod === "Cash on Delivery" &&
      appointments[idx].paymentStatus === "Pending"
    ) {
      appointments[idx].paymentStatus = "Paid";
    }
    localStorage.setItem("lsc_appointments", JSON.stringify(appointments));
  }
}

// Review helpers
export function addReview(review: Omit<Review, "id" | "createdAt">): Review {
  const reviews: Review[] = JSON.parse(localStorage.getItem("lsc_reviews") || "[]");
  const exists = reviews.find(r => r.appointmentId === review.appointmentId);
  if (exists) throw new Error("You have already reviewed this booking");
  const newReview: Review = { ...review, id: `r${Date.now()}`, createdAt: new Date().toISOString() };
  reviews.push(newReview);
  localStorage.setItem("lsc_reviews", JSON.stringify(reviews));
  return newReview;
}

export function getReviewsForProvider(providerId: string): Review[] {
  const reviews: Review[] = JSON.parse(localStorage.getItem("lsc_reviews") || "[]");
  return reviews.filter(r => r.providerId === providerId);
}

export function getAverageRating(providerId: string): number | null {
  const reviews = getReviewsForProvider(providerId);
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function hasReviewedAppointment(appointmentId: string): boolean {
  const reviews: Review[] = JSON.parse(localStorage.getItem("lsc_reviews") || "[]");
  return reviews.some(r => r.appointmentId === appointmentId);
}
