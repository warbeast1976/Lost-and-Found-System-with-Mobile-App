import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from 'expo-camera';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiUrl } from '@/constants/api';

/** QR labels encode a URL; manual lookup uses the raw reference code. */
function parseReferenceCode(scanned: string): string {
  const value = scanned.trim();
  if (!value) return '';

  const urlMatch = value.match(/\/(?:api\/)?scan\/([^/?#]+)/i);
  if (urlMatch?.[1]) {
    return decodeURIComponent(urlMatch[1]);
  }

  return value;
}

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [scannedType, setScannedType] = useState('');
  const [scanApiLoading, setScanApiLoading] = useState(false);
  const [foundItem, setFoundItem] = useState<{
    id: number;
    item_name: string;
    description: string | null;
    color: string | null;
    found_location: string | null;
    date_found: string | null;
    image_url: string | null;
    qr_code_url: string | null;
    reference_code: string;
    storage_location: string | null;
    status: string | null;
    created_at: string | null;
    staff?: unknown;
    category?: unknown;
  } | null>(null);
  const [scanApiError, setScanApiError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  const parsed = useMemo(() => {
    const value = scannedData.trim();
    return {
      value,
      isUrl: /^https?:\/\/.+/i.test(value),
    };
  }, [scannedData]);

  const handleBarcodeScanned = ({ data, type }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    setScannedData(data);
    setScannedType(type);

    const referenceCode = parseReferenceCode(data);
    if (referenceCode) {
      void fetchScanResult(referenceCode);
    }
  };

  const handleCopy = async () => {
    if (!scannedData) return;
    await Clipboard.setStringAsync(scannedData);
    Alert.alert('Copied', 'Scanned text copied to clipboard.');
  };

  const handleOpen = async () => {
    // Prefer opening the backend's image if we have it.
    const targetUrl = foundItem?.image_url ?? (parsed.isUrl ? parsed.value : null);
    if (!targetUrl) {
      Alert.alert('Cannot open', 'No URL to open for this scan.');
      return;
    }

    const supported = await Linking.canOpenURL(targetUrl);
    if (!supported) {
      Alert.alert('Cannot open', 'This URL cannot be opened.');
      return;
    }

    await Linking.openURL(targetUrl);
  };

  const resetScan = () => {
    setScanned(false);
    setScannedData('');
    setScannedType('');
    setScanApiLoading(false);
    setFoundItem(null);
    setScanApiError(null);
  };

  const fetchScanResult = async (referenceCode: string) => {
    setScanApiLoading(true);
    setScanApiError(null);
    setFoundItem(null);

    try {
      const url = apiUrl(`/api/scan/${encodeURIComponent(referenceCode)}`);
      const res = await fetch(url, { method: 'GET' });

      const raw = await res.text();
      let payload:
        | { status?: boolean; message?: string; data?: typeof foundItem | null; }
        | null = null;
      try {
        payload = raw ? JSON.parse(raw) : null;
      } catch {
        payload = { status: false, message: raw || 'Invalid response', data: null };
      }

      if (!res.ok) {
        setScanApiError(payload?.message || `HTTP ${res.status}`);
        return;
      }

      if (!payload?.data) {
        setScanApiError(payload?.message || 'No data returned.');
        return;
      }

      setFoundItem(payload.data as typeof foundItem);
    } catch (err) {
      const lastErrMsg = err instanceof Error ? err.message : String(err);
      setScanApiError(lastErrMsg || 'Network request failed while looking up the scanned item.');
    } finally {
      setScanApiLoading(false);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.helperText}>Loading camera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Camera access required</Text>
          <Text style={styles.permissionText}>
            Allow camera access to scan QR codes and barcodes.
          </Text>

          <Pressable style={styles.primaryButton} onPress={requestPermission}>
            <Text style={styles.primaryButtonText}>Allow Camera</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={torchEnabled}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e', 'pdf417'],
        }}
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>QR Scanner</Text>
            <Text style={styles.subtitle}>Place the code inside the frame</Text>
          </View>

          <View style={styles.headerButtons}>
            <Pressable
              style={[styles.smallButton, torchEnabled && styles.smallButtonActive]}
              onPress={() => setTorchEnabled((v) => !v)}
            >
              <Text style={styles.smallButtonText}>
                {torchEnabled ? 'Torch On' : 'Torch'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.smallButton}
              onPress={() => setFacing((v) => (v === 'back' ? 'front' : 'back'))}
            >
              <Text style={styles.smallButtonText}>Flip</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.frameWrapper}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.bottomCard}>
          {!scanned ? (
            <>
              <Text style={styles.cardLabel}>Ready</Text>
              <Text style={styles.cardText}>
                Scan a QR code or supported barcode.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.cardLabel}>Scan Result</Text>
              <Text style={styles.cardType}>Type: {scannedType || 'Unknown'}</Text>
              <Text style={styles.cardValue}>{scannedData}</Text>

              {scanApiLoading ? (
                <Text style={styles.cardText}>Looking up item...</Text>
              ) : scanApiError ? (
                <Text style={styles.cardText}>{scanApiError}</Text>
              ) : foundItem ? (
                <>
                  <Text style={[styles.cardLabel, { marginTop: 10 }]}>Item Details</Text>
                  <Text style={styles.cardType}>Name: {foundItem.item_name}</Text>
                  {foundItem.found_location ? (
                    <Text style={styles.cardType}>Location: {foundItem.found_location}</Text>
                  ) : null}
                  {foundItem.status ? (
                    <Text style={styles.cardType}>Status: {foundItem.status}</Text>
                  ) : null}
                  {foundItem.description ? (
                    <Text style={styles.cardText}>{foundItem.description}</Text>
                  ) : null}

                  {foundItem.image_url ? (
                    <Image source={{ uri: foundItem.image_url }} style={styles.foundImage} />
                  ) : null}
                </>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable style={styles.secondaryButton} onPress={handleCopy}>
                  <Text style={styles.secondaryButtonText}>Copy</Text>
                </Pressable>

                <Pressable style={styles.secondaryButton} onPress={handleOpen}>
                  <Text style={styles.secondaryButtonText}>Open</Text>
                </Pressable>

                <Pressable style={styles.primaryButtonSmall} onPress={resetScan}>
                  <Text style={styles.primaryButtonText}>Scan Again</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  center: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  permissionTitle: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  permissionText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    color: '#e2e8f0',
    fontSize: 15,
    marginTop: 6,
  },
  headerButtons: {
    gap: 10,
  },
  smallButton: {
    minWidth: 92,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
  },
  smallButtonActive: {
    backgroundColor: '#2563eb',
  },
  smallButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  frameWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: 260,
    height: 260,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  corner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderColor: '#3b82f6',
  },
  topLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 14,
    right: 14,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  bottomCard: {
    backgroundColor: 'rgba(15,23,42,0.88)',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cardLabel: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  cardType: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 8,
  },
  cardText: {
    color: '#e2e8f0',
    fontSize: 16,
    lineHeight: 22,
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 14,
  },
  foundImage: {
    width: '100%',
    height: 140,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonSmall: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});