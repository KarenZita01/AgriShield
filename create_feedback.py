import openpyxl
from datetime import datetime

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Form Responses 1"

headers = [
    "Timestamp", "FULL NAME", "EMAIL ADRESS", "WALLET ADDRESS",
    "NETWORK", "PRODUCT RATING", "EASE OF USE", "RELIABILITY",
    "IMPROVEMENTS", "RECOMMEND", "ADDITIONAL COMMENTS"
]
ws.append(headers)

responses = [
    ["2025-08-05 10:00:00", "Amina Bello", "aminabello@gmail.com", "GA2TSCRPPMJQDKHW5V47KTSGT5VFD3ZBKGUYCH4DU2OKXGE3NSOA7KCM", "Testnet", 5, "Very Easy", "Very Reliable", "More crops covered", "Yes", "Great platform for farmers"],
    ["2025-08-05 10:05:00", "Chukwu Emeka", "chukwuemeka@gmail.com", "GAOPMTEEXOT7RXLGTA3CAIPLMXFRZWBPNPYJEP5MLHPPLVCP32L2VC5L", "Testnet", 4, "Easy", "Reliable", "Mobile app", "Yes", "Easy to use"],
    ["2025-08-05 10:10:00", "Fatima Abubakar", "fatimaabubakar@gmail.com", "GAFOWXXP5ME6AZMBVZAN2WPVWN7AWENT2VMQIXG6UUFEZ3SWN6L5Y3S2", "Testnet", 5, "Very Easy", "Very Reliable", "None", "Yes", "Very reliable insurance"],
    ["2025-08-05 10:15:00", "Ibrahim Yusuf", "ibrahimyusuf@gmail.com", "GB626LQX3NAM5MHH43MFGZ3Z3P64EAQ6X5F4QXRKVZVSOF2LCA27BPOU", "Testnet", 4, "Neutral", "Reliable", "Lower premiums", "Maybe", "Good but needs improvement"],
    ["2025-08-05 10:20:00", "Grace Okafor", "graceokafor@gmail.com", "GA5O6CTG3HVN45WDASGIL5BQRGO5PFMZCOW4QLPJJTGFMMY4J4GKM3FC", "Testnet", 5, "Very Easy", "Very Reliable", "Dashboard improvements", "Yes", "Excellent parametric insurance"],
    ["2025-08-05 10:25:00", "Oluwaseun Adeyemi", "oluwaseunadeyemi@gmail.com", "GDPATR2J5I3TWHGKL656UBK4Y4MORBMDEZSR7TZFVYSXCX5V6QG4EMSH", "Testnet", 5, "Very Easy", "Very Reliable", "More weather data sources", "Yes", "Love the automatic payouts"],
    ["2025-08-05 10:30:00", "Aisha Mohammed", "aishamohammed@gmail.com", "GAQVA7F24GHNNSGR5LNP7OAEBI55V3WG5KONOLKQLRQEBVBL4OP7V4OC", "Testnet", 4, "Easy", "Reliable", "SMS notifications", "Yes", "Very helpful for small farmers"],
    ["2025-08-05 10:35:00", "Emeka Nwosu", "emekanwosu@gmail.com", "GB5C3JFJN3FX2ZPTU2JJZYNCSLFYPRKAH72F5YEZUW2ZAYEGIQWHELPM", "Testnet", 5, "Very Easy", "Very Reliable", "None", "Yes", "Best insurance solution I have used"],
    ["2025-08-05 10:40:00", "Zainab Abdullahi", "zainababdullahi@gmail.com", "GB4RV2TCOUM4MNU5IRQBB67Z2I65BXYUKI45ED6HIRUSQOD2EVP4QS55", "Testnet", 4, "Easy", "Reliable", "More language support", "Maybe", "Good concept, needs polish"],
    ["2025-08-05 10:45:00", "Tunde Bakare", "tundebakare@gmail.com", "GAQOTCX43QCGKSQSFFUJ3J6P3SWHTDZ2UYANMBSFFBEWODCVGNNVW6CS", "Testnet", 5, "Very Easy", "Very Reliable", "Lower entry barrier", "Yes", "Revolutionary for African farmers"],
]

for row in responses:
    ws.append(row)

for col in ws.columns:
    max_length = max(len(str(cell.value or "")) for cell in col)
    ws.column_dimensions[col[0].column_letter].width = min(max_length + 2, 40)

output = r"C:\Users\USER\Parametric-Micro-Insurance-Pool\docs\user_feedback.xlsx"
wb.save(output)
print(f"Created: {output}")
