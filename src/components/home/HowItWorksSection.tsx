import {
  UserRound,
  Building2,
  Landmark,
  Droplets,
  FileText,
  HandHeart,
  ClipboardCheck,
  Send,
  Users,
  MapPinned,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

const roles = [
  {
    icon: UserRound,
    title: "User / Donor",
    description:
      "Register as a blood donor, create blood-finding or helping posts, and fund campaigns for patients in need.",
    gradient: "from-primary/10 to-transparent",
    features: [
      { icon: Droplets, label: "Donate blood & track history" },
      { icon: FileText, label: "Create blood-finding posts" },
      { icon: HandHeart, label: "Fund medical campaigns" },
    ],
    cta: { label: "Register as Donor", href: "/register" },
  },
  {
    icon: Building2,
    title: "Hospital",
    description:
      "Record verifiable donations, send consent requests to donors, and manage your institution's blood bank.",
    gradient: "from-chart-2/10 to-transparent",
    features: [
      { icon: ClipboardCheck, label: "Record verified donations" },
      { icon: Send, label: "Send consent requests" },
      { icon: Droplets, label: "Manage blood bank data" },
    ],
    cta: { label: "Register Hospital", href: "/register" },
  },
  {
    icon: Landmark,
    title: "Organisation",
    description:
      "Manage volunteers, track area-wise donor availability, and coordinate large-scale blood drives.",
    gradient: "from-chart-3/10 to-transparent",
    features: [
      { icon: Users, label: "Manage volunteers" },
      { icon: MapPinned, label: "Track area-wise donors" },
      { icon: ClipboardCheck, label: "Coordinate blood drives" },
    ],
    cta: { label: "Register Organisation", href: "/register" },
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20" aria-label="Platform roles and features">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three Roles, One Mission
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Whether you are a donor, a hospital, or an organisation — our platform unites everyone
            in the mission to save lives.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card
              key={role.title}
              className="group relative overflow-hidden border-border/50 hover:border-primary/40 transition-all duration-300"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <CardHeader className="relative pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105">
                  <role.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{role.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {role.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Feature List */}
                <ul className="space-y-3">
                  {role.features.map((feature) => (
                    <li key={feature.label} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2" asChild>
                  <Link href={role.cta.href}>
                    {role.cta.label}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
