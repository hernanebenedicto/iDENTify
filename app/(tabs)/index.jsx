import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
// Fixed import path to be relative instead of alias
import { API, fetchPatientByEmail } from "../../constants/Api";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [patient, setPatient] = useState(null);
  const [upcomingAppt, setUpcomingAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    // Only show full loading spinner on initial load, not refresh
    if (!refreshing) setLoading(true);
    
    try {
      // 1. Get Patient ID
      const patientData = await fetchPatientByEmail(
        user.primaryEmailAddress.emailAddress
      );
      setPatient(patientData);

      if (patientData) {
        // 2. Get Appointments for this patient
        const res = await fetch(`${API.appointments}?patient_id=${patientData.id}`);
        const allAppts = await res.json();
        
        // Filter for upcoming appointments only
        const myAppts = allAppts
          .filter(
            (a) =>
              new Date(a.appointment_datetime) > new Date() &&
              a.status !== 'Done' && a.status !== 'Cancelled'
          )
          .sort(
            (a, b) =>
              new Date(a.appointment_datetime) - new Date(b.appointment_datetime)
          );

        setUpcomingAppt(myAppts.length > 0 ? myAppts[0] : null);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1B93D5"]} />
      }
    >
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>
            {patient ? patient.full_name.split(' ')[0] : "Guest"}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push("/profile")} 
          style={styles.profileButton}
          activeOpacity={0.7}
        >
           <Ionicons name="person" size={24} color="#1B93D5" />
        </TouchableOpacity>
      </View>

      {/* UPCOMING APPOINTMENT (HERO SECTION) */}
      <Text style={styles.sectionTitle}>Next Appointment</Text>
      
      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#1B93D5" />
        </View>
      ) : upcomingAppt ? (
        <TouchableOpacity 
          style={styles.heroCard}
          activeOpacity={0.9}
          onPress={() => router.push(`/appointments/${upcomingAppt.id}`)}
        >
          <View style={styles.heroBackgroundCircle} />
          
          <View style={styles.heroHeader}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="calendar" size={24} color="#1B93D5" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                {upcomingAppt.procedure || "Dental Checkup"}
              </Text>
              <Text style={styles.heroSubtitle}>
                {upcomingAppt.dentist_name || upcomingAppt.dentist || "Dr. Assigned"}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{upcomingAppt.status}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooter}>
            <View style={styles.heroTimeInfo}>
              <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.9)" />
              <Text style={styles.heroFooterText}>
                {new Date(upcomingAppt.appointment_datetime).toLocaleDateString(undefined, {
                  weekday: 'short', month: 'short', day: 'numeric'
                })}
                {' • '}
                {new Date(upcomingAppt.appointment_datetime).toLocaleTimeString([], {
                  hour: '2-digit', minute:'2-digit'
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyStateCard}>
          <View style={styles.emptyStateIcon}>
            <Ionicons name="calendar-outline" size={32} color="#A0AEC0" />
          </View>
          <Text style={styles.emptyStateText}>No upcoming appointments</Text>
          <TouchableOpacity onPress={() => router.push("/appointments/book")}>
            <Text style={styles.bookNowLink}>Book an appointment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QUICK ACTIONS GRID */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <QuickAction
          icon="add-circle"
          label="Book"
          color="#4C6EF5"
          onPress={() => router.push("/appointments/book")}
        />
        <QuickAction
          icon="list"
          label="Queue"
          color="#F59F00"
          onPress={() => router.push("/queue")}
        />
        <QuickAction
          icon="document-text"
          label="Records"
          color="#20C997"
          onPress={() => router.push("/records")}
        />
        <QuickAction
          icon="people"
          label="Family"
          color="#FA5252"
          onPress={() => router.push("/profile/family")}
        />
      </View>

      {/* SERVICES HORIZONTAL SCROLL */}
      <View style={styles.servicesHeader}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <Text style={styles.seeAllText}>See All</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.servicesSlider}
      >
        <ServiceCard title="Check-up" icon="medkit" />
        <ServiceCard title="Cleaning" icon="water" />
        <ServiceCard title="Filling" icon="construct" />
        <ServiceCard title="Extraction" icon="cut" />
        <ServiceCard title="Whitening" icon="sunny" />
        <ServiceCard title="Braces" icon="grid" />
      </ScrollView>
      
      {/* Bottom spacing */}
      <View style={{height: 20}} />
    </ScrollView>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ServiceCard({ title, icon }) {
  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceIconContainer}>
        <Ionicons name={icon} size={24} color="#1B93D5" />
      </View>
      <Text style={styles.serviceText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Cleaner off-white background
  },
  contentContainer: {
    padding: 24,
    paddingTop: 10,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  userName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* TITLES */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  /* HERO CARD (UPCOMING) */
  heroCard: {
    backgroundColor: "#1B93D5", // Primary Blue
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
    shadowColor: "#1B93D5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  heroBackgroundCircle: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  heroIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 14,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroFooterText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  /* EMPTY STATES & LOADING */
  loadingCard: {
    height: 140,
    backgroundColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  emptyStateCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    marginBottom: 28,
  },
  emptyStateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyStateText: {
    color: "#64748B",
    fontSize: 15,
    marginBottom: 8,
    fontWeight: "500",
  },
  bookNowLink: {
    color: "#1B93D5",
    fontWeight: "700",
    fontSize: 15,
  },

  /* QUICK ACTIONS GRID */
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  actionItem: {
    width: "48%", // 2 columns
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },

  /* SERVICES SLIDER */
  servicesHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 14
  },
  seeAllText: {
    color: '#1B93D5',
    fontWeight: '600',
    fontSize: 14
  },
  servicesSlider: {
    paddingRight: 20,
    paddingBottom: 20, // space for shadow
  },
  serviceCard: {
    backgroundColor: "white",
    width: 110,
    height: 120,
    borderRadius: 20,
    padding: 12,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
  },
});