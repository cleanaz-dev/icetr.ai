import {
  Home,
  BarChart3,
  Users,
  Calendar,
  Mail,
  Phone,
  Cog,
  Trophy,
  PhoneOutgoing,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  Folder,
  Brain,
  Handshake
} from "lucide-react";
import { PiStudent } from "react-icons/pi";

import US from 'country-flag-icons/react/3x2/US'
import CA from 'country-flag-icons/react/3x2/CA'


export const LEAD_STATUSES = {
  New: { label: "New", variant: "secondary" },
  Contacted: { label: "Contacted", variant: "outline" },
  Qualified: { label: "Qualified", variant: "default" },
  Proposal: { label: "Proposal", variant: "secondary" },
  Lost: { label: "Lost", variant: "destructive" },
  Won: { label: "Won", variant: "default" },
};

export const CALL_OUTCOMES = [
  {
    value: "answered",
    label: "Answered",
    status: "Contacted",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  {
    value: "no_answer",
    label: "No Answer",
    status: "Contacted",
    icon: XCircle,
    color: "text-yellow-500",
  },
  {
    value: "busy",
    label: "Busy",
    status: "Contacted",
    icon: AlertCircle,
    color: "text-orange-500",
  },
  {
    value: "voicemail",
    label: "Voicemail",
    status: "Contacted",
    icon: MessageSquare,
    color: "text-blue-500",
  },
  {
    value: "wrong_number",
    label: "Wrong Number",
    status: "Lost",
    icon: XCircle,
    color: "text-red-500",
  },
  {
    value: "interested",
    label: "Interested",
    status: "Qualified",
    icon: CheckCircle2,
    color: "text-green-600",
  },
  {
    value: "not_interested",
    label: "Not Interested",
    status: "Lost",
    icon: XCircle,
    color: "text-red-600",
  },
  {
    value: "callback",
    label: "Callback Scheduled",
    status: "Contacted",
    icon: Clock,
    color: "text-blue-600",
  },
];

export const FROM_NUMBERS = [
  { value: "+14374475892", label: "+1 (437) 447-5892", country: <CA title="Canada" className="w-8 h-auto" />, region: "ON" },
  { value: "+17789102129", label: "+1 (778) 910-2129", country: <CA title="Canada" className="w-8 h-auto" />, region: "BC" },
  { value: "+14344783309", label: "+1 (434) 478-3309", country: <US title="United States" className="w-8 h-auto" />, region: "VA" },
];

export const navItems = [
  { label: "features", href: "/#features" },
  { label: "testimonials", href: "/#testimonials" },
  { label: "pricing", href: "/#pricing" },
  { label: "contact", href: "/#contact" },
];

export const navigation = [
  { name: "Dashboard", href: "/home", icon: Home },
  { name: "Campaigns", href: "/campaigns", icon: Trophy },
  {name: "Teams", href: "/teams", icon: Handshake },
  // { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Documents", href: "/documents", icon: Folder },
  // { name: "Cold Emails", href: "/cold-emails", icon: Mail },
  // { name: "Cold Calls", href: "/cold-calls", icon: Phone },
  // { name: "Calendar", href: "/calendar", icon: Calendar },
  {name: "Training", href: "/training", icon: PiStudent },
  { name: "Dialer", href: "/dialer", icon: PhoneOutgoing },
  { name: "Settings", href: "/settings", icon: Cog },
];

export const contacts = [
  {
    id: 1,
    name: "John Doe",
    phone: "+1 (555) 123-4567",
    email: "john@example.com",
    lastCall: "2 hours ago",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "+1 (555) 987-6543",
    email: "jane@example.com",
    lastCall: "1 day ago",
  },
  {
    id: 3,
    name: "Mike Johnson",
    phone: "+1 (555) 456-7890",
    email: "mike@example.com",
    lastCall: "3 days ago",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    phone: "+1 (555) 321-0987",
    email: "sarah@example.com",
    lastCall: "1 week ago",
  },
];

export const recentCalls = [
  {
    id: 1,
    name: "John Doe",
    phone: "+1 (555) 123-4567",
    type: "outgoing",
    duration: "5:23",
    time: "10:30 AM",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "+1 (555) 987-6543",
    type: "incoming",
    duration: "2:15",
    time: "9:45 AM",
  },
  {
    id: 3,
    name: "Unknown",
    phone: "+1 (555) 111-2222",
    type: "missed",
    duration: "0:00",
    time: "8:20 AM",
  },
];

export const dialpadNumbers = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export const mockContacts = [
  {
    id: 1,
    name: "Paul Hendricks",
    phone: "+12267902753",
    email: "john@example.com",
    type: "lead",
    company: "Acme Corp",
    lastContact: "2024-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    phone: "+12345678902",
    email: "jane@example.com",
    type: "contact",
    company: "Tech Solutions",
    lastContact: "2024-01-14",
  },
  {
    id: 3,
    name: "Bob Johnson",
    phone: "+12345678903",
    email: "bob@example.com",
    type: "lead",
    company: "StartupXYZ",
    lastContact: "2024-01-13",
  },
  {
    id: 4,
    name: "Alice Brown",
    phone: "+12345678904",
    email: "alice@example.com",
    type: "contact",
    company: "Global Industries",
    lastContact: "2024-01-12",
  },
  {
    id: 5,
    name: "Mike Wilson",
    phone: "+12345678905",
    email: "mike@example.com",
    type: "lead",
    company: "Innovation Labs",
    lastContact: "2024-01-11",
  },
  {
    id: 6,
    name: "Sarah Davis",
    phone: "+12345678906",
    email: "sarah@example.com",
    type: "contact",
    company: "Digital Corp",
    lastContact: "2024-01-10",
  },
];
export const Region = [
  {
    provinces: [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Nova Scotia",
      "Ontario",
      "Prince Edward Island",
      "Quebec",
      "Saskatchewan",
      "Northwest Territories",
      "Nunavut",
      "Yukon"
    ],
    states: [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming"
    ]
  }
];
