"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Shield,
  FileText,
  Users,
  Car,
  AlertCircle,
} from "lucide-react";

export default function TermsOfServicePage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "platform-overview", label: "Platform Overview" },
    { id: "driver-requirements", label: "Driver Requirements & Eligibility" },
    { id: "driver-responsibilities", label: "Driver Responsibilities" },
    { id: "vehicle-requirements", label: "Vehicle Requirements" },
    { id: "application-process", label: "Driver Application Process" },
    { id: "payment-earnings", label: "Payment & Earnings" },
    { id: "insurance-liability", label: "Insurance & Liability" },
    { id: "safety-conduct", label: "Safety & Conduct Standards" },
    { id: "account-suspension", label: "Account Suspension & Termination" },
    { id: "user-obligations", label: "Passenger User Obligations" },
    { id: "privacy", label: "Privacy & Data Protection" },
    { id: "intellectual-property", label: "Intellectual Property" },
    { id: "disclaimers", label: "Disclaimers & Warranties" },
    { id: "limitation-liability", label: "Limitation of Liability" },
    { id: "indemnification", label: "Indemnification" },
    { id: "dispute-resolution", label: "Dispute Resolution" },
    { id: "modifications", label: "Modifications to Terms" },
    { id: "governing-law", label: "Governing Law" },
    { id: "contact", label: "Contact Information" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#042F40] via-[#063d54] to-[#042F40]">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 p-4">
        <div className="max-w-4xl mx-auto">
          <div
            className={`flex items-center justify-between border border-transparent px-3 py-2 sm:px-6 sm:py-3 transition-all duration-300 ease-out ${
              isScrolled
                ? "bg-primary shadow-lg backdrop-blur-2xl"
                : "bg-transparent backdrop-blur-sm"
            }`}
          >
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="w-7 h-auto" variant="light" />
              <span className="text-base font-bold text-white tracking-tight">
                UniRide
              </span>
            </Link>
            <span className="hidden sm:block text-xs text-white/50 font-medium tracking-wide">
              Terms of Service
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-xs font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white shadow-2xl">
          {/* Title Block */}
          <div className="bg-[#042F40] px-6 sm:px-10 py-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 mb-4">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Terms of Service
            </h1>
            <Badge
              variant="outline"
              className="border-white/20 text-white/70 text-xs"
            >
              Last Updated: November 27, 2025
            </Badge>
          </div>

          <div className="px-5 sm:px-10 py-8 sm:py-10 space-y-10">
            {/* Introduction */}
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-[#042F40] pl-4">
              Welcome to UniRide. These Terms of Service (&quot;Terms&quot;)
              govern your access to and use of the UniRide platform, including
              our website, mobile applications, and services (collectively, the
              &quot;Platform&quot;). By accessing or using the Platform, you
              agree to be bound by these Terms.
            </p>

            {/* Table of Contents */}
            <div className="border p-5 bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#042F40]" />
                <h2 className="text-sm font-semibold text-[#042F40]">
                  Table of Contents
                </h2>
              </div>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-muted-foreground list-decimal ml-4">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="hover:text-[#042F40] hover:underline underline-offset-2 transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* ── Section 1 ─────────────────────────────────────────────── */}
            <section id="acceptance" className="scroll-mt-20">
              <SectionHeader number={1} title="Acceptance of Terms" />
              <SectionBody>
                <p>
                  By creating an account, submitting a driver application, or
                  using any part of the UniRide Platform, you acknowledge that
                  you have read, understood, and agree to be bound by these
                  Terms and our Privacy Policy.
                </p>
                <p>
                  If you do not agree to these Terms, you must not access or use
                  the Platform. We reserve the right to refuse service to anyone
                  for any reason at any time.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 2 ─────────────────────────────────────────────── */}
            <section id="platform-overview" className="scroll-mt-20">
              <SectionHeader number={2} title="Platform Overview" />
              <SectionBody>
                <p>
                  UniRide is a ridesharing platform designed specifically for
                  university students and approved drivers. The Platform
                  connects passengers seeking rides with drivers who have
                  available seats in their vehicles.
                </p>
                <p>
                  UniRide acts solely as a technology platform and marketplace.
                  We are not a transportation carrier, and we do not provide
                  transportation services. All rides are provided by independent
                  drivers.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 3 ─────────────────────────────────────────────── */}
            <section id="driver-requirements" className="scroll-mt-20">
              <SectionHeader
                number={3}
                title="Driver Requirements & Eligibility"
                icon={<Car className="w-4 h-4" />}
              />
              <SectionBody>
                <p className="font-semibold text-foreground">
                  To become a UniRide driver, you must meet the following
                  requirements:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    <strong>Age:</strong> Must be at least 21 years old
                  </li>
                  <li>
                    <strong>License:</strong> Hold a valid driver&apos;s license
                    issued in Nigeria for at least 2 years
                  </li>
                  <li>
                    <strong>Clean Driving Record:</strong> No major traffic
                    violations or DUI convictions in the past 3 years
                  </li>
                  <li>
                    <strong>Background Check:</strong> Pass a comprehensive
                    background check, including criminal history screening
                  </li>
                  <li>
                    <strong>University Affiliation:</strong> Must be a current
                    student, staff member, or faculty at a recognized university
                    (verification required)
                  </li>
                  <li>
                    <strong>Insurance:</strong> Maintain valid auto insurance
                    that meets or exceeds state minimum requirements
                  </li>
                  <li>
                    <strong>Vehicle Registration:</strong> Provide proof of
                    current vehicle registration
                  </li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 p-4 mt-2">
                  <p className="text-xs text-yellow-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-700" />
                    <span>
                      <strong>Important:</strong> Providing false or misleading
                      information during the application process will result in
                      immediate disqualification and may lead to legal action.
                    </span>
                  </p>
                </div>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 4 ─────────────────────────────────────────────── */}
            <section id="driver-responsibilities" className="scroll-mt-20">
              <SectionHeader
                number={4}
                title="Driver Responsibilities"
                icon={<Users className="w-4 h-4" />}
              />
              <SectionBody>
                <p>As a UniRide driver, you agree to:</p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    Maintain a professional and courteous demeanor at all times
                  </li>
                  <li>Arrive at pickup locations on time</li>
                  <li>
                    Drive safely and obey all traffic laws and regulations
                  </li>
                  <li>
                    Maintain your vehicle in clean and safe operating condition
                  </li>
                  <li>
                    Verify passenger identity before allowing them into your
                    vehicle
                  </li>
                  <li>
                    Not discriminate against passengers based on race, religion,
                    gender, disability, or any other protected characteristic
                  </li>
                  <li>Respect passenger privacy and confidentiality</li>
                  <li>
                    Report any incidents, accidents, or safety concerns
                    immediately to UniRide
                  </li>
                  <li>
                    Keep your driver profile information accurate and up-to-date
                  </li>
                  <li>
                    Not operate the Platform while under the influence of
                    alcohol or drugs
                  </li>
                  <li>
                    Not allow unauthorized individuals to use your driver
                    account
                  </li>
                  <li>
                    Complete rides as accepted unless there is a legitimate
                    safety concern
                  </li>
                </ul>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 5 ─────────────────────────────────────────────── */}
            <section id="vehicle-requirements" className="scroll-mt-20">
              <SectionHeader number={5} title="Vehicle Requirements" />
              <SectionBody>
                <p>
                  All vehicles used on the UniRide Platform must meet the
                  following standards:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>Model year 2010 or newer</li>
                  <li>4-door sedan, SUV, or hatchback</li>
                  <li>Properly functioning seat belts for all passengers</li>
                  <li>Clean interior and exterior</li>
                  <li>
                    No cosmetic damage that affects safety or passenger comfort
                  </li>
                  <li>Working air conditioning and heating</li>
                  <li>
                    All lights, signals, and safety equipment in proper working
                    order
                  </li>
                  <li>
                    Valid vehicle registration and inspection certification
                  </li>
                  <li>No commercial branding or taxi/for-hire signage</li>
                </ul>
                <p>
                  UniRide reserves the right to inspect vehicles periodically
                  and may require additional inspections at any time.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 6 ─────────────────────────────────────────────── */}
            <section id="application-process" className="scroll-mt-20">
              <SectionHeader number={6} title="Driver Application Process" />
              <SectionBody>
                <p>
                  The driver application process includes the following steps:
                </p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>
                    <strong>Submit Application:</strong> Complete the online
                    application form with accurate information
                  </li>
                  <li>
                    <strong>Document Upload:</strong> Upload required documents
                    including driver&apos;s license, vehicle registration, and
                    insurance
                  </li>
                  <li>
                    <strong>Background Check:</strong> Authorize and pass a
                    comprehensive background check
                  </li>
                  <li>
                    <strong>Vehicle Inspection:</strong> Schedule and pass a
                    vehicle inspection (if required)
                  </li>
                  <li>
                    <strong>Review:</strong> UniRide reviews your application
                    (typically within 24–48 hours)
                  </li>
                  <li>
                    <strong>Approval:</strong> Upon approval, complete driver
                    orientation and training
                  </li>
                  <li>
                    <strong>Activation:</strong> Your driver account is
                    activated, and you may begin accepting rides
                  </li>
                </ol>
                <p>
                  UniRide reserves the right to approve or reject any
                  application at our sole discretion. Application decisions are
                  final.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 7 ─────────────────────────────────────────────── */}
            <section id="payment-earnings" className="scroll-mt-20">
              <SectionHeader number={7} title="Payment & Earnings" />
              <SectionBody>
                <p className="font-semibold text-foreground">
                  Driver Earnings:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    Drivers earn fares based on distance, time, and demand
                  </li>
                  <li>
                    UniRide deducts a service fee from each completed ride
                  </li>
                  <li>
                    Pricing is set according to our fare policy and may vary by
                    location and time
                  </li>
                  <li>
                    Drivers may receive tips from passengers, which are retained
                    in full by the driver
                  </li>
                </ul>
                <p className="font-semibold text-foreground mt-3">
                  Payment Processing:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    Earnings are processed weekly and deposited to your
                    registered bank account
                  </li>
                  <li>
                    You must provide accurate banking information for payment
                    processing
                  </li>
                  <li>
                    UniRide is not responsible for delays caused by incorrect
                    banking information
                  </li>
                  <li>Minimum payout threshold may apply</li>
                </ul>
                <p className="font-semibold text-foreground mt-3">Taxes:</p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    Drivers are independent contractors, not employees of
                    UniRide
                  </li>
                  <li>
                    You are responsible for all taxes related to your earnings
                  </li>
                  <li>
                    UniRide will provide necessary tax documentation as required
                    by law
                  </li>
                </ul>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 8 ─────────────────────────────────────────────── */}
            <section id="insurance-liability" className="scroll-mt-20">
              <SectionHeader
                number={8}
                title="Insurance & Liability"
                icon={<Shield className="w-4 h-4" />}
              />
              <SectionBody>
                <p className="font-semibold text-foreground">
                  Driver Insurance Requirements:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    Drivers must maintain personal auto insurance that meets or
                    exceeds minimum legal requirements
                  </li>
                  <li>
                    You must notify your insurance company that you use your
                    vehicle for ridesharing
                  </li>
                  <li>
                    Proof of insurance must be provided during application and
                    updated as policies renew
                  </li>
                </ul>
                <p className="font-semibold text-foreground mt-3">
                  Platform Insurance:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>
                    UniRide maintains supplemental insurance coverage during
                    active rides
                  </li>
                  <li>
                    Coverage details and limits are available upon request
                  </li>
                  <li>
                    Insurance coverage may vary based on ride status (en route
                    to pickup, passenger in vehicle, etc.)
                  </li>
                </ul>
                <p className="font-semibold text-foreground mt-3">Liability:</p>
                <p>
                  Drivers are liable for any damages or injuries caused by their
                  negligence or misconduct. UniRide is not liable for driver
                  actions, vehicle conditions, or incidents occurring during
                  rides.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 9 ─────────────────────────────────────────────── */}
            <section id="safety-conduct" className="scroll-mt-20">
              <SectionHeader number={9} title="Safety & Conduct Standards" />
              <SectionBody>
                <p className="font-semibold text-foreground">
                  Prohibited Activities — Drivers may NOT:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>Operate a vehicle while impaired by drugs or alcohol</li>
                  <li>Engage in aggressive, reckless, or distracted driving</li>
                  <li>
                    Use the Platform to commit fraud or any illegal activity
                  </li>
                  <li>Harass, threaten, or discriminate against passengers</li>
                  <li>
                    Make inappropriate physical contact or advances toward
                    passengers
                  </li>
                  <li>Share or misuse passenger personal information</li>
                  <li>
                    Accept cash payments or negotiate fares outside the Platform
                  </li>
                  <li>Smoke or vape in the vehicle while on duty</li>
                  <li>Allow unauthorized passengers or pets in the vehicle</li>
                  <li>Record passengers without explicit consent</li>
                </ul>
                <div className="bg-red-50 border border-red-200 p-4 mt-2">
                  <p className="text-xs text-red-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
                    <span>
                      <strong>Zero Tolerance:</strong> Violations of safety and
                      conduct standards may result in immediate account
                      suspension or permanent deactivation.
                    </span>
                  </p>
                </div>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 10 ────────────────────────────────────────────── */}
            <section id="account-suspension" className="scroll-mt-20">
              <SectionHeader
                number={10}
                title="Account Suspension & Termination"
              />
              <SectionBody>
                <p className="font-semibold text-foreground">
                  UniRide may suspend or terminate your driver account for:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>Violation of these Terms of Service</li>
                  <li>Fraudulent activity or false information</li>
                  <li>Poor ratings or excessive cancellations</li>
                  <li>Safety violations or passenger complaints</li>
                  <li>Failure to maintain required documentation</li>
                  <li>Inactivity for extended periods</li>
                  <li>Any conduct deemed harmful to the UniRide community</li>
                </ul>
                <p>
                  You may deactivate your account at any time through the
                  Platform settings. Upon termination, you must immediately
                  cease using the Platform and surrender any UniRide materials
                  or equipment.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 11 ────────────────────────────────────────────── */}
            <section id="user-obligations" className="scroll-mt-20">
              <SectionHeader number={11} title="Passenger User Obligations" />
              <SectionBody>
                <p className="font-semibold text-foreground">
                  Passengers agree to:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>Provide accurate pickup and drop-off locations</li>
                  <li>Be ready at the designated pickup time and location</li>
                  <li>Treat drivers and other passengers with respect</li>
                  <li>Follow all driver safety instructions</li>
                  <li>Wear seat belts at all times during the ride</li>
                  <li>
                    Not consume food or beverages without driver permission
                  </li>
                  <li>
                    Pay all applicable fares and fees through the Platform
                  </li>
                  <li>Report any safety concerns or issues immediately</li>
                  <li>
                    Not bring prohibited items (weapons, illegal substances,
                    etc.) into vehicles
                  </li>
                </ul>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 12 ────────────────────────────────────────────── */}
            <section id="privacy" className="scroll-mt-20">
              <SectionHeader number={12} title="Privacy & Data Protection" />
              <SectionBody>
                <p>
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, store, and protect your personal
                  information. By using the Platform, you consent to our data
                  practices as described in the Privacy Policy.
                </p>
                <p>
                  We collect information including your name, contact details,
                  location data, payment information, and ride history. This
                  information is used to provide services, improve the Platform,
                  ensure safety, and comply with legal obligations.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 13 ────────────────────────────────────────────── */}
            <section id="intellectual-property" className="scroll-mt-20">
              <SectionHeader number={13} title="Intellectual Property" />
              <SectionBody>
                <p>
                  The UniRide Platform, including all content, features,
                  functionality, logos, trademarks, and source code, is owned by
                  UniRide and protected by international copyright, trademark,
                  and other intellectual property laws.
                </p>
                <p>
                  You may not copy, modify, distribute, sell, or lease any part
                  of the Platform without our express written permission. You
                  are granted a limited, non-exclusive, non-transferable license
                  to access and use the Platform for its intended purpose.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 14 ────────────────────────────────────────────── */}
            <section id="disclaimers" className="scroll-mt-20">
              <SectionHeader number={14} title="Disclaimers & Warranties" />
              <SectionBody>
                <p className="font-semibold uppercase text-xs tracking-wide text-foreground">
                  The Platform is provided &quot;as is&quot; and &quot;as
                  available&quot; without warranties of any kind, either express
                  or implied.
                </p>
                <p>
                  UniRide does not guarantee that the Platform will be
                  uninterrupted, secure, or error-free. We do not warrant the
                  accuracy or completeness of any information on the Platform.
                </p>
                <p>
                  UniRide is not responsible for the conduct of drivers or
                  passengers, the condition of vehicles, or the quality of
                  transportation services provided.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 15 ────────────────────────────────────────────── */}
            <section id="limitation-liability" className="scroll-mt-20">
              <SectionHeader number={15} title="Limitation of Liability" />
              <SectionBody>
                <p className="font-semibold uppercase text-xs tracking-wide text-foreground">
                  To the maximum extent permitted by law, UniRide shall not be
                  liable for any indirect, incidental, special, consequential,
                  or punitive damages arising out of or related to your use of
                  the Platform.
                </p>
                <p>
                  Our total liability to you for any claims arising from your
                  use of the Platform shall not exceed the amount you paid to
                  UniRide in the twelve months preceding the claim.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 16 ────────────────────────────────────────────── */}
            <section id="indemnification" className="scroll-mt-20">
              <SectionHeader number={16} title="Indemnification" />
              <SectionBody>
                <p>
                  You agree to indemnify, defend, and hold harmless UniRide, its
                  officers, directors, employees, and agents from any claims,
                  liabilities, damages, losses, and expenses (including legal
                  fees) arising out of or related to:
                </p>
                <ul className="list-disc ml-5 space-y-1.5">
                  <li>Your use of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>
                    Your violation of any rights of another person or entity
                  </li>
                  <li>Your provision of transportation services</li>
                  <li>Any accident, injury, or damage caused by you</li>
                </ul>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 17 ────────────────────────────────────────────── */}
            <section id="dispute-resolution" className="scroll-mt-20">
              <SectionHeader number={17} title="Dispute Resolution" />
              <SectionBody>
                <p>
                  Any disputes arising from these Terms or your use of the
                  Platform shall first be addressed through good faith
                  negotiations. If a resolution cannot be reached within 30
                  days, the dispute shall be resolved through binding
                  arbitration in accordance with the Arbitration and
                  Conciliation Act of Nigeria.
                </p>
                <p>
                  You waive any right to participate in class action lawsuits or
                  class-wide arbitration against UniRide.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 18 ────────────────────────────────────────────── */}
            <section id="modifications" className="scroll-mt-20">
              <SectionHeader number={18} title="Modifications to Terms" />
              <SectionBody>
                <p>
                  UniRide reserves the right to modify these Terms at any time.
                  We will notify users of material changes via email or through
                  the Platform. Your continued use of the Platform after changes
                  take effect constitutes acceptance of the modified Terms.
                </p>
                <p>
                  If you do not agree to the modified Terms, you must stop using
                  the Platform and may close your account.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 19 ────────────────────────────────────────────── */}
            <section id="governing-law" className="scroll-mt-20">
              <SectionHeader number={19} title="Governing Law" />
              <SectionBody>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the Federal Republic of Nigeria, without
                  regard to its conflict of law provisions.
                </p>
              </SectionBody>
            </section>

            <Separator />

            {/* ── Section 20 ────────────────────────────────────────────── */}
            <section id="contact" className="scroll-mt-20">
              <SectionHeader number={20} title="Contact Information" />
              <SectionBody>
                <p>
                  If you have questions about these Terms or the UniRide
                  Platform, please contact us:
                </p>
                <div className="border bg-muted/20 p-4 space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> legal@uniride.ng
                  </p>
                  <p>
                    <strong>Support:</strong> support@uniride.ng
                  </p>
                  <p>
                    <strong>Phone:</strong> +234 800 UNIRIDE
                  </p>
                  <p>
                    <strong>Address:</strong> UniRide Nigeria, Lagos, Nigeria
                  </p>
                </div>
              </SectionBody>
            </section>

            <Separator />

            {/* Acknowledgement */}
            <div className="border bg-muted/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#042F40]" />
                <h3 className="text-sm font-semibold text-[#042F40]">
                  Acknowledgment
                </h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By using the UniRide Platform, you acknowledge that you have
                read, understood, and agree to be bound by these Terms of
                Service. If you are applying to become a driver, you further
                acknowledge that you meet all eligibility requirements and will
                comply with all driver responsibilities outlined above.
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} UniRide. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionHeader({
  number,
  title,
  icon,
}: {
  number: number;
  title: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="shrink-0 w-7 h-7 bg-[#042F40] text-white flex items-center justify-center font-bold text-xs">
        {number}
      </div>
      <h2 className="text-base sm:text-lg font-bold text-[#042F40] flex items-center gap-2 pt-0.5">
        {icon}
        {title}
      </h2>
    </div>
  );
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="pl-10 text-sm text-muted-foreground space-y-3 leading-relaxed">
      {children}
    </div>
  );
}
