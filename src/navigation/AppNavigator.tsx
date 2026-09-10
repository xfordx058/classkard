import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView, BlurTargetView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UnsignedRecordsScreen from '../screens/UnsignedRecordsScreen';
import ClassesListScreen from '../screens/ClassesListScreen';
import SectionDetailScreen from '../screens/SectionDetailScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import AddRecordScreen from '../screens/AddRecordScreen';
import TimelineScreen from '../screens/TimelineScreen';
import EnrollmentRequestsScreen from '../screens/EnrollmentRequestsScreen';
import AddStudentScreen from '../screens/AddStudentScreen';
import BulkScoreEntryScreen from '../screens/BulkScoreEntryScreen';
import SignatureScreen from '../screens/SignatureScreen';
import CreateSectionScreen from '../screens/CreateSectionScreen';
import QuickEntryScreen from '../screens/QuickEntryScreen';
import SearchScreen from '../screens/SearchScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ManageAcademicYearsScreen from '../screens/ManageAcademicYearsScreen';
import ManageSubjectsScreen from '../screens/ManageSubjectsScreen';
import StudentTimelineScreen from '../screens/StudentTimelineScreen';
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import JoinClassScreen from '../screens/JoinClassScreen';
import EditSignatureScreen from '../screens/EditSignatureScreen';
import AppHeader from '../components/AppHeader';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const glassStyles = StyleSheet.create({
  fill: { flex: 1 },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

function GlassTabBackdrop({ target }: { target: React.RefObject<View | null> }) {
  return (
    <BlurView
      blurTarget={target}
      blurMethod="dimezisBlurViewSdk31Plus"
      intensity={88}
      tint="light"
      style={glassStyles.backdrop}
    />
  );
}

const glassTabBarStyle = {
  backgroundColor: 'rgba(255,255,255,0.35)',
  borderTopColor: 'rgba(255,255,255,0.6)',
  borderTopWidth: StyleSheet.hairlineWidth + 0.5,
  elevation: 24,
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: -8 },
  shadowOpacity: 0.08,
  shadowRadius: 20,
} as const;

const HEADER_TITLES: Record<string, string> = {
  UnsignedRecords: 'Unsigned Records',
  QuickEntry: 'Quick Entry',
  Search: 'Search',
  Reports: 'Reports',
  SectionDetail: 'Section Details',
  StudentProfile: 'Student Profile',
  CardDetail: 'Card Details',
  AddRecord: 'Add Record',
  Timeline: 'Timeline',
  EnrollmentRequests: 'Enrollment Requests',
  AddStudent: 'Add Student',
  BulkScoreEntry: 'Bulk Score Entry',
  Signature: 'Signature',
  CreateSection: 'Create Section',
  ManageAcademicYears: 'Academic Years',
  ManageSubjects: 'Subjects',
  EditSignature: 'My Signature',
  JoinClass: 'Join a Class',
  StudentTimeline: 'Timeline',
};

const withBack = (C: React.ComponentType<any>) => (props: any) => (
  <View style={glassStyles.fill}>
    <AppHeader title={HEADER_TITLES[props?.route?.name] ?? ''} showBack />
    <C {...props} />
  </View>
);

const withSafeArea = (C: React.ComponentType<any>) => (props: any) => (
  <SafeAreaView edges={['top']} style={glassStyles.fill}>
    <C {...props} />
  </SafeAreaView>
);

const withHeader = (title: string) => (C: React.ComponentType<any>) => (props: any) => (
  <View style={glassStyles.fill}>
    <AppHeader title={title} showBack={false} />
    <C {...props} />
  </View>
);

const LoginW = withSafeArea(LoginScreen);
const RegisterW = withSafeArea(RegisterScreen);
const DashboardW = withHeader('Dashboard')(DashboardScreen);
const ClassesListW = withHeader('My Classes')(ClassesListScreen);
const QuickEntrySafeW = withHeader('Quick Entry')(QuickEntryScreen);
const SearchSafeW = withHeader('Search')(SearchScreen);
const SettingsW = withHeader('Settings')(SettingsScreen);
const StudentDashboardW = withHeader('Home')(StudentDashboardScreen);
const StudentProfileSafeW = withHeader('My Cards')(StudentProfileScreen);
const StudentTimelineSafeW = withHeader('My Timeline')(StudentTimelineScreen);

const UnsignedRecordsW = withBack(UnsignedRecordsScreen);
const QuickEntryW = withBack(QuickEntryScreen);
const SearchW = withBack(SearchScreen);
const ReportsW = withBack(ReportsScreen);
const SectionDetailW = withBack(SectionDetailScreen);
const StudentProfileW = withBack(StudentProfileScreen);
const CardDetailW = withBack(CardDetailScreen);
const AddRecordW = withBack(AddRecordScreen);
const TimelineW = withBack(TimelineScreen);
const EnrollmentRequestsW = withBack(EnrollmentRequestsScreen);
const AddStudentW = withBack(AddStudentScreen);
const BulkScoreEntryW = withBack(BulkScoreEntryScreen);
const SignatureW = withBack(SignatureScreen);
const CreateSectionW = withBack(CreateSectionScreen);
const ManageAcademicYearsW = withBack(ManageAcademicYearsScreen);
const ManageSubjectsW = withBack(ManageSubjectsScreen);
const EditSignatureW = withBack(EditSignatureScreen);
const JoinClassW = withBack(JoinClassScreen);
const StudentTimelineW = withBack(StudentTimelineScreen);

const screenOptions = {
  headerShown: false,
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginW} />
      <Stack.Screen name="Register" component={RegisterW} />
    </Stack.Navigator>
  );
}

function DashboardTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Dashboard" component={DashboardW} options={{ title: 'Dashboard' }} />
    </Stack.Navigator>
  );
}

function ClassesTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ClassesList" component={ClassesListW} options={{ title: 'Classes' }} />
    </Stack.Navigator>
  );
}

function QuickEntryTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="QuickEntry" component={QuickEntrySafeW} options={{ title: 'Quick Entry' }} />
    </Stack.Navigator>
  );
}

function SearchTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Search" component={SearchSafeW} options={{ title: 'Search' }} />
    </Stack.Navigator>
  );
}

function TeacherSettingsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Settings" component={SettingsW} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

function TeacherTabs() {
  const blurTarget = useRef<View | null>(null);
  const tabBarBackground = useCallback(
    () => <GlassTabBackdrop target={blurTarget} />,
    []
  );

  return (
    <BlurTargetView ref={blurTarget} style={glassStyles.fill}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarBackground,
          tabBarStyle: glassTabBarStyle,
          tabBarLabelStyle: { fontWeight: '600' as const },
        }}
      >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardTab}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="ClassesTab"
        component={ClassesTab}
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="QuickEntryTab"
        component={QuickEntryTab}
        options={{
          title: 'Quick Entry',
          tabBarIcon: ({ color, size }) => <Ionicons name="create" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchTab}
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TeacherSettingsTab"
        component={TeacherSettingsTab}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
    </BlurTargetView>
  );
}

function TeacherRoot() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={TeacherTabs} options={{ headerShown: false }} />
      <Stack.Screen name="UnsignedRecords" component={UnsignedRecordsW} options={{ title: 'Unsigned Records' }} />
      <Stack.Screen name="QuickEntry" component={QuickEntryW} options={{ title: 'Quick Entry' }} />
      <Stack.Screen name="Search" component={SearchW} options={{ title: 'Search' }} />
      <Stack.Screen name="Reports" component={ReportsW} options={{ title: 'Reports' }} />
      <Stack.Screen name="SectionDetail" component={SectionDetailW} options={{ title: 'Section Details' }} />
      <Stack.Screen name="StudentProfile" component={StudentProfileW} options={{ title: 'Student Profile' }} />
      <Stack.Screen name="CardDetail" component={CardDetailW} options={{ title: 'Card Details' }} />
      <Stack.Screen name="AddRecord" component={AddRecordW} options={{ title: 'Add Record' }} />
      <Stack.Screen name="Timeline" component={TimelineW} options={{ title: 'Timeline' }} />
      <Stack.Screen name="EnrollmentRequests" component={EnrollmentRequestsW} options={{ title: 'Enrollment Requests' }} />
      <Stack.Screen name="AddStudent" component={AddStudentW} options={{ title: 'Add Student' }} />
      <Stack.Screen name="BulkScoreEntry" component={BulkScoreEntryW} options={{ title: 'Bulk Score Entry' }} />
      <Stack.Screen name="Signature" component={SignatureW} options={{ title: 'Signature' }} />
      <Stack.Screen name="CreateSection" component={CreateSectionW} options={{ title: 'Create Section' }} />
      <Stack.Screen name="ManageAcademicYears" component={ManageAcademicYearsW} options={{ title: 'Academic Years' }} />
      <Stack.Screen name="ManageSubjects" component={ManageSubjectsW} options={{ title: 'Subjects' }} />
      <Stack.Screen name="EditSignature" component={EditSignatureW} options={{ title: 'My Signature' }} />
    </Stack.Navigator>
  );
}

function HomeTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboardW} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MyCardsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentProfile" component={StudentProfileSafeW} options={{ title: 'My Cards' }} />
    </Stack.Navigator>
  );
}

function TimelineTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="StudentTimeline" component={StudentTimelineSafeW} options={{ title: 'Timeline' }} />
    </Stack.Navigator>
  );
}

function StudentSettingsTab() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Settings" component={SettingsW} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

function StudentTabs() {
  const blurTarget = useRef<View | null>(null);
  const tabBarBackground = useCallback(
    () => <GlassTabBackdrop target={blurTarget} />,
    []
  );

  return (
    <BlurTargetView ref={blurTarget} style={glassStyles.fill}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarBackground,
          tabBarStyle: glassTabBarStyle,
          tabBarLabelStyle: { fontWeight: '600' as const },
        }}
      >
      <Tab.Screen
        name="HomeTab"
        component={HomeTab}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="MyCardsTab"
        component={MyCardsTab}
        options={{
          title: 'My Cards',
          tabBarIcon: ({ color, size }) => <Ionicons name="albums" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TimelineTab"
        component={TimelineTab}
        options={{
          title: 'Timeline',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="StudentSettingsTab"
        component={StudentSettingsTab}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
    </BlurTargetView>
  );
}

function StudentRoot() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MainTabs" component={StudentTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JoinClass" component={JoinClassW} options={{ title: 'Join a Class' }} />
      <Stack.Screen name="StudentProfile" component={StudentProfileW} options={{ title: 'My Cards' }} />
      <Stack.Screen name="CardDetail" component={CardDetailW} options={{ title: 'Card Details' }} />
      <Stack.Screen name="StudentTimeline" component={StudentTimelineW} options={{ title: 'Timeline' }} />
      <Stack.Screen name="EditSignature" component={EditSignatureW} options={{ title: 'My Signature' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <AuthStack />;
  }

  if (currentUser.role === 'teacher') {
    return <TeacherRoot />;
  }

  if (currentUser.role === 'student') {
    return <StudentRoot />;
  }

  return <AuthStack />;
}