import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: [
      { title: "Company location — Kaelo LMS, Johannesburg" },
      {
        name: "description",
        content:
          "Visit Kaelo LMS at 26 Sivewright Ave, Doornfontein, Johannesburg. Office hours, phone, email and directions.",
      },
      { property: "og:title", content: "Kaelo LMS — Company location" },
      {
        property: "og:description",
        content: "Our Johannesburg campus: address, office hours and contact details.",
      },
    ],
  }),
  component: LocationPage,
});

function LocationPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 md:py-20">
      <h1 className="text-4xl font-bold">Company location</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Our training campus and support team are based in Johannesburg, South Africa. Walk-ins are
        welcome during office hours.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Address</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                26 Sivewright Ave
                <br />
                Doornfontein, Johannesburg
                <br />
                Gauteng, 2094, South Africa
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Office hours</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Monday – Friday: 08:00 – 17:00
                <br />
                Saturday: 09:00 – 13:00
                <br />
                Sunday &amp; public holidays: closed
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Phone</h2>
              <a href="tel:+27110001234" className="mt-1 block text-sm text-muted-foreground hover:text-foreground">
                +27 11 000 1234
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">Email</h2>
              <a
                href="mailto:hello@kaelolms.co.za"
                className="mt-1 block text-sm text-muted-foreground hover:text-foreground"
              >
                hello@kaelolms.co.za
              </a>
            </div>
          </div>
        </div>

        <div className="shadow-soft overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Map showing Kaelo LMS in Doornfontein, Johannesburg"
            src="https://www.openstreetmap.org/export/embed.html?bbox=28.045%2C-26.205%2C28.070%2C-26.190&layer=mapnik"
            className="h-80 w-full lg:h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
