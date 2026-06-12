import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>What is this for?</Text>
        <Text style={styles.text}>
          Every found item gets a unique reference code and a QR label. Staff print the
          label and attach it to the physical item in storage.
        </Text>
        <Text style={[styles.text, styles.gap]}>
          Scan that label with this app to instantly pull up the item — name, where it was
          found, storage shelf, status, and photo — without typing codes or searching the
          web dashboard.
        </Text>
        <Text style={[styles.text, styles.gap]}>
          The web app has the same lookup under Scan / Lookup. The mobile scanner is for
          staff on the floor: walk the storage room, scan a tag, confirm you grabbed the
          right item before release or when matching a claim.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
  },
  text: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  gap: {
    marginTop: 14,
  },
});
