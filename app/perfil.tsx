import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { db } from "@/src/api/firebase";
import { UserProfile } from "@/src/domain/user";
import { useAuth } from "@/src/lib/auth-context";

export default function PerfilScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ uid?: string }>();
  const targetUid = params.uid || user?.uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState("");
  const [matricula, setMatricula] = useState("");
  const [carrera, setCarrera] = useState("");
  const [semestre, setSemestre] = useState("");
  const [areaInteres, setAreaInteres] = useState("");
  const [planEstudio, setPlanEstudio] = useState("");
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [departamento, setDepartamento] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetUid) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", targetUid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);

          setNombre(data.nombre ?? "");

          if (data.rol === "estudiante") {
            setMatricula(data.matricula ?? "");
            setCarrera(data.carrera ?? "");
            setSemestre(data.semestre ? String(data.semestre) : "");
            setAreaInteres(data.areaInteres ?? "");
            setPlanEstudio(data.planEstudio ?? "");
          } else if (data.rol === "profesor") {
            setNumeroEmpleado(data.numeroEmpleado ?? "");
            setDepartamento(data.departamento ?? "");
          }
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No fue posible cargar el perfil.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUid]);

  const handleSave = async () => {
    if (!targetUid) {
      Alert.alert("Error", "No se encontró el usuario.");
      return;
    }

    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "El nombre es obligatorio.");
      return;
    }

    try {
      setSaving(true);

      const ref = doc(db, "users", targetUid);
      const updateData: any = {
        nombre: nombre.trim(),
      };

      if (profile?.rol === "estudiante") {
        updateData.matricula = matricula.trim();
        updateData.carrera = carrera.trim();
        updateData.semestre = semestre.trim() ? Number(semestre.trim()) : null;
        updateData.areaInteres = areaInteres.trim();
        updateData.planEstudio = planEstudio;
      } else if (profile?.rol === "profesor") {
        updateData.numeroEmpleado = numeroEmpleado.trim();
        updateData.departamento = departamento.trim();
      }

      await updateDoc(ref, updateData);

      Alert.alert("Éxito", "Perfil actualizado correctamente.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No fue posible actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Perfil</Text>
          <Text style={styles.subtitle}>Consulta y edita la información del usuario</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre completo"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile?.email ?? ""}
            editable={false}
            placeholder="Correo"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Rol</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile?.rol ?? ""}
            editable={false}
            placeholder="Rol"
            placeholderTextColor="#9CA3AF"
          />

          {profile?.rol === "estudiante" && (
            <>
              <Text style={styles.label}>Matrícula</Text>
              <TextInput
                style={styles.input}
                value={matricula}
                onChangeText={setMatricula}
                placeholder="Matrícula"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Carrera</Text>
              <TextInput
                style={styles.input}
                value={carrera}
                onChangeText={setCarrera}
                placeholder="Carrera"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Semestre</Text>
              <TextInput
                style={styles.input}
                value={semestre}
                onChangeText={setSemestre}
                placeholder="Semestre"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Área de interés</Text>
              <TextInput
                style={styles.input}
                value={areaInteres}
                onChangeText={areaInteres => setAreaInteres(areaInteres)}
                placeholder="Ej: Inteligencia Artificial"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Plan de Estudios</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={planEstudio}
                  onValueChange={(val) => setPlanEstudio(val as string)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccionar Plan..." value="" />
                  <Picker.Item label="Anterior a 2016" value="Anterior 2016" />
                  <Picker.Item label="2016 - 2023" value="2016-2023" />
                  <Picker.Item label="2024" value="2024" />
                </Picker>
              </View>
            </>
          )}

          {profile?.rol === "profesor" && (
            <>
              <Text style={styles.label}>Número de Empleado</Text>
              <TextInput
                style={styles.input}
                value={numeroEmpleado}
                onChangeText={setNumeroEmpleado}
                placeholder="ID de profesor"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Departamento</Text>
              <TextInput
                style={styles.input}
                value={departamento}
                onChangeText={setDepartamento}
                placeholder="Ej: Ingeniería en Sistemas"
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            <Text style={styles.saveButtonText}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D9DDE7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    color: "#111827",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D9DDE7",
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
    marginBottom: 4,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  disabledInput: {
    backgroundColor: "#F3F4F6",
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  saveButtonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  backButtonText: {
    color: "#111827",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
});