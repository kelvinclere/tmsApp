import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, { Circle, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { baseUrl } from "@/configs/app-config";
import { Picker } from "@react-native-picker/picker";
import QRCode from "react-native-qrcode-svg";

type TrainingDetailsAdminProps = {
  trainingId: string;
  goBack: () => void;
};

type UpdateEventData = {
  event_id: string;
  longitude?: number;
  latitude?: number;
  geo_radius?: number;
  event_image?: string; // name only (server shows it), we actually upload file in RN
  event_type?: string;
  session_id?: string;
  event_name?: string;
  event_description?: string;
  event_location?: string;
};

type TrainingResponse = {
  event_id: string;
  event_name: string;
  event_description: string;
  event_location: string;
  event_type: "physical" | "virtual";
  event_image?: string;
  expired: boolean;
  latitude?: number;
  longitude?: number;
  geo_radius?: number;
  facilitator?: { first_name?: string; last_name?: string };
  total_sessions?: number;
  total_enrolled?: number;
  total_attended?: number;
  sessions?: Array<{
    session_id: string;
    session_type: string;
    session?: string;
    start_time?: string | number | Date;
    end_time?: string | number | Date;
  }>;
};

// ---------- Fallback hook if your project doesn't expose useSessions ----------
function useSessionsFallback() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions-all"],
    queryFn: async () => {
      const res = await axios.get("/api/v1/cemastea/sessions");
      return res?.data?.response || [];
    },
  });
  return { sessions: data, isLoadingSessions: isLoading, errorSessions: error as any };
}
// -----------------------------------------------------------------------------
// If you DO have "@/hooks/use-sessions", switch these 2 lines:
// const { sessions, isLoadingSessions, errorSessions } = useSessions();
const { sessions: _ignore, isLoadingSessions: _i, errorSessions: _e } = { sessions: undefined, isLoadingSessions: false, errorSessions: null }; // silence TS
// -----------------------------------------------------------------------------

export default function TrainingDetailsAdmin({
  trainingId,
  goBack,
}: TrainingDetailsAdminProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // We’ll try to use your project's hook; if not present we’ll fallback.
  // @ts-ignore
  const sessionsHook = (typeof (require as any) === "function" && (() => {
    try {
      // Lazy require to avoid bundler issues if the file doesn't exist
      const m = require("@/hooks/use-sessions");
      return m?.default ? m.default() : useSessionsFallback();
    } catch {
      return useSessionsFallback();
    }
  })) as () => { sessions: any[]; isLoadingSessions: boolean; errorSessions: any };

  const { sessions, isLoadingSessions, errorSessions } = sessionsHook();

  // Local edit form state
  const [formData, setFormData] = useState<UpdateEventData>({ event_id: trainingId });

  // Selected image file (RN style)
  const [pickedImage, setPickedImage] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);

  // Load training
  const {
    data: training,
    isLoading: trainingLoading,
    error: trainingError,
  } = useQuery<TrainingResponse | null>({
    queryKey: ["specific-training", trainingId],
    queryFn: async () => {
      if (!trainingId) return null;
      const res = await axios.get(`/api/v1/cemastea/event`, {
        params: { event_id: trainingId },
      });
      return res?.data?.response as TrainingResponse;
    },
    enabled: !!trainingId,
  });

  // Sync default form values when entering edit mode
  useEffect(() => {
    if (isEditing && training) {
      setFormData((prev) => ({
        ...prev,
        event_name: training.event_name,
        event_description: training.event_description,
        event_location: training.event_location,
        event_type: training.event_type,
        latitude: training.latitude,
        longitude: training.longitude,
        geo_radius: training.geo_radius,
        session_id: prev.session_id, // keep if user changed
        event_image: training.event_image,
      }));
    }
  }, [isEditing, training]);

  // Mutate (update)
  const updateEventMutation = useMutation({
    mutationFn: async (data: UpdateEventData) => {
      const fd = new FormData();

      fd.append("event_id", data.event_id);
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "event_id" && value !== undefined && value !== "") {
          fd.append(key, String(value));
        }
      });

      if (pickedImage) {
        // server expects `event_image` field as a file in multipart
        fd.append("event_image", {
          // @ts-ignore — RN FormData accepts this
          uri: pickedImage.uri,
          name: pickedImage.name,
          type: pickedImage.type,
        });
      }

      const res = await axios.put("/api/v1/cemastea/update-event", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      setUpdateSuccess(true);
      setUpdateError(null);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["specific-training", trainingId] });
      setTimeout(() => setUpdateSuccess(false), 3000);
    },
    onError: (err: any) => {
      setUpdateError(err?.response?.data?.message || "Failed to update event");
      setUpdateSuccess(false);
    },
  });

  const handleInputChange = (field: keyof UpdateEventData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const nameFromUri =
        asset.fileName ||
        asset.uri.split("/").pop() ||
        `event_${Date.now()}.jpg`;
      const typeGuess =
        asset.mimeType ||
        (nameFromUri.endsWith(".png") ? "image/png" : "image/jpeg");

      setPickedImage({ uri: asset.uri, name: nameFromUri, type: typeGuess });
      handleInputChange("event_image", nameFromUri);
    }
  };

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setUpdateError("Location permission denied.");
        setLocationLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      handleInputChange("latitude", loc.coords.latitude);
      handleInputChange("longitude", loc.coords.longitude);
      setUpdateError(null);
    } catch (e: any) {
      setUpdateError(`Error getting location: ${e?.message || "Unknown"}`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSave = () => {
    const dataToUpdate = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== "" && key !== "event_id") {
        // @ts-ignore
        acc[key] = value;
      }
      return acc;
    }, { event_id: trainingId } as Partial<UpdateEventData>) as UpdateEventData;

    updateEventMutation.mutate(dataToUpdate);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ event_id: trainingId });
    setPickedImage(null);
    setUpdateError(null);
  };

  const heroImageUri = useMemo(() => {
    const name = (isEditing ? formData.event_image : training?.event_image) || "";
    return `${baseUrl}/api/v1/cemastea/images?eventimage=${encodeURIComponent(name)}`;
  }, [baseUrl, formData.event_image, isEditing, training?.event_image]);

  const mapRegion: Region | undefined = useMemo(() => {
    const lat = isEditing ? formData.latitude : training?.latitude;
    const lng = isEditing ? formData.longitude : training?.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      return {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    return undefined;
  }, [formData.latitude, formData.longitude, isEditing, training?.latitude, training?.longitude]);

  if (trainingLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (trainingError) {
    return (
      <View style={styles.centered}>
        <Text>{(trainingError as any)?.message || "Failed to load training"}</Text>
      </View>
    );
  }

  if (errorSessions) {
    // Not fatal — we can still render the page
    console.warn("Sessions error:", errorSessions?.message || errorSessions);
  }

  return (
    <View style={styles.container}>
      {/* Header actions */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={goBack} style={[styles.btn, styles.btnOutlined]}>
          <Text style={[styles.btnText, styles.btnOutlinedText]}>‹ Back</Text>
        </TouchableOpacity>

        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={[styles.btn, styles.btnPrimary]}
          >
            <Text style={styles.btnText}>✎ Edit Training</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.btn, styles.btnOutlined]}
            >
              <Text style={[styles.btnText, styles.btnOutlinedText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateEventMutation.isPending}
              style={[
                styles.btn,
                styles.btnPrimary,
                updateEventMutation.isPending && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.btnText}>
                {updateEventMutation.isPending ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Success / Error banners */}
      {updateSuccess && (
        <View style={[styles.banner, styles.bannerSuccess]}>
          <Text style={styles.bannerText}>Event updated successfully!</Text>
        </View>
      )}
      {updateError && (
        <View style={[styles.banner, styles.bannerError]}>
          <Text style={styles.bannerText}>{updateError}</Text>
        </View>
      )}

      {!training ? (
        <View style={styles.centered}>
          <Text>No training details available.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Images */}
          <View style={{ marginTop: 12 }}>
            <Image
              source={{ uri: heroImageUri }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={{ marginTop: -40, paddingLeft: 12 }}>
              <Image
                source={{ uri: heroImageUri }}
                style={styles.thumbnail}
                resizeMode="contain"
              />
            </View>

            {isEditing && (
              <View style={styles.uploadFloating}>
                <TouchableOpacity onPress={handlePickImage} style={styles.iconBtn}>
                  <Text style={{ fontSize: 12 }}>⬆️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Title */}
          {!isEditing ? (
            <Text style={styles.title}>{training.event_name}</Text>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Event Name"
              defaultValue={training.event_name}
              onChangeText={(t) => handleInputChange("event_name", t)}
            />
          )}

          {/* Description */}
          {!isEditing ? (
            <Text style={styles.description}>{training.event_description}</Text>
          ) : (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Event Description"
              defaultValue={training.event_description}
              multiline
              onChangeText={(t) => handleInputChange("event_description", t)}
            />
          )}

          {/* Divider */}
          <View style={styles.hr} />

          {/* Two columns block */}
          <View style={styles.grid2}>
            {/* Col 1 */}
            <View>
              {/* Event Type */}
              {!isEditing ? (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.meta}>
                    <Text style={styles.metaStrong}>Type:</Text> {training.event_type}
                  </Text>
                </View>
              ) : (
                <View style={{ marginBottom: 12 }}>
                  <Text style={styles.label}>Event Type</Text>
                  <View style={styles.pickerWrap}>
                    <Picker
                      selectedValue={formData.event_type || training.event_type}
                      onValueChange={(v) => handleInputChange("event_type", v)}
                    >
                      <Picker.Item label="Physical" value="physical" />
                      <Picker.Item label="Virtual" value="virtual" />
                    </Picker>
                  </View>
                </View>
              )}

              {/* Event Location */}
              {!isEditing ? (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.meta}>
                    <Text style={styles.metaStrong}>Location:</Text>{" "}
                    {training.event_location}
                  </Text>
                </View>
              ) : (
                <TextInput
                  style={styles.input}
                  placeholder="Event Location"
                  defaultValue={training.event_location}
                  onChangeText={(t) => handleInputChange("event_location", t)}
                />
              )}

              {/* Status Chip */}
              <View style={{ marginBottom: 10, flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.metaStrong}>Status: </Text>
                <View
                  style={[
                    styles.chip,
                    training.expired ? styles.chipError : styles.chipSuccess,
                  ]}
                >
                  <Text style={styles.chipText}>
                    {training.expired ? "Expired" : "Active"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Col 2 */}
            <View>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.meta}>
                  <Text style={styles.metaStrong}>Facilitator:</Text>{" "}
                  {training.facilitator?.first_name} {training.facilitator?.last_name}
                </Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={styles.meta}>
                  <Text style={styles.metaStrong}>Total Sessions:</Text>{" "}
                  {training.total_sessions ?? 0}
                </Text>
              </View>

              <View style={{ marginBottom: 10 }}>
                <Text style={styles.meta}>
                  <Text style={styles.metaStrong}>Enrolled:</Text>{" "}
                  {training.total_enrolled ?? 0}{" "}
                  <Text style={styles.metaStrong}>| Attended:</Text>{" "}
                  {training.total_attended ?? 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Additional Settings (edit only) */}
          {isEditing && (
            <>
              <View style={styles.hr} />
              <Text style={styles.sectionTitle}>Additional Settings</Text>

              <View style={styles.grid2}>
                {/* Left */}
                <View>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={styles.subTitle}>Location Coordinates</Text>

                    <View style={styles.row}>
                      <TextInput
                        style={[styles.input, styles.inputHalf]}
                        placeholder="Latitude"
                        keyboardType="numeric"
                        value={
                          formData.latitude !== undefined
                            ? String(formData.latitude)
                            : ""
                        }
                        editable={false}
                      />
                      <TextInput
                        style={[styles.input, styles.inputHalf]}
                        placeholder="Longitude"
                        keyboardType="numeric"
                        value={
                          formData.longitude !== undefined
                            ? String(formData.longitude)
                            : ""
                        }
                        editable={false}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.btn, styles.btnOutlined]}
                      onPress={handleGetLocation}
                      disabled={locationLoading}
                    >
                      <Text style={[styles.btnText, styles.btnOutlinedText]}>
                        {locationLoading ? "Getting Location..." : "Get Current Location"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Geo Radius (meters)"
                    keyboardType="numeric"
                    value={
                      formData.geo_radius !== undefined
                        ? String(formData.geo_radius)
                        : ""
                    }
                    onChangeText={(v) => {
                      const n = parseInt(v || "0", 10);
                      handleInputChange("geo_radius", Number.isNaN(n) ? undefined : n);
                    }}
                  />
                </View>

                {/* Right */}
                <View>
                  <Text style={styles.label}>Select Session</Text>
                  <View style={styles.pickerWrap}>
                    <Picker
                      enabled={!isLoadingSessions}
                      selectedValue={formData.session_id || ""}
                      onValueChange={(v) => handleInputChange("session_id", v)}
                    >
                      <Picker.Item label="Select Session" value="" />
                      {(sessions || []).map((s: any) => {
                        const start = s.start_time ? new Date(s.start_time) : null;
                        const end = s.end_time ? new Date(s.end_time) : null;
                        const secondary =
                          start && end
                            ? `${start.toLocaleString()} - ${end.toLocaleString()}`
                            : "";
                        return (
                          <Picker.Item
                            key={s.session_id}
                            label={`${s.session_type}${secondary ? ` — ${secondary}` : ""}`}
                            value={s.session_id}
                          />
                        );
                      })}
                    </Picker>
                  </View>

                  <View style={{ height: 12 }} />
                  <TouchableOpacity onPress={handlePickImage} style={[styles.btn, styles.btnGhost]}>
                    <Text style={[styles.btnText, styles.btnGhostText]}>Upload Event Image</Text>
                  </TouchableOpacity>
                  {pickedImage && (
                    <Image source={{ uri: pickedImage.uri }} style={styles.preview} />
                  )}
                </View>
              </View>
            </>
          )}

          {/* Divider */}
          <View style={styles.hr} />

          {/* Three columns: Geo fields (readonly), Sessions list, QR code */}
          <View style={styles.grid3}>
            {/* Geo Readonly */}
            <View>
              <Text style={styles.sectionTitle}>Location (Geo-fencing)</Text>
              <TextInput
                style={styles.input}
                editable={false}
                value={String(training.geo_radius ?? "")}
                placeholder="Geo Radius"
              />
              <TextInput
                style={styles.input}
                editable={false}
                value={String(training.latitude ?? "")}
                placeholder="Latitude"
              />
              <TextInput
                style={styles.input}
                editable={false}
                value={String(training.longitude ?? "")}
                placeholder="Longitude"
              />
            </View>

            {/* Sessions List */}
            <View>
              <Text style={styles.sectionTitle}>Sessions</Text>
              {training.sessions && training.sessions.length > 0 ? (
                <View style={{ gap: 10 }}>
                  {training.sessions.map((s) => (
                    <View key={s.session_id} style={styles.card}>
                      <Text style={styles.cardTitle}>{s.session_type}</Text>
                      {s.session ? (
                        <Text style={styles.cardText}>{s.session}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.subtle}>No sessions available for this training.</Text>
              )}
            </View>

            {/* QR Code */}
            <View>
              <Text style={styles.sectionTitle}>QR Code</Text>
              <View style={styles.qrWrap}>
                <QRCode
                  size={160}
                  value={`${process.env.EXPO_PUBLIC_FRONTEND_URL || baseUrl}/training/${trainingId}`}
                />
              </View>
            </View>
          </View>

          {/* Map */}
          <View style={styles.hr} />
          <Text style={styles.sectionTitle}>Training geo-radius geo-fencing</Text>
          <View style={{ marginTop: 12, borderRadius: 16, overflow: "hidden" }}>
            {mapRegion ? (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ height: 260, width: "100%" }}
                initialRegion={mapRegion}
              >
                <Marker coordinate={mapRegion} title={training.event_name} />
                {typeof training.geo_radius === "number" && (
                  <Circle
                    center={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude }}
                    radius={training.geo_radius}
                    strokeWidth={2}
                  />
                )}
              </MapView>
            ) : (
              <View style={[styles.centered, { height: 200 }]}>
                <Text style={styles.subtle}>No coordinates available.</Text>
              </View>
            )}
          </View>

          {/* Attendees header (placeholder to match web layout) */}
          <View style={styles.hr} />
          <Text style={styles.sectionTitle}>Attendees</Text>
          {/* You can render your attendees list here */}
        </ScrollView>
      )}
    </View>
  );
}

/* --------------------------------- Styles --------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  btnPrimary: { backgroundColor: "#ff6600" },
  btnOutlined: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  btnOutlinedText: { color: "#333" },
  btnGhost: { backgroundColor: "transparent" },
  btnGhostText: { color: "#1d4ed8", fontWeight: "600" },

  banner: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  bannerSuccess: { backgroundColor: "#e6f7ec" },
  bannerError: { backgroundColor: "#fde8e8" },
  bannerText: { color: "#111" },

  heroImage: {
    height: 300,
    width: "100%",
    borderRadius: 12,
    opacity: 0.9,
  },
  thumbnail: {
    height: 150,
    width: 150,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  uploadFloating: {
    position: "absolute",
    right: 8,
    top: 8,
  },
  iconBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
  },

  title: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: "800",
    color: "#ff6600",
    textTransform: "capitalize",
  },
  description: {
    marginTop: 4,
    marginBottom: 8,
    color: "#555",
    fontSize: 14,
  },

  hr: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },

  grid2: {
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  grid3: {
    gap: 16,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  label: { fontSize: 12, color: "#555", marginBottom: 4 },
  subTitle: { fontWeight: "600", marginBottom: 6, color: "#111" },
  sectionTitle: { fontWeight: "700", fontSize: 16, marginBottom: 8 },

  meta: { color: "#333", fontSize: 14 },
  metaStrong: { fontWeight: "700" },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipSuccess: { backgroundColor: "#e6f7ec" },
  chipError: { backgroundColor: "#fde8e8" },
  chipText: { fontSize: 12, color: "#111" },

  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111",
    marginBottom: 10,
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },

  pickerWrap: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f9f9f9",
  },

  row: { flexDirection: "row", gap: 10 },
  inputHalf: { flex: 1 },

  preview: {
    height: 120,
    width: "100%",
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: "#eee",
  },

  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 10,
  },
  cardTitle: { fontWeight: "700", marginBottom: 4 },
  cardText: { color: "#666", fontSize: 12 },

  qrWrap: { padding: 12, alignSelf: "flex-start", backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#eee" },
});
