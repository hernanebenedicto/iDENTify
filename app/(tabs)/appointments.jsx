import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/clerk-expo";
import { API, fetchPatientByEmail } from "../../constants/Api";
import { useFocusEffect } from "expo-router";

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    if (!refreshing) setLoading(true);
    try {
      const patient = await fetchPatientByEmail(user.primaryEmailAddress.emailAddress);
      
      if (patient) {
        // Fetch appointments for this specific patient
        const res = await fetch(`${API.appointments}?patient_id=${patient.id}`);
        const myAppts = await res.json();
        
        // Sort by date (newest/upcoming first)
        myAppts.sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime));
        
        setAppointments(myAppts);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [user])
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Done': return { bg: '#DCFCE7', text: '#166534' }; // Green
      case 'Cancelled': return { bg: '#FEE2E2', text: '#991B1B' }; // Red
      case 'Checked-In': return { bg: '#DBEAFE', text: '#1E40AF' }; // Blue
      default: return { bg: '#FEF3C7', text: '#92400E' }; // Yellow/Orange (Scheduled/Pending)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/appointments/book")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1B93D5"]} />
        }
      >
        {/* Helper Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#1B93D5" />
          <Text style={styles.infoBannerText}>
            Tap an appointment to view details.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>History & Scheduled</Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#1B93D5" style={{marginTop: 40}} />
        ) : appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-clear-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No appointments yet</Text>
            <Text style={styles.emptySubtitle}>Book your first visit today!</Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push("/appointments/book")}
            >
              <Text style={styles.emptyButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          appointments.map((appt) => {
            const statusStyle = getStatusStyle(appt.status);
            const apptDate = new Date(appt.appointment_datetime);
            
            return (
              <TouchableOpacity
                key={appt.id}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/appointments/${appt.id}`)}
              >
                {/* Date Column */}
                <View style={styles.dateColumn}>
                  <Text style={styles.dateDay}>{apptDate.getDate()}</Text>
                  <Text style={styles.dateMonth}>
                    {apptDate.toLocaleDateString(undefined, { month: 'short' })}
                  </Text>
                </View>

                {/* Divider */}
                <View style={styles.verticalDivider} />

                {/* Details Column */}
                <View style={styles.detailsColumn}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.procedureText} numberOfLines={1}>
                      {appt.procedure || appt.reason || "Dental Visit"}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {appt.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>
                      {apptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={14} color="#64748B" />
                    <Text style={styles.metaText}>
                      {appt.dentist_name || appt.dentist || "Dr. Assigned"}
                    </Text>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
        
        {/* Bottom spacer */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  
  /* HEADER */
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#F8FAFC",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1B93D5",
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#1B93D5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  /* INFO BANNER */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#E0F2FE",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoBannerText: {
    marginLeft: 8,
    color: "#0369A1",
    fontSize: 14,
    fontWeight: "500",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  /* CARD STYLES */
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  dateColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B93D5",
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: 'uppercase',
  },
  verticalDivider: {
    width: 1,
    height: '80%',
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },
  detailsColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  procedureText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "500",
  },
  arrowContainer: {
    marginLeft: 10,
  },

  /* EMPTY STATE */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 24,
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#1B93D5",
    borderRadius: 12,
    shadowColor: "#1B93D5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});