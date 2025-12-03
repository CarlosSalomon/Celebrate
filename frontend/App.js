import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import { loginSuccess, logout } from './src/redux/slices/authSlice';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './src/config/firebase'; 
import { doc, getDoc } from 'firebase/firestore'; 
import CreateEventScreen from './src/screens/CreateEventScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import VendorListScreen from './src/screens/VendorListScreen';
import VendorsScreen from './src/screens/VendorsScreen';
import TasksScreen from './src/screens/TasksScreen';
import GuestListScreen from './src/screens/GuestListScreen';
import EditEventScreen from './src/screens/EditEventScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import EventBudgetScreen from './src/screens/EventBudgetScreen';
import LocalNotesScreen from './src/screens/LocalNotesScreen';

const Stack = createStackNavigator();

const AppNav = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("🔵 APP INICIADA: Esperando a Firebase...");
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("🟢 Usuario detectado (Auth):", user.email);

        try {

            const token = await user.getIdToken();
            const userDocRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userDocRef);

            let finalUserData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName, 
                photoURL: user.photoURL        
            };

            if (userSnap.exists()) {
                const firestoreData = userSnap.data();
                console.log("📂 Datos encontrados en Firestore:", firestoreData);
                               
                finalUserData.displayName = firestoreData.username || user.displayName;
                finalUserData.photoURL = firestoreData.photoURL || user.photoURL;
            }

             dispatch(loginSuccess({
                user: finalUserData,
                token: token
            }));

        } catch (e) {
            console.error("Error obteniendo datos del usuario:", e);

            dispatch(logout());
        }
      } else {
        console.log("⚪ Sin usuario activo");
        dispatch(logout());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={{ marginTop: 20, color: 'gray' }}>Cargando tu perfil...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
            <Stack.Screen name="EventBudget" component={EventBudgetScreen} />
            <Stack.Screen name="Vendors" component={VendorsScreen} />
            <Stack.Screen name="VendorList" component={VendorListScreen} />
            <Stack.Screen name="Tasks" component={TasksScreen} />
            <Stack.Screen name="GuestList" component={GuestListScreen} />
            <Stack.Screen name="EditEvent" component={EditEventScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="LocalNotes" component={LocalNotesScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNav />
      </SafeAreaProvider>
    </Provider>
  );
}