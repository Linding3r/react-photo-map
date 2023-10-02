import React, { useState, useEffect, useRef } from 'react';
import { View, Modal, TextInput, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';


export default function App() {
  const [markers, setMarkers] = useState([]);
  const [region, setRegion] = useState({
    latitude: 55,
    longitude: 12,
    latitudeDelta: 20,
    longitudeDelta: 20,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [longPressLocation, setLongPressLocation] = useState(null); // Store long press location
  const mapView = useRef(null);
  const locationSubscription = useRef(null);

  useEffect(() => {
    async function startListening() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('No permission to location');
        return;
      }
      locationSubscription.current = await Location.watchPositionAsync(
        {
          distanceInterval: 100,
          accuracy: Location.Accuracy.High,
        },
        (location) => {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 20,
            longitudeDelta: 20,
          };
          setRegion(newRegion);
          if (mapView.current) {
            mapView.current.animateToRegion(newRegion);
          }
        }
      );
    }
    startListening();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  function addMarker() {
    if (customTitle && longPressLocation) {
      const { latitude, longitude } = longPressLocation; // Extract latitude and longitude
      const newMarker = {
        coordinate: { latitude, longitude },
        key: Date.now().toString(),
        title: customTitle, // Use the custom title here
      };
      setMarkers([...markers, newMarker]);
      setModalVisible(false); // Close the modal after adding the marker
      setCustomTitle(''); // Reset the custom title input
    } else {
      alert('Please enter a title for the marker.');
    }
  }

  function onMarkerPress(title) {
    console.log(title);
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} onLongPress={(event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setLongPressLocation({ latitude, longitude }); // Store the latitude and longitude
        setCustomTitle(''); // Reset custom title input when long press
        setModalVisible(true);
      }} ref={mapView}>
        {markers.map((marker) => (
          <Marker
            coordinate={marker.coordinate}
            key={marker.key}
            title={marker.title}
            onPress={() => onMarkerPress(marker.title)}
          />
        ))}
      </MapView>
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Enter Marker Title"
            value={customTitle}
            onChangeText={(text) => setCustomTitle(text)}
          />
          <Button title="Add" onPress={addMarker} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
  },
};
