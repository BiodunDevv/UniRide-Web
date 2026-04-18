"use client";

import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSupportContact } from "@/hooks/use-support-contact";

export default function ContactSection() {
  const { supportEmail, supportPhone, supportMailto, supportTel } =
    useSupportContact();

  const contactInfo = [
    {
      icon: Phone,
      label: "Phone",
      value: supportPhone,
      href: supportTel,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Mail,
      label: "Email",
      value: supportEmail,
      href: supportMailto,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Bowen University\nIwo, Osun State, Nigeria",
      href: "",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Clock,
      label: "Hours",
      value: "Monday - Friday: 8am - 8pm\nSaturday - Sunday: 10am - 6pm",
      href: "",
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-muted"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Get Campus Ride Support
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Contact UniRide for rider support, driver onboarding questions,
              and help with our university transportation platform.
            </p>

            <div className="space-y-4">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    className="border-none shadow-none bg-transparent py-0"
                  >
                    <CardContent className="flex items-start space-x-4 px-0 py-2">
                      <div
                        className={`shrink-0 w-9 h-9 ${item.bg} flex items-center justify-center`}
                      >
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-muted-foreground whitespace-pre-line text-xs sm:text-sm hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <div className="text-muted-foreground whitespace-pre-line text-xs sm:text-sm">
                            {item.value}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="aspect-4/3 overflow-hidden shadow-xl relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d8573.378312684195!2d4.1803550092999!3d7.62193173844789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1039db1bc8a4b5ed%3A0x6dc74642ba147212!2sBowen%20University%20Main%20Gate%201!5e1!3m2!1sen!2sus!4v1764108633257!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bowen University Iwo, Nigeria"
            />
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm border border-white px-3 py-2">
              <p className="text-[11px] font-semibold text-[#042F40]">
                Live Support
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {supportPhone} · {supportEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
