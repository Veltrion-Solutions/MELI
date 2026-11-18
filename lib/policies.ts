/** Shop policies shared by the Shipping & returns page and the chat assistant, so they never disagree. */

export const SAME_DAY_CUTOFF = "Orders placed before 2 pm on a working day are packed and sent the same day.";

export const RETURN_STEPS = [
  { title: "Start a return", text: "Contact us within 30 days of delivery with your order number and the items you'd like to return." },
  { title: "Pack it up", text: "Send items unworn and unwashed, with tags attached, in their original packaging." },
  { title: "We collect or you drop off", text: "We'll arrange a courier pickup, or you can drop the parcel at our Colombo studio." },
  { title: "Get your refund", text: "Once we've checked your return, we refund to your original payment method within 5–7 working days." },
];

export const FAQ = [
  { q: "Can I exchange for a different size?", a: "Yes. Ask for an exchange when you start your return and we'll send the new size as soon as your return is on its way, subject to stock. Size exchanges are free." },
  { q: "Do you offer cash on delivery?", a: "Yes, cash on delivery is available island-wide for orders up to Rs 30,000." },
  { q: "What can't be returned?", a: "Sale items marked final sale, and items that have been worn, washed, altered or have had their tags removed." },
  { q: "My item arrived damaged or wrong.", a: "We're sorry! Let us know within 48 hours of delivery with a photo, and we'll replace it or refund you in full, including shipping." },
  { q: "How do I track my order?", a: "You'll receive an SMS and email with a tracking link as soon as your order leaves our studio." },
];
