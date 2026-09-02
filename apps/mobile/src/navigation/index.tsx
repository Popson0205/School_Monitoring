import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../lib/auth';
import LoginScreen from '../screens/LoginScreen';
import InstitutionListScreen from '../screens/InstitutionListScreen';
import AddInstitutionScreen from '../screens/AddInstitutionScreen';
import AddFacilityScreen from '../screens/AddFacilityScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="InstitutionList" component={InstitutionListScreen} />
            <Stack.Screen
              name="AddInstitution"
              component={AddInstitutionScreen}
              options={{ headerShown: true, title: 'Add Institution' }}
            />
            <Stack.Screen
              name="AddFacility"
              component={AddFacilityScreen}
              options={{ headerShown: true, title: 'Log Facility' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
