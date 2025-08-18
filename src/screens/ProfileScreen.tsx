import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../../lib/axiosInstance';
import { TextInput, Button, Modal, RadioButton, Chip, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { UserProfile, ApiResponse } from '../../types/UserProfile';
import ProfileUpdateModal from '../components/ProfileUpdateModal';


const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const { userInfo, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<ApiResponse<UserProfile>>('/v1/cemastea/user/profile');
      const userData = response.data.user || response.data.data?.user;
      
      if (!userData) {
        throw new Error('User data not found in response');
      }

      setProfile({
        ...userData,
        phone: userData.phone || '',
        citizenship: userData.citizenship || 'Kenyan',
        sex: userData.sex || '',
        id_number: userData.id_number || '',
        tsc_number: userData.tsc_number || '',
        school_name: userData.school_name || '',
        school_county: userData.school_county || '',
        school_sub_county: userData.school_sub_county || '',
        organization_name: userData.organization_name || '',
        designation: userData.designation || '',
        teaching: userData.teaching || [],
        profile_completed: userData.profile_completed || false
      });

      if (!userData.profile_completed) {
        setModalVisible(true);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile');
      if (err.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again', [{ text: 'OK', onPress: logout }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axiosInstance.get('/v1/cemastea/subjects'); // Assume this endpoint exists
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      setSubjects(['Mathematics', 'English', 'Kiswahili', 'Science', 'History', 'Geography', 'CRE', 'IRE', 'Business']); // Fallback
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchSubjects();
    }
  }, [isAuthenticated]);

  const handleUpdateClick = () => {
    setModalVisible(true);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onDismissSnackbar = () => {
    setSnackbarVisible(false);
  };

  const getGenderIcon = () => {
    if (profile?.sex === 'Male') return <Icon name="gender-male" size={20} color="#3b82f6" />;
    if (profile?.sex === 'Female') return <Icon name="gender-female" size={20} color="#ec4899" />;
    return <Icon name="gender-male-female" size={20} color="#6b7280" />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff7900" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error && !profile) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={40} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchProfile} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={80} color="#ff7900" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{profile?.first_name} {profile?.last_name}</Text>
            <View style={styles.emailContainer}>
              <Icon name="email" size={16} color="#6b7280" />
              <Text style={styles.email}>{profile?.email}</Text>
              {profile?.profile_completed && (
                <Chip icon="check-circle" style={styles.verifiedChip}>Verified</Chip>
              )}
            </View>
            <View style={styles.tagsContainer}>
              <Chip icon="earth" style={styles.tagChip}>
                {profile?.citizenship || 'Not specified'}
              </Chip>
              <Chip icon={() => getGenderIcon()} style={styles.tagChip}>
                {profile?.sex || 'Not specified'}
              </Chip>
              <Chip 
                icon={profile?.sne ? "alert-circle" : "account"} 
                style={[styles.tagChip, { backgroundColor: profile?.sne ? '#fef3c7' : '#e5e7eb' }]}
              >
                {profile?.sne ? 'Special Needs' : 'No Special Needs'}
              </Chip>
            </View>
          </View>
          <Button
            mode="contained"
            style={styles.editButton}
            onPress={handleUpdateClick}
            icon="pencil"
          >
            Update Profile
          </Button>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="account" size={24} color="#ff7900" />
              <Text style={styles.cardTitle}>Personal Information</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>First Name</Text>
              <Text style={styles.detailValue}>{profile?.first_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Name</Text>
              <Text style={styles.detailValue}>{profile?.last_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{profile?.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>ID/Passport</Text>
              <Text style={styles.detailValue}>{profile?.id_number || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="briefcase" size={24} color="#ff7900" />
              <Text style={styles.cardTitle}>Professional Information</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Organization</Text>
              <Text style={styles.detailValue}>{profile?.organization_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Designation</Text>
              <Text style={styles.detailValue}>{profile?.designation || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TSC Number</Text>
              <Text style={styles.detailValue}>{profile?.tsc_number || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>School</Text>
              <Text style={styles.detailValue}>{profile?.school_name || 'Not provided'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {profile?.school_sub_county && profile?.school_county ? 
                  `${profile.school_sub_county}, ${profile.school_county}` : 
                  'Not provided'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Subjects</Text>
              <View style={styles.subjectsContainer}>
                {profile?.teaching?.length ? 
                  profile.teaching.map((subject, index) => (
                    <Chip key={index} style={styles.subjectChip}>{subject}</Chip>
                  )) : 
                  <Text style={styles.detailValue}>Not provided</Text>}
              </View>
            </View>
          </View>
        </View>

        <Button mode="contained" style={styles.logoutButton} onPress={logout} icon="logout">
          Logout
        </Button>
      </ScrollView>

      {profile && (
        <ProfileUpdateModal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          initialValues={profile}
          subjectsList={subjects}
          onSuccess={() => {
            setModalVisible(false);
            fetchProfile();
            showSnackbar('Profile updated successfully!');
          }}
          onError={(message) => {
            showSnackbar(message);
          }}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackbar}
        action={{
          label: 'Dismiss',
          onPress: onDismissSnackbar,
        }}
        style={{ backgroundColor: '#4caf50' }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#ff7900',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    marginVertical: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#ff7900',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  email: {
    marginLeft: 4,
    color: '#6b7280',
  },
  verifiedChip: {
    marginLeft: 8,
    backgroundColor: '#dcfce7',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e5e7eb',
  },
  editButton: {
    backgroundColor: '#ff7900',
  },
  detailsGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 16,
    marginTop: 4,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  subjectChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e0f2fe',
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: '#ef4444',
  },
});

export default ProfileScreen;