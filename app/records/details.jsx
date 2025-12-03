import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, StatusBar, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { API } from "../../constants/Api";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from "react-native-safe-area-context";

export default function RecordDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchRecord = async () => {
      setLoading(true);
      try {
        console.log(`Fetching record ID: ${id}...`);
        const res = await fetch(`${API.records}/record/${id}`);
        if (res.ok) {
          const data = await res.json();
          // DEBUG: Log the data to see if image_url exists
          console.log("Record Data Fetched:", JSON.stringify(data, null, 2)); 
          setRecord(data);
        } else {
          console.error("Failed to fetch record details");
        }
      } catch (error) {
        console.error("Error fetching record:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDownload = async () => {
    console.log("Download button pressed...");

    if (!record?.image_url) {
        Alert.alert("Error", "No file URL found in this record.");
        return;
    }

    try {
        setDownloading(true);

        // 1. Determine filename
        const fileName = record.image_url.split("/").pop() || `record-${id}.pdf`;
        const fileUri = FileSystem.cacheDirectory + fileName;

        console.log(`Downloading from: ${record.image_url}`);
        console.log(`Saving to: ${fileUri}`);

        // 2. Download to Cache
        const downloadRes = await FileSystem.downloadAsync(record.image_url, fileUri);

        if (downloadRes.status !== 200) {
            Alert.alert("Error", "Download failed with status code: " + downloadRes.status);
            return;
        }

        console.log("Download successful:", downloadRes.uri);
        
        // 3. Share/Save (This allows user to 'Save to Files')
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadRes.uri, {
                mimeType: 'application/pdf', // Hint for Android
                dialogTitle: 'Save your Medical Record'
            });
        } else {
            Alert.alert("Success", "File downloaded to cache (Sharing not available on this device).");
        }

    } catch (err) {
        console.error("Download Loop Error:", err);
        Alert.alert("Error", "Download failed: " + err.message);
    } finally {
        setDownloading(false);
    }
  };

  const handleShare = async () => {
    console.log("Share button pressed...");

    if (!record?.image_url) {
        Alert.alert("Error", "No file to share.");
        return;
    }

    try {
        setSharing(true);

        const fileName = record.image_url.split("/").pop();
        const fileUri = FileSystem.cacheDirectory + fileName;

        // Check if file already exists in cache, if not, download it first
        const fileInfo = await FileSystem.getInfoAsync(fileUri);

        if (!fileInfo.exists) {
            console.log("File not in cache, downloading for share...");
            const downloadRes = await FileSystem.downloadAsync(record.image_url, fileUri);
            if(downloadRes.status !== 200) throw new Error("Could not download file for sharing");
        }

        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Medical Record'
        });

    } catch (err) {
        console.log("Share Error:", err);
        Alert.alert("Error", "Sharing failed.");
    } finally {
        setSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B93D5" />
        <Text style={styles.loadingText}>Loading record...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#999" />
        <Text style={styles.errorText}>Record not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format date nicely
  const formattedDate = new Date(record.start_time).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Check if file exists for UI logic
  const hasFile = !!record.image_url;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: "Details", 
        headerStyle: { backgroundColor: '#F8F9FA' },
        headerShadowVisible: false
      }} />
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Section: Provider Info */}
        <View style={styles.headerSection}>
          <View style={styles.providerAvatar}>
            <Text style={styles.avatarText}>
              {record.provider ? record.provider.charAt(0).toUpperCase() : "D"}
            </Text>
          </View>
          <View>
            <Text style={styles.providerLabel}>Provided By</Text>
            <Text style={styles.providerName}>{record.provider || "Unknown Provider"}</Text>
          </View>
        </View>

        {/* Main Card: Procedure & Date */}
        <View style={styles.mainCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="medical" size={24} color="#1B93D5" />
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>
          
          <Text style={styles.procedureTitle}>{record.procedure_text}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Clinical Notes Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Clinical Notes</Text>
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>
              {record.notes || "No clinical notes were recorded for this session."}
            </Text>
          </View>
        </View>

        {/* Attachments Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Attachments</Text>
          {hasFile ? (
            <TouchableOpacity style={styles.attachmentCard} onPress={handleDownload}>
              <View style={styles.fileIconBox}>
                <Ionicons name="document-text" size={24} color="#FFF" />
              </View>
              <View style={styles.attachmentInfo}>
                <Text style={styles.attachmentName}>
                    {record.image_url.split("/").pop() || "Medical_Record.pdf"}
                </Text>
                <Text style={styles.attachmentSize}>Tap to download</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          ) : (
             <View style={styles.emptyStateBox}>
               <Text style={styles.emptyStateText}>No attachments found</Text>
             </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          
          {/* <TouchableOpacity 
            style={[
                styles.secondaryButton, 
                (!hasFile || sharing) && { opacity: 0.6, backgroundColor: '#E5E7EB', borderColor: '#D1D5DB' }
            ]} 
            onPress={handleShare}
            disabled={sharing || !hasFile}
          >
             {sharing ? (
                 <ActivityIndicator size="small" color="#1B93D5" />
             ) : (
                <>
                    <Ionicons name="share-social-outline" size={20} color={hasFile ? "#1B93D5" : "#9CA3AF"} />
                    <Text style={[styles.secondaryButtonText, !hasFile && { color: "#9CA3AF" }]}>Share</Text>
                </>
             )}
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity 
             style={[
                 styles.primaryButton, 
                 (!hasFile || downloading) && { opacity: 0.6, backgroundColor: '#9CA3AF', shadowOpacity: 0 }
             ]} 
             onPress={handleDownload}
             disabled={downloading || !hasFile}
          >
             {downloading ? (
                 <ActivityIndicator size="small" color="#FFF" />
             ) : (
                <>
                    <Ionicons name="download-outline" size={20} color="#FFF" />
                    <Text style={styles.primaryButtonText}>
                        {hasFile ? "Download" : "No File"}
                    </Text>
                </>
             )}
          </TouchableOpacity> */}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#374151",
    marginVertical: 10,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#374151",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F2FE", // Light blue
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0284C7",
  },
  providerLabel: {
    fontSize: 12,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  providerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  // Main Card
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: "#ECFDF5", // Light green
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
  },
  procedureTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 16,
    lineHeight: 28,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  metaText: {
    marginLeft: 6,
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },

  // Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    marginLeft: 4,
  },
  notesContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#1B93D5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 2,
  },
  notesText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
  },
  
  // Attachments
  attachmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#EF4444", // Red for PDF feel
    justifyContent: "center",
    alignItems: "center",
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  attachmentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  attachmentSize: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  emptyStateBox: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontStyle: 'italic'
  },

  // Action Buttons
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  secondaryButtonText: {
    color: "#1B93D5",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#1B93D5",
    shadowColor: "#1B93D5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});