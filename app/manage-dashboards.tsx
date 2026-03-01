import { ThemedText } from '@/components/themed-text';
import { ArthaColors } from '@/constants/colors';
import { useDashboardContext } from '@/context/DashboardContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManageDashboardsScreen() {
  const { dashboards, addDashboard, deleteDashboard, updateDashboard } = useDashboardContext();
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDashboard(newName.trim());
      setNewName('');
      Alert.alert('Sukses', 'Buku baru berhasil ditambahkan');
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan buku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (id: string, currentName: string) => {
    setEditId(id);
    setEditName(currentName);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) return;

    setIsSubmitting(true);
    try {
      await updateDashboard(editId, editName.trim());
      setEditModalVisible(false);
      // Removed Toast/SnackBar library as it's not present, using Alert as requested fallback style:
      Alert.alert('Sukses', 'Nama buku berhasil diperbarui');
    } catch (error) {
      Alert.alert('Error', 'Gagal memperbarui buku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (dashboards.length <= 1) {
      Alert.alert('Tidak dapat dihapus', 'Anda harus memiliki minimal satu buku keuangan.');
      return;
    }

    Alert.alert(
      'Hapus Buku',
      `Yakin ingin menghapus buku "${name}"? Semua transaksi di dalamnya tidak akan terhapus otomatis dari storage fisik tapi tidak akan bisa diakses. Lanjut?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            await deleteDashboard(id);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>Batal</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Kelola Buku</ThemedText>
          <View style={styles.backButtonPlaceholder} />
        </View>
      </View>

      <View style={styles.addSection}>
        <ThemedText style={styles.sectionTitle}>Tambah Buku Baru</ThemedText>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nama Buku (misal: Usaha, Pribadi)"
            value={newName}
            onChangeText={setNewName}
            maxLength={30}
          />
          <TouchableOpacity 
            style={[styles.addButton, !newName.trim() && styles.disabledButton]}
            onPress={handleAdd}
            disabled={!newName.trim() || isSubmitting}
          >
            <ThemedText style={styles.addButtonText}>Tambah</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listSection}>
        <ThemedText style={styles.sectionTitle}>Daftar Buku</ThemedText>
        <FlatList
          data={dashboards}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                {item.isDefault && <ThemedText style={styles.itemBadge}>Bawaan</ThemedText>}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  onPress={() => openEditModal(item.id, item.name)}
                  style={styles.editButton}
                >
                  <ThemedText style={styles.editText}>Edit</ThemedText>
                </TouchableOpacity>
                {dashboards.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.id, item.name)}
                    style={styles.deleteButton}
                  >
                    <ThemedText style={styles.deleteText}>Hapus</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Edit Nama Buku</ThemedText>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              maxLength={20}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <ThemedText style={styles.modalCancelText}>Batal</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton, !editName.trim() && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={!editName.trim() || isSubmitting}
              >
                <ThemedText style={styles.modalSaveText}>Simpan</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ArthaColors.gray50,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: ArthaColors.white,
    borderBottomWidth: 1,
    borderBottomColor: ArthaColors.gray200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ArthaColors.primaryDark,
  },
  backButton: {
    paddingVertical: 8,
  },
  backButtonText: {
    color: ArthaColors.primaryAccent,
    fontSize: 16,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  addSection: {
    padding: 16,
    backgroundColor: ArthaColors.white,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ArthaColors.gray600,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: ArthaColors.gray50,
    borderWidth: 1,
    borderColor: ArthaColors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: ArthaColors.primaryAccent,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  addButtonText: {
    color: ArthaColors.white,
    fontWeight: 'bold',
  },
  listSection: {
    flex: 1,
    backgroundColor: ArthaColors.white,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: ArthaColors.gray100,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    color: ArthaColors.gray800,
  },
  itemBadge: {
    fontSize: 10,
    backgroundColor: ArthaColors.gray200,
    color: ArthaColors.gray600,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.error + '20', // transparent error color
    borderRadius: 4,
  },
  deleteText: {
    color: ArthaColors.error,
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: ArthaColors.primaryAccent + '20',
    borderRadius: 4,
  },
  editText: {
    color: ArthaColors.primaryDark,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: ArthaColors.white,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: ArthaColors.primaryDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: ArthaColors.gray50,
    borderWidth: 1,
    borderColor: ArthaColors.gray200,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: ArthaColors.gray200,
  },
  modalSaveButton: {
    backgroundColor: ArthaColors.primaryAccent,
  },
  modalCancelText: {
    color: ArthaColors.gray700,
    fontWeight: 'bold',
  },
  modalSaveText: {
    color: ArthaColors.white,
    fontWeight: 'bold',
  }
});
