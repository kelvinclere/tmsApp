import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Modal, RadioButton, Chip, ActivityIndicator } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../lib/axiosInstance';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  citizenship: string;
  sex: string;
  sne: boolean;
  id_number: string;
  tsc_number: string;
  school_name: string;
  school_county: string;
  school_sub_county: string;
  organization_name: string;
  designation: string;
  teaching: string[];
}

interface ProfileUpdateModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialValues: ProfileFormData;
  subjectsList: string[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

const PersonalInfoSchema = Yup.object().shape({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  phone: Yup.string().matches(/^[0-9]+$/, 'Invalid phone number').required('Phone number is required'),
  citizenship: Yup.string().required('Citizenship is required'),
  sex: Yup.string().required('Gender is required'),
  id_number: Yup.string().when('citizenship', {
    is: 'Kenyan',
    then: Yup.string().required('ID number is required for Kenyans'),
    otherwise: Yup.string().required('Passport number is required for non-Kenyans'),
  }),
  sne: Yup.boolean().required(),
});

const ProfessionalInfoSchema = Yup.object().shape({
  organization_name: Yup.string().required('Organization name is required'),
  designation: Yup.string().required('Designation is required'),
  tsc_number: Yup.string().when('citizenship', {
    is: 'Kenyan',
    then: Yup.string().required('TSC number is required for Kenyans'),
    otherwise: Yup.string(),
  }),
  school_name: Yup.string().when('citizenship', {
    is: 'Kenyan',
    then: Yup.string().required('School name is required'),
    otherwise: Yup.string(),
  }),
  school_county: Yup.string().when('citizenship', {
    is: 'Kenyan',
    then: Yup.string().required('School county is required'),
    otherwise: Yup.string(),
  }),
  school_sub_county: Yup.string().when('citizenship', {
    is: 'Kenyan',
    then: Yup.string().required('School sub-county is required'),
    otherwise: Yup.string(),
  }),
  teaching: Yup.array().min(1, 'Please select at least one subject').required('Subjects are required'),
});

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({ 
  visible, 
  onDismiss, 
  initialValues, 
  subjectsList, 
  onSuccess, 
  onError 
}) => {
  const [step, setStep] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleNext = (values: ProfileFormData) => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (values: ProfileFormData) => {
    try {
      setIsUpdating(true);
      const response = await axiosInstance.post('/v1/cemastea/update/profile', values);
      
      if (response.data.success || response.data.user) {
        onSuccess();
      } else {
        onError(response.data.error || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      onError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const initialFormikValues = {
    first_name: initialValues.first_name || '',
    last_name: initialValues.last_name || '',
    phone: initialValues.phone || '',
    citizenship: initialValues.citizenship || 'Kenyan',
    sex: initialValues.sex || '',
    sne: initialValues.sne || false,
    id_number: initialValues.id_number || '',
    tsc_number: initialValues.tsc_number || '',
    school_name: initialValues.school_name || '',
    school_county: initialValues.school_county || '',
    school_sub_county: initialValues.school_sub_county || '',
    organization_name: initialValues.organization_name || '',
    designation: initialValues.designation || '',
    teaching: initialValues.teaching || [],
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
      <ScrollView>
        <Text style={styles.modalTitle}>
          {step === 1 ? 'Update Personal Information' : 'Update Professional Information'}
        </Text>
        
        <Formik
          initialValues={initialFormikValues}
          validationSchema={step === 1 ? PersonalInfoSchema : ProfessionalInfoSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View>
              {step === 1 ? (
                <View>
                  <TextInput
                    label="First Name"
                    value={values.first_name}
                    onChangeText={handleChange('first_name')}
                    onBlur={handleBlur('first_name')}
                    error={touched.first_name && !!errors.first_name}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.first_name && errors.first_name && <Text style={styles.errorText}>{errors.first_name}</Text>}

                  <TextInput
                    label="Last Name"
                    value={values.last_name}
                    onChangeText={handleChange('last_name')}
                    onBlur={handleBlur('last_name')}
                    error={touched.last_name && !!errors.last_name}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.last_name && errors.last_name && <Text style={styles.errorText}>{errors.last_name}</Text>}

                  <TextInput
                    label="Phone Number"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={touched.phone && !!errors.phone}
                    style={styles.input}
                    mode="outlined"
                    keyboardType="phone-pad"
                  />
                  {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                  <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>Citizenship</Text>
                    <RadioButton.Group
                      onValueChange={(value) => {
                        setFieldValue('citizenship', value);
                      }}
                      value={values.citizenship}
                    >
                      <View style={styles.radioOption}>
                        <RadioButton value="Kenyan" />
                        <Text>Kenyan</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="Non-Kenyan" />
                        <Text>Non-Kenyan</Text>
                      </View>
                    </RadioButton.Group>
                  </View>
                  {touched.citizenship && errors.citizenship && <Text style={styles.errorText}>{errors.citizenship}</Text>}

                  <View style={styles.radioGroup}>
                    <Text style={styles.radioLabel}>Gender</Text>
                    <RadioButton.Group
                      onValueChange={(value) => setFieldValue('sex', value)}
                      value={values.sex}
                    >
                      <View style={styles.radioOption}>
                        <RadioButton value="Male" />
                        <Text>Male</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="Female" />
                        <Text>Female</Text>
                      </View>
                    </RadioButton.Group>
                  </View>
                  {touched.sex && errors.sex && <Text style={styles.errorText}>{errors.sex}</Text>}

                  <View style={styles.checkboxOption}>
                    <RadioButton
                      value="sne"
                      status={values.sne ? 'checked' : 'unchecked'}
                      onPress={() => setFieldValue('sne', !values.sne)}
                    />
                    <Text>Special Needs Educator</Text>
                  </View>

                  <TextInput
                    label={values.citizenship === 'Kenyan' ? 'ID Number' : 'Passport Number'}
                    value={values.id_number}
                    onChangeText={handleChange('id_number')}
                    onBlur={handleBlur('id_number')}
                    error={touched.id_number && !!errors.id_number}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.id_number && errors.id_number && <Text style={styles.errorText}>{errors.id_number}</Text>}
                  
                  <View style={styles.modalButtons}>
                    <Button mode="outlined" onPress={onDismiss} style={styles.modalButton}>
                      Cancel
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => PersonalInfoSchema.isValid(values).then(valid => valid ? handleNext(values) : handleSubmit())}
                      style={styles.modalButton}
                    >
                      Next
                    </Button>
                  </View>
                </View>
              ) : (
                <View>
                  <TextInput
                    label="Organization Name"
                    value={values.organization_name}
                    onChangeText={handleChange('organization_name')}
                    onBlur={handleBlur('organization_name')}
                    error={touched.organization_name && !!errors.organization_name}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.organization_name && errors.organization_name && <Text style={styles.errorText}>{errors.organization_name}</Text>}
                  
                  <TextInput
                    label="Designation"
                    value={values.designation}
                    onChangeText={handleChange('designation')}
                    onBlur={handleBlur('designation')}
                    error={touched.designation && !!errors.designation}
                    style={styles.input}
                    mode="outlined"
                  />
                  {touched.designation && errors.designation && <Text style={styles.errorText}>{errors.designation}</Text>}

                  {values.citizenship === 'Kenyan' && (
                    <>
                      <TextInput
                        label="TSC Number"
                        value={values.tsc_number}
                        onChangeText={handleChange('tsc_number')}
                        onBlur={handleBlur('tsc_number')}
                        error={touched.tsc_number && !!errors.tsc_number}
                        style={styles.input}
                        mode="outlined"
                      />
                      {touched.tsc_number && errors.tsc_number && <Text style={styles.errorText}>{errors.tsc_number}</Text>}

                      <TextInput
                        label="School Name"
                        value={values.school_name}
                        onChangeText={handleChange('school_name')}
                        onBlur={handleBlur('school_name')}
                        error={touched.school_name && !!errors.school_name}
                        style={styles.input}
                        mode="outlined"
                      />
                      {touched.school_name && errors.school_name && <Text style={styles.errorText}>{errors.school_name}</Text>}

                      <TextInput
                        label="School County"
                        value={values.school_county}
                        onChangeText={handleChange('school_county')}
                        onBlur={handleBlur('school_county')}
                        error={touched.school_county && !!errors.school_county}
                        style={styles.input}
                        mode="outlined"
                      />
                      {touched.school_county && errors.school_county && <Text style={styles.errorText}>{errors.school_county}</Text>}

                      <TextInput
                        label="School Sub-County"
                        value={values.school_sub_county}
                        onChangeText={handleChange('school_sub_county')}
                        onBlur={handleBlur('school_sub_county')}
                        error={touched.school_sub_county && !!errors.school_sub_county}
                        style={styles.input}
                        mode="outlined"
                      />
                      {touched.school_sub_county && errors.school_sub_county && <Text style={styles.errorText}>{errors.school_sub_county}</Text>}
                    </>
                  )}

                  <View style={styles.subjectsSection}>
                    <Text style={styles.sectionLabel}>Subjects Teaching</Text>
                    <View style={styles.subjectsGrid}>
                      {subjectsList.map((subject) => (
                        <Chip
                          key={subject}
                          selected={values.teaching.includes(subject)}
                          onPress={() => {
                            if (values.teaching.includes(subject)) {
                              setFieldValue('teaching', values.teaching.filter((s) => s !== subject));
                            } else {
                              setFieldValue('teaching', [...values.teaching, subject]);
                            }
                          }}
                          style={styles.subjectOption}
                        >
                          {subject}
                        </Chip>
                      ))}
                    </View>
                    {touched.teaching && errors.teaching && <Text style={styles.errorText}>{errors.teaching}</Text>}
                  </View>

                  <View style={styles.modalButtons}>
                    <Button mode="outlined" onPress={handleBack} style={styles.modalButton}>
                      Back
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={isUpdating}
                      disabled={isUpdating}
                      style={styles.modalButton}
                    >
                      Save
                    </Button>
                  </View>
                </View>
              )}
            </View>
          )}
        </Formik>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
    backgroundColor: 'white',
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 12,
    fontSize: 12,
  },
  radioGroup: {
    marginBottom: 16,
  },
  radioLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subjectsSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectOption: {
    marginRight: 8,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ProfileUpdateModal;