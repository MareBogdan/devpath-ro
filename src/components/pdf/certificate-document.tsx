import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const BLUE = "#2563eb";
const DARK = "#1e293b";
const MUTED = "#64748b";
const LIGHT = "#f1f5f9";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 0,
    fontFamily: "Helvetica",
  },
  outerBorder: {
    margin: 24,
    border: "4px solid #2563eb",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  innerBorder: {
    margin: 6,
    border: "1px solid #bfdbfe",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },
  topRight: {
    alignItems: "flex-end",
  },
  platforma: {
    fontSize: 9,
    color: MUTED,
    textAlign: "right",
  },
  divider: {
    height: 2,
    backgroundColor: BLUE,
    marginBottom: 30,
    marginTop: 6,
    borderRadius: 1,
  },
  certHeading: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 2,
  },
  certSubHeading: {
    fontSize: 11,
    color: MUTED,
    textAlign: "center",
    marginBottom: 28,
    fontStyle: "italic",
  },
  acordaLui: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    marginBottom: 6,
  },
  studentName: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    textAlign: "center",
    marginBottom: 6,
  },
  pentruAbsolvire: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    marginBottom: 6,
  },
  courseTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BLUE,
    textAlign: "center",
    marginBottom: 28,
  },
  decorLine: {
    height: 1,
    backgroundColor: LIGHT,
    marginBottom: 20,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  leftBottom: {
    flexDirection: "column",
    gap: 4,
  },
  dateLabel: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  codeLabel: {
    fontSize: 9,
    color: MUTED,
    marginTop: 10,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 7,
    color: MUTED,
    fontFamily: "Helvetica",
  },
  signature: {
    alignItems: "center",
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: DARK,
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 9,
    color: MUTED,
    textAlign: "center",
  },
  qrWrapper: {
    alignItems: "center",
  },
  qrImage: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  qrLabel: {
    fontSize: 7,
    color: MUTED,
    textAlign: "center",
  },
  medalStrip: {
    backgroundColor: BLUE,
    paddingVertical: 6,
    paddingHorizontal: 40,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  medalText: {
    fontSize: 9,
    color: "#ffffff",
    textAlign: "center",
  },
});

interface CertificateDocumentProps {
  studentName: string;
  courseTitle: string;
  completedDate: string; // "15 ianuarie 2026"
  certificateCode: string;
  qrCodeDataUrl: string;
}

export function CertificateDocument({
  studentName,
  courseTitle,
  completedDate,
  certificateCode,
  qrCodeDataUrl,
}: CertificateDocumentProps) {
  return (
    <Document
      title={`Certificat de Absolvire — ${studentName}`}
      author="DevPath RO"
      subject={courseTitle}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.logoText}>DevPath RO</Text>
                <Text style={styles.logoSub}>Platforma română de învățare AI</Text>
              </View>
              <View style={styles.topRight}>
                <Text style={styles.platforma}>Certificat oficial</Text>
                <Text style={styles.platforma}>devpath.ro</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Certificate title */}
            <Text style={styles.certHeading}>CERTIFICAT DE ABSOLVIRE</Text>
            <Text style={styles.certSubHeading}>
              Aceasta atestă că studentul menționat a absolvit cu succes cursul
            </Text>

            {/* Student name */}
            <Text style={styles.acordaLui}>Se acordă lui</Text>
            <Text style={styles.studentName}>{studentName}</Text>
            <Text style={styles.pentruAbsolvire}>pentru absolvirea cursului</Text>
            <Text style={styles.courseTitle}>{courseTitle}</Text>

            {/* Decorative line */}
            <View style={styles.decorLine} />

            {/* Bottom row */}
            <View style={styles.bottomRow}>
              {/* Left: date + code */}
              <View style={styles.leftBottom}>
                <Text style={styles.dateLabel}>Data absolvire</Text>
                <Text style={styles.dateValue}>{completedDate}</Text>
                <Text style={styles.codeLabel}>ID certificat</Text>
                <Text style={styles.codeValue}>{certificateCode}</Text>
              </View>

              {/* Center: signature */}
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>DevPath RO</Text>
                <Text style={styles.signatureText}>Platformă de educație</Text>
              </View>

              {/* Right: QR code */}
              <View style={styles.qrWrapper}>
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
                <Text style={styles.qrLabel}>Verifică autenticitatea</Text>
                <Text style={styles.qrLabel}>devpath.ro/verify/</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom strip */}
        <View style={styles.medalStrip}>
          <Text style={styles.medalText}>
            🎓 Acest certificat confirmă absolvirea completă a cursului pe platforma DevPath RO.
            Verificabil la devpath.ro/verify/{certificateCode.slice(0, 8)}...
          </Text>
        </View>
      </Page>
    </Document>
  );
}
