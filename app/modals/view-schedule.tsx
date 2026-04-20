import { useEffect, useState } from "react";
import { 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/src/api/firebase";
import { ClassModel } from "@/src/domain/class";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/src/lib/auth-context";

export default function ViewClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [classData, setClassData] = useState<ClassModel | null>(null);
  const [loading, setLoading] = useState(true);

  const isProfessor = profile?.rol === "profesor";

  useEffect(() => {
    if (!id) return;

    const fetchClass = async () => {
      try {
        const docRef = doc(db, "classes", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClassData({ id: docSnap.id, ...docSnap.data() } as ClassModel);
        }
      } catch (error) {
        console.error("Error fetching class:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.centered}>
        <Text>No se encontró la materia oficial.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={[styles.header, { borderLeftColor: classData.color || Colors.light.tint }]}>
        <Text style={styles.title}>{classData.materia}</Text>
        <Text style={styles.time}>{classData.horaInicio} - {classData.horaFin}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={24} color={Colors.light.tint} />
          <View>
            <Text style={styles.infoLabel}>Salón / Aula</Text>
            <Text style={styles.infoValue}>{classData.salon}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={24} color="#10B981" />
          <View>
            <Text style={styles.infoLabel}>Días de clase</Text>
            <Text style={styles.infoValue}>{classData.dias.join(", ")}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={24} color="#6B7280" />
          <View>
            <Text style={styles.infoLabel}>Profesor</Text>
            <Text style={styles.infoValue}>{classData.profesorNombre || "No especificado"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={24} color="#F59E0B" />
          <View>
            <Text style={styles.infoLabel}>Cupo Máximo</Text>
            <Text style={styles.infoValue}>{classData.cupo} alumnos</Text>
          </View>
        </View>
      </View>

      {isProfessor && (
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => {
            router.back();
            router.push({ pathname: "/modals/add-schedule", params: { id: classData.id } });
          }}
        >
          <Ionicons name="pencil" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Editar Clase Oficial</Text>
        </TouchableOpacity>
      )}

      {!isProfessor && (
        <TouchableOpacity 
          style={[styles.editButton, { backgroundColor: '#F3F4F6' }]} 
          onPress={() => router.push({ pathname: "/modals/view-grades", params: { classId: classData.id } })}
        >
          <Ionicons name="stats-chart" size={20} color={Colors.light.tint} />
          <Text style={[styles.editButtonText, { color: Colors.light.tint }]}>Ver Mis Calificaciones</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    marginBottom: 32,
    borderLeftWidth: 6,
    paddingLeft: 16,
    paddingVertical: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.tint,
  },
  section: {
    gap: 32,
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 20,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 17,
    color: "#1F2937",
    fontWeight: "700",
  },
  editButton: {
    backgroundColor: Colors.light.tint,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 40,
    gap: 8,
    elevation: 2,
  },
  editButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
});
