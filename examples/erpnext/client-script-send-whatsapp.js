// ERPNext Client Script example for Customer.
// Add this in ERPNext: Customize Form -> Client Script -> DocType: Customer.
// Replace the constants with your NextMsg values.

const NEXTMSG_URL = "http://localhost:4000";
const NEXTMSG_INSTANCE_ID = "replace-with-instance-id";
const NEXTMSG_BRIDGE_SECRET = "replace-with-erpnext-bridge-secret";

frappe.ui.form.on("Customer", {
  refresh(frm) {
    frm.add_custom_button("Send WhatsApp", async () => {
      const phone = frm.doc.mobile_no || frm.doc.phone;
      if (!phone) {
        frappe.msgprint("Customer has no phone number.");
        return;
      }

      const message = await frappe.prompt({
        label: "Message",
        fieldname: "message",
        fieldtype: "Small Text",
        reqd: 1,
        default: `Hello ${frm.doc.customer_name || frm.doc.name}, this is a message from ERPNext.`
      });

      const response = await fetch(`${NEXTMSG_URL}/integrations/erpnext/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NextMsg-ERPNext-Secret": NEXTMSG_BRIDGE_SECRET
        },
        body: JSON.stringify({
          instanceId: NEXTMSG_INSTANCE_ID,
          to: phone,
          body: message.message,
          referenceDoctype: frm.doctype,
          referenceName: frm.doc.name
        })
      });

      const result = await response.json();
      if (!response.ok) {
        frappe.msgprint(result.error || "Failed to send WhatsApp message.");
        return;
      }

      frappe.show_alert({ message: `WhatsApp ${result.status}`, indicator: "green" });
      frm.reload_doc();
    });
  }
});
