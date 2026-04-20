import { useEffect, useState } from "react";
import { 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  ActivityIndicator
} from "react-native";
import { 
    doc, 
    getDoc, 
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { router, useLocalSearchParams } from "expo-router";

import { db } from "@/src/api/firebase";
import { useAuth } from "@/src/lib/auth-context";
import { useClasses } from "@/hooks/use-classes";
import { Colors } from "@/constants/theme";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function AddClassScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { createClass, loading: classesLoading } = useClasses();

  const [materia, setMateria] = useState("");
  const [salon, setSalon] = useState("");
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [cupo, setCupo] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchClass = async () => {
      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "classes", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMateria(data.materia || "");
          setSalon(data.salon || "");
          setDiasSeleccionados(data.dias || []);
          setHoraInicio(data.horaInicio || "");
          setHoraFin(data.horaFin || "");
          setCupo(String(data.cupo || 30));
        }
      } catch (error) {
        console.error("Error fetching class:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id]);

  const toggleDay = (day: string) => {
    if (diasSeleccionados.includes(day)) {
      setDiasSeleccionados(diasSeleccionados.filter(d => d !== day));
    } else {
      setDiasSeleccionados([...diasSeleccionados, day]);
    }
  };

  const handleSave = async () => {
    if (!materia || !salon || diasSeleccionados.length === 0 || !horaInicio || !horaFin) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const classData = {
        materia: materia.trim(),
        salon: salon.trim(),
        dias: diasSeleccionados,
        horaInicio: horaInicio.trim(),
        horaFin: horaFin.trim(),
        cupo: parseInt(cupo),
        color: "#003B5C", // BUAP Navy
      };

      if (id) {
        await updateDoc(doc(db, "classes", id), {
            ...classData,
            updatedAt: serverTimestamp()
        });
      } else {
        await createClass(classData);
      }

      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar la materia.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>{id ? "Editar Materia Oficial" : "Nueva Materia Oficial"}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre de la Materia *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej: Análisis de Algoritmos"
          value={materia}
          onChangeText={setMateria}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Salón / Aula *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Ej: Aula 101 - Edificio ICOS"
          value={salon}
          onChangeText={setSalon}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Días de clase *</Text>
        <View style={styles.daysContainer}>
          {DAYS.map(day => (
            <TouchableOpacity 
              key={day}
              style={[
                styles.dayButton, 
                diasSeleccionados.includes(day) && styles.dayButtonActive
              ]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[
                styles.dayButtonText,
                diasSeleccionados.includes(day) && styles.dayButtonTextActive
              ]}>
                {day.substring(0, 2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Hora Inicio *</Text>
          <TextInput 
            style={styles.input}
            placeholder="08:00"
            value={horaInicio}
            onChangeText={setHoraInicio}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Hora Fin *</Text>
          <TextInput 
            style={styles.input}
            placeholder="10:00"
            value={horaFin}
            onChangeText={setHoraFin}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Cupo máximo de alumnos</Text>
        <TextInput 
          style={styles.input}
          placeholder="30"
          keyboardType="numeric"
          value={cupo}
          onChangeText={setCupo}
        />
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, loading && styles.disabled]} 
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Guardando..." : (id ? "Actualizar Clase" : "Publicar Clase")}
        </Text>
      </TouchableOpacity>
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
    gap: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    minWidth: 50,
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: "#003B5C",
    borderColor: "#003B5C",
  },
  dayButtonText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: "600",
  },
  dayButtonTextActive: {
    color: "#FFF",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#003B5C",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 10,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
