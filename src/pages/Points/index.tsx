import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import { Feather as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/core";
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import { ScrollView } from "react-native-gesture-handler";
import * as Location from "expo-location";
import api from "../../services/api";

interface ItemProps {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
}

const Points = () => {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [points, setPoints] = useState<Point[]>([]);

  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0, 0,
  ]);

  const navigation = useNavigation();

  function handleNavigateToDetail(id: number) {
    navigation.navigate("Detail", { point_id: id });
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex((item) => item === id);

    if (alreadySelected >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(filteredItems);
    } else {
      // console.log("test", id);
      //logica pra selecionar mais de 1;
      setSelectedItems([...selectedItems, id]);
    }
  }

  useEffect(() => {
    api.get("items").then((response) => {
      console.log(response.data);
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    async function loadPosition() {
      //pedir permissão pro usuário retornar a posição dele
      const { status } = await Location.requestBackgroundPermissionsAsync();
      // const { status } = await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.High});

      if (status !== "granted") {
        Alert.alert(
          "Ops.. ",
          "Precisamos de sua permissão para obter a localização"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      // console.log(latitude, longitude);

      setInitialPosition([latitude, longitude]);
    }

    loadPosition();
  }, []);

  useEffect(() => {
    api
      .get("points", {
        params: {
          city: "João Pessoa",
          uf: "PB",
          items: [1, 2],
        },
      })
      .then((response) => {
        setPoints(response.data);
      });
  }, []);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" color="#34cb79" size={20} />
        </TouchableOpacity>

        <Text style={styles.title}> 😄 Bem vindo!</Text>
        <Text style={styles.description}>
          Econtre no mapa um ponto de coleta.
        </Text>

        <View style={styles.mapContainer}>
          {initialPosition[0] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: initialPosition[0],
                longitude: initialPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              {points.map((point) => (
                <Marker
                  key={String(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  style={styles.mapMarker}
                  onPress={() => handleNavigateToDetail(point.id)}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      source={{
                        uri: point.image,
                      }}
                      style={styles.mapMarkerImage}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
          }}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {},
              ]}
              activeOpacity={0.6}
              onPress={() => handleSelectItem(item.id)}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: "Ubuntu_700Bold",
    marginTop: 24,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 4,
    fontFamily: "Roboto_400Regular",
  },

  mapContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },

  map: {
    width: "100%",
    height: "100%",
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: "#34CB79",
    flexDirection: "column",
    borderRadius: 8,
    overflow: "hidden",
    alignItems: "center",
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: "cover",
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: "Roboto_400Regular",
    color: "#FFF",
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 32,
  },

  item: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#eee",
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "space-between",

    textAlign: "center",
  },

  selectedItem: {
    borderColor: "#34CB79",
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: "Roboto_400Regular",
    textAlign: "center",
    fontSize: 13,
  },
});

export default Points;
