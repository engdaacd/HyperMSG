# ERPNext Server Script example.
# Use this as a scheduled script or adapt it to a button/action script.
# It sends a payment reminder through NextMsg for overdue Sales Invoices.

import frappe
import requests

NEXTMSG_URL = "http://localhost:4000"
NEXTMSG_INSTANCE_ID = "replace-with-instance-id"
NEXTMSG_BRIDGE_SECRET = "replace-with-erpnext-bridge-secret"

invoices = frappe.get_all(
    "Sales Invoice",
    filters={"status": "Overdue"},
    fields=["name", "customer", "customer_name", "contact_mobile", "grand_total"],
    limit=20,
)

for invoice in invoices:
    if not invoice.contact_mobile:
        continue

    message = (
        f"Hello {invoice.customer_name}, your invoice {invoice.name} "
        f"for {invoice.grand_total} is overdue. Please contact accounts."
    )

    response = requests.post(
        f"{NEXTMSG_URL}/integrations/erpnext/send",
        headers={
            "Content-Type": "application/json",
            "X-NextMsg-ERPNext-Secret": NEXTMSG_BRIDGE_SECRET,
        },
        json={
            "instanceId": NEXTMSG_INSTANCE_ID,
            "to": invoice.contact_mobile,
            "body": message,
            "referenceDoctype": "Sales Invoice",
            "referenceName": invoice.name,
        },
        timeout=15,
    )
    response.raise_for_status()
