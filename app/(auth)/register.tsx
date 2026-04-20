import { Picker } from "@react-native-picker/picker";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import {
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

import { auth, db } from "@/src/api/firebase";
import { UserRole } from "@/src/domain/user";

export default function RegisterScreen() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<UserRole>("estudiante");
  const [matricula, setMatricula] = useState("");
  const [numeroEmpleado, setNumeroEmpleado] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Campos requeridos", "Completa nombre, correo y contraseña.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Contraseña inválida", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const cleanEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const uid = userCredential.user.uid;

      const profileData: any = {
        uid,
        nombre: nombre.trim(),
        email: cleanEmail,
        rol,
        activo: true,
        createdAt: serverTimestamp(),
      };

      if (rol === "estudiante") {
        profileData.matricula = matricula.trim();
        profileData.carrera = "";
        profileData.semestre = null;
        profileData.areaInteres = "";
      } else if (rol === "profesor") {
        profileData.numeroEmpleado = numeroEmpleado.trim();
        profileData.departamento = "";
        profileData.materiasAsignadas = [];
      }

      await setDoc(doc(db, "users", uid), profileData);

      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error al registrarte", error?.message || "No fue posible crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Registro de usuario</Text>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Pérez"
            value={nombre}
            onChangeText={setNombre}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Soy un...</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rol}
              onValueChange={(itemValue) => setRol(itemValue as UserRole)}
              style={styles.picker}
            >
              <Picker.Item label="Estudiante" value="estudiante" />
              <Picker.Item label="Profesor" value="profesor" />
            </Picker>
          </View>

          {rol === "estudiante" ? (
            <>
              <Text style={styles.label}>Matrícula</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu matrícula"
                value={matricula}
                onChangeText={setMatricula}
                placeholderTextColor="#9CA3AF"
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>Número de empleado</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu ID de profesor"
                value={numeroEmpleado}
                onChangeText={setNumeroEmpleado}
                placeholderTextColor="#9CA3AF"
              />
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Creando cuenta..." : "Registrarme"}</Text>
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Ya tengo cuenta, iniciar sesión</Text>
            </TouchableOpacity>
          </Link>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    gap: 8,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
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
  },
  picker: {
    height: Platform.OS === "ios" ? 150 : 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#16A34A",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  linkButton: {
    paddingVertical: 10,
    marginTop: 10,
  },
  linkText: {
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
  },
});