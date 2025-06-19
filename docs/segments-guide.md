# HL7 v2.x Common Segments Overview

Below is a list of the most commonly used HL7 segments, their meaning, and typical usage in clinical and laboratory messaging.

| Segment | Name                    | Description                                                      |
|---------|-------------------------|------------------------------------------------------------------|
| **MSH** | Message Header          | Defines the message metadata, sender, receiver, timestamp, etc. |
| **PID** | Patient Identification  | Contains patient demographic data (ID, name, DOB, sex, etc.)    |
| **PV1** | Patient Visit           | Visit information (location, attending physician, admission)    |
| **ORC** | Common Order            | General order control data (order status, date/time, placer ID) |
| **OBR** | Observation Request     | Contains request details for a diagnostic service or lab test   |
| **OBX** | Observation Result      | Holds actual results (numeric, textual, coded) from a test      |
| **NTE** | Notes and Comments      | Free-text comments related to previous segments (OBX, etc.)     |
| **AL1** | Allergy Information     | Patient allergy data                                            |
| **DG1** | Diagnosis               | Clinical diagnosis information                                  |
| **IN1** | Insurance               | Insurance policy and coverage details                           |
| **GT1** | Guarantor               | Information about the person responsible for the bill           |
| **NK1** | Next of Kin             | Contact information for next of kin or emergency contact        |
| **SCH** | Schedule Activity       | Appointment scheduling data (used in SIU messages)              |
| **RXA** | Pharmacy/Treatment Admin | Drug administration details (used in immunization, meds)        |
| **FT1** | Financial Transaction   | Billing or financial transaction records                        |
| **Zxx** | Custom Segment          | Institution-defined segment (non-standard/custom)               |

> 💡 HL7 segments vary by message type (e.g., ADT, ORU, ORM, SIU). Always refer to the relevant HL7 chapter/specification.
