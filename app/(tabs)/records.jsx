import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { API, fetchPatientByEmail } from "../../constants/Api";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";

export default function RecordsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecords = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    if (!refreshing) setLoading(true);
    try {
      const patient = await fetchPatientByEmail(user.primaryEmailAddress.emailAddress);
      
      if (patient) {
        // Fetching Timeline for this patient
        const res = await fetch(`${API.records}/${patient.id}`);
        const data = await res.json();
        
        // Sort records by date (newest first), assuming start_time is comparable or ISO string
        // If start_time is just "HH:MM", this sort might need adjustment based on your DB date storage
        setRecords(data.reverse()); 
      }
    } catch (error) {
      console.error("Records fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecords();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [user])
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <View style={styles.recordCountBadge}>
          <Text style={styles.recordCountText}>{records.length} Files</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1B93D5"]} />
        }
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#059669" />
          <Text style={styles.infoBannerText}>
            Your medical history is secure and private.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Treatment History</Text>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#1B93D5" style={{marginTop: 40}} />
        ) : records.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="folder-open-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptySubtitle}>
              Completed treatments and procedures will appear here.
            </Text>
          </View>
        ) : (
          records.map((rec) => (
            <TouchableOpacity
              key={rec.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => router.push(`/records/details?id=${rec.id}`)}
            >
              {/* Icon Side */}
              <View style={styles.iconColumn}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text" size={24} color="#1B93D5" />
                </View>
              </View>

              {/* Content Side */}
              <View style={styles.contentColumn}>
                <Text style={styles.cardTitle}>{rec.procedure_text || "General Procedure"}</Text>
                
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>
                    {rec.provider || "Unknown Provider"}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>
                    {rec.start_time || "Date not recorded"}
                  </Text>
                </View>
              </View>

              {/* Status/Arrow Side */}
              <View style={styles.actionColumn}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Done</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" style={{marginTop: 12}} />
              </View>
            </TouchableOpacity>
          ))
        )}
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
  recordCountBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordCountText: {
    color: "#0284C7",
    fontWeight: "700",
    fontSize: 12,
  },

  /* INFO BANNER */
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#D1FAE5"
  },
  infoBannerText: {
    marginLeft: 10,
    color: "#047857",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
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
    alignItems: "flex-start",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconColumn: {
    marginRight: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F0F9FF",
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "500",
  },
  actionColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "#166534",
    fontSize: 10,
    fontWeight: "700",
    textTransform: 'uppercase',
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
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 22,
  },
});