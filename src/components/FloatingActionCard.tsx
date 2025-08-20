// components/FloatingActionCard.tsx
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface FloatingActionCardProps {
  title: string;
  actions: { label: string; onPress: () => void }[];
}

const FloatingActionCard: React.FC<FloatingActionCardProps> = ({ title, actions }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setVisible(true)}
      >
        <Icon name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Modal for Card */}
      <Modal
        transparent
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Card style={styles.card}>
            <Card.Title title={title} />
            <Card.Content>
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  mode="contained"
                  style={{ marginVertical: 6 }}
                  onPress={() => {
                    setVisible(false);
                    action.onPress();
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setVisible(false)}>Close</Button>
            </Card.Actions>
          </Card>
        </View>
      </Modal>
    </View>
  );
};

export default FloatingActionCard;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ff7900",
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  card: {
    margin: 20,
    padding: 10,
    borderRadius: 12,
  },
});
