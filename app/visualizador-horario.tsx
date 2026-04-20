import React, { useMemo } from "react";
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  Dimensions
} from "react-native";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useClasses } from "@/hooks/use-classes";
import { useAuth } from "@/src/lib/auth-context";
import { Colors } from "@/constants/theme";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 to 21:00

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = 100;
const HOUR_HEIGHT = 60;

export default function ScheduleVisualizer() {
  const { user, profile } = useAuth();
  const { myEnrollments } = useEnrollments();
  const { professorClasses } = useClasses();

  const isProfessor = profile?.rol === "profesor";
  const data = isProfessor ? professorClasses : myEnrollments.map(e => e.classData).filter(Boolean);

  const renderClass = (item: any) => {
    return item.dias.map((day: string) => {
      const dayIndex = DAYS.indexOf(day);
      if (dayIndex === -1) return null;

      const [startHour, startMin] = item.horaInicio.split(":").map(Number);
      const [endHour, endMin] = item.horaFin.split(":").map(Number);
      
      const top = (startHour - 7) * HOUR_HEIGHT + (startMin / 60) * HOUR_HEIGHT;
      const height = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * HOUR_HEIGHT;

      return (
        <View 
          key={`${item.id}-${day}`}
          style={[
            styles.classBox, 
            { 
              top, 
              height, 
              left: dayIndex * COLUMN_WIDTH,
              backgroundColor: item.color || Colors.light.tint,
            }
          ]}
        >
          <Text style={styles.classTitle} numberOfLines={1}>{item.materia}</Text>
          <Text style={styles.classRoom} numberOfLines={1}>{item.salon}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScrollView horizontal>
          <View style={styles.gridContainer}>
            {/* Header Días */}
            <View style={styles.daysHeader}>
              <View style={styles.hourColumnSpace} />
              {DAYS.map(day => (
                <View key={day} style={styles.dayHeaderCell}>
                  <Text style={styles.dayText}>{day.substring(0, 3)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.gridBody}>
              {/* Horas */}
              <View style={styles.hourColumn}>
                {HOURS.map(hour => (
                  <View key={hour} style={styles.hourCell}>
                    <Text style={styles.hourText}>{hour}:00</Text>
                  </View>
                ))}
              </View>

              {/* Rejilla y Clases */}
              <View style={styles.classesContainer}>
                {/* Líneas de fondo */}
                {HOURS.map(hour => (
                  <View key={`line-${hour}`} style={styles.gridLine} />
                ))}
                {DAYS.map((_, i) => (
                    <View key={`col-${i}`} style={[styles.gridCol, { left: i * COLUMN_WIDTH }]} />
                ))}
                
                {/* Clases */}
                {data.map(renderClass)}
              </View>
            </View>
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  gridContainer: {
    flexDirection: "column",
  },
  daysHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  hourColumnSpace: {
    width: 60,
  },
  dayHeaderCell: {
    width: COLUMN_WIDTH,
    paddingVertical: 12,
    alignItems: "center",
  },
  dayText: {
    fontWeight: "700",
    color: "#374151",
    fontSize: 13,
  },
  gridBody: {
    flexDirection: "row",
  },
  hourColumn: {
    width: 60,
    backgroundColor: "#F9FAFB",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  hourCell: {
    height: HOUR_HEIGHT,
    paddingRight: 8,
    alignItems: "flex-end",
    paddingTop: 4,
  },
  hourText: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  classesContainer: {
    width: COLUMN_WIDTH * DAYS.length,
    height: HOUR_HEIGHT * HOURS.length,
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#F3F4F6",
    width: "100%",
    top: 0,
  },
  gridCol: {
      position: "absolute",
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: "#F3F4F6",
  },
  classBox: {
    position: "absolute",
    width: COLUMN_WIDTH - 4,
    marginHorizontal: 2,
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    elevation: 3,
  },
  classTitle: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 11,
  },
  classRoom: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    marginTop: 2,
  },
});
