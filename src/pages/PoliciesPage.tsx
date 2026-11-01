import React from 'react';

interface PoliciesPageProps {
  policyType: 'shipping' | 'returns' | 'privacy' | 'terms';
  navigate: (path: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ policyType, navigate }) => {
  const tabs = [
    { id: 'shipping', label: 'Shipping & Delivery', path: '/policies/shipping' },
    { id: 'returns', label: 'Returns & Refunds', path: '/policies/returns' },
    { id: 'privacy', label: 'Privacy Policy', path: '/policies/privacy' },
    { id: 'terms', label: 'Terms & Conditions', path: '/policies/terms' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Policy Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#123D24]/10 rounded-2xl shadow-xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
              policyType === tab.id
                ? 'bg-[#123D24] text-[#FFF9E9]'
                : 'text-[#20251F]/70 hover:text-[#123D24] hover:bg-[#F5ECCE]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Policy Document Body */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#123D24]/10 shadow-xs space-y-6 text-xs sm:text-sm text-[#20251F]/90 leading-relaxed">
        
        {policyType === 'shipping' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#123D24]">Shipping & Delivery Policy</h1>
            <p className="text-xs text-[#5D675A]">Last updated: October 2026</p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">1. Local Express Service Area (Tri-Cities)</h3>
            <p>
              NutriCrunch operates its central fulfillment kitchen from Hanamkonda. We provide direct local express delivery to Warangal, Hanamkonda, and Kazipet (PIN codes: 506001, 506002, 506003, 506004, 506007, 506009, 506011, 506015). Orders placed before 2:00 PM IST are dispatched for same-day or next-day delivery.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">2. Delivery Charges & Free Thresholds</h3>
            <p>
              • <strong>Warangal Tri-Cities:</strong> FREE delivery on orders above ₹499. Orders below ₹499 are charged a flat ₹40 delivery fee.<br />
              • <strong>Rest of Telangana & India:</strong> FREE shipping on orders above ₹999. Standard shipping of ₹70 applies otherwise.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">3. Packaging & Safe Transit</h3>
            <p>
              All products are packed in multi-layered, food-grade airtight pouches with tamper-evident heat seals to safeguard freshness and aroma during transit.
            </p>
          </div>
        )}

        {policyType === 'returns' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#123D24]">Returns, Refunds & Cancellation Policy</h1>
            <p className="text-xs text-[#5D675A]">Last updated: October 2026</p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">1. Food Safety & Returns</h3>
            <p>
              Because NutriCrunch prepares perishable food products without artificial preservatives, we cannot accept returns of opened packages for health and food safety compliance.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">2. Damaged or Defective Items in Transit</h3>
            <p>
              If your parcel arrives with damaged packaging, an unsealed pouch, or is spoiled in transit, please notify us within 48 hours of delivery by sharing a photo of the package via WhatsApp at +91 9154797936 or email at care@nutricrunch.in. We will issue a replacement shipment immediately or process a 100% refund.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">3. Order Cancellations</h3>
            <p>
              Orders may be cancelled free of charge before they are handed over to the delivery courier. Once marked as "Shipped" or "Out for Delivery", cancellations cannot be processed.
            </p>
          </div>
        )}

        {policyType === 'privacy' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#123D24]">Privacy & Data Protection Policy</h1>
            <p className="text-xs text-[#5D675A]">Last updated: October 2026</p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">1. Information We Collect</h3>
            <p>
              When you purchase from NutriCrunch, we collect only the customer details essential to deliver your order: customer name, mobile number, delivery address, PIN code, and optional email. We never sell, rent, or trade your personal data to third-party advertising brokers.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">2. Payment Security</h3>
            <p>
              We do not store or process your credit card numbers, CVVs, or UPI PINs on our servers. All online transactions are encrypted and processed through RBI-authorized payment aggregators (such as Razorpay).
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">3. Communications</h3>
            <p>
              We use your phone number strictly for delivery coordination and order status confirmations. You will not receive automated marketing spam unless you voluntarily subscribed to our newsletter with explicit consent.
            </p>
          </div>
        )}

        {policyType === 'terms' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#123D24]">Terms & Conditions</h1>
            <p className="text-xs text-[#5D675A]">Last updated: October 2026</p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">1. Product Information & Pricing</h3>
            <p>
              All prices displayed are in Indian Rupees (INR) and inclusive of applicable goods and services taxes. While we take every effort to maintain accurate inventory, in the rare event that an item is out of stock after your order is placed, we will notify you and provide an immediate refund or replacement.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">2. Genuine Natural Food Disclaimer</h3>
            <p>
              NutriCrunch food products are manufactured from natural agricultural ingredients (nuts, seeds, jaggery, plantains). Slight natural variations in shade, crunch, or natural sweetness between small batches may occur and are hallmark characteristics of real, unstandardized whole foods.
            </p>

            <h3 className="text-base font-bold text-[#123D24] pt-2">3. Governing Jurisdiction</h3>
            <p>
              Any disputes arising in connection with orders placed on NutriCrunch shall be subject to the exclusive jurisdiction of the competent courts in Warangal, Telangana, India.
            </p>
          </div>
        )}

      </div>

    </div>
  );
};
