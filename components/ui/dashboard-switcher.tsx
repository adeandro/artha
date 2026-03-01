import { ThemedText } from '@/components/themed-text';
import { ArthaColors } from '@/constants/colors';
import { useDashboardContext } from '@/context/DashboardContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

export const DashboardSwitcher = () => {
  const { dashboards, activeDashboardId, setActiveDashboardId } = useDashboardContext();
  const [modalVisible, setModalVisible] = useState(false);

  const activeDashboard = dashboards.find(d => d.id === activeDashboardId) || dashboards[0];

  const handleSelect = (id: string) => {
    setActiveDashboardId(id);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.textContainer}>
          <ThemedText style={styles.label}>Buku Aktif</ThemedText>
          <View style={styles.row}>
            <ThemedText type="title" style={styles.title}>
              {activeDashboard?.name || "Buku Utama"}
            </ThemedText>
            <ThemedText style={styles.icon}>▼</ThemedText>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle" style={styles.modalTitle}>Pilih Buku Keuangan</ThemedText>
            </View>
            
            <FlatList
              data={dashboards}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dashboardItem,
                    item.id === activeDashboardId && styles.activeItem
                  ]}
                  onPress={() => handleSelect(item.id)}
                >
                  <ThemedText style={[
                    styles.dashboardName,
                    item.id === activeDashboardId && styles.activeText
                  ]}>
                    {item.name}
                  </ThemedText>
                  {item.id === activeDashboardId && (
                    <ThemedText style={styles.checkmark}>✓</ThemedText>
                  )}
                </TouchableOpacity>
              )}
            />
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.manageButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/manage-dashboards' as any);
                }}
              >
                <ThemedText style={styles.manageButtonText}>Kelola Buku...</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  textContainer: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    color: ArthaColors.gray500,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: ArthaColors.primaryDark,
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
    color: ArthaColors.primaryAccent,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: ArthaColors.white,
    borderRadius: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ArthaColors.gray200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ArthaColors.primaryDark,
    textAlign: 'center',
  },
  dashboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ArthaColors.gray100,
  },
  activeItem: {
    backgroundColor: ArthaColors.gray50,
  },
  dashboardName: {
    fontSize: 16,
    color: ArthaColors.gray800,
  },
  activeText: {
    color: ArthaColors.primaryAccent,
    fontWeight: 'bold',
  },
  checkmark: {
    color: ArthaColors.primaryAccent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: ArthaColors.gray200,
  },
  manageButton: {
    backgroundColor: ArthaColors.primaryDark,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: ArthaColors.white,
    fontWeight: 'bold',
    fontSize: 14,
  }
});
