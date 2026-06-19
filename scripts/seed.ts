import { db } from "../src/lib/db";
import { studentInputToRecord } from "../src/lib/student";
import type { StudentInput } from "../src/lib/types";

const sampleStudents: StudentInput[] = [
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@college.edu",
    phone: "+91 98765 43210",
    rollNumber: "CS21B001",
    branch: "Computer Science",
    year: 4,
    graduationYear: 2025,
    cgpa: 9.1,
    tenthPct: 95,
    twelfthPct: 92,
    skills: [
      { name: "Data Structures & Algorithms", level: 5 },
      { name: "Python", level: 5 },
      { name: "Java", level: 4 },
      { name: "React", level: 4 },
      { name: "Node.js", level: 4 },
      { name: "SQL", level: 4 },
      { name: "AWS", level: 3 },
      { name: "Git", level: 4 },
    ],
    projects: [
      {
        title: "AI-Powered Resume Analyzer",
        description:
          "Full-stack web app that parses resumes and matches candidates to job descriptions using NLP.",
        tech: ["React", "Node.js", "Python", "TensorFlow"],
      },
      {
        title: "Real-time Collaborative Editor",
        description:
          "Google Docs-like editor with CRDT-based conflict resolution and live cursors.",
        tech: ["React", "WebSocket", "Node.js"],
      },
      {
        title: "Stock Market Predictor",
        description:
          "ML model predicting stock trends using LSTM networks with 72% accuracy.",
        tech: ["Python", "PyTorch", "Pandas"],
      },
    ],
    certifications: [
      { name: "AWS Solutions Architect - Associate", issuer: "Amazon", date: "2024-06" },
      { name: "Meta Front-End Developer", issuer: "Meta", date: "2024-01" },
    ],
    internships: [
      {
        company: "Google",
        role: "Software Engineering Intern",
        duration: "3 months",
        description:
          "Worked on internal tooling for the Search team, improving query throughput by 18%.",
      },
      {
        company: "Razorpay",
        role: "Backend Engineering Intern",
        duration: "2 months",
        description:
          "Built payment reconciliation microservice handling 10K+ transactions/day.",
      },
    ],
    achievements: [
      "Winner - Smart India Hackathon 2023",
      "AIR 142 in Google Kick Start",
      "Technical Head - Coding Club",
    ],
    linkedinUrl: "https://linkedin.com/in/aaravsharma",
    githubUrl: "https://github.com/aaravsharma",
    status: "Active",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@college.edu",
    phone: "+91 98765 43211",
    rollNumber: "CS21B002",
    branch: "Computer Science",
    year: 4,
    graduationYear: 2025,
    cgpa: 8.7,
    tenthPct: 93,
    twelfthPct: 89,
    skills: [
      { name: "Machine Learning", level: 4 },
      { name: "Python", level: 5 },
      { name: "TensorFlow", level: 4 },
      { name: "SQL", level: 4 },
      { name: "Power BI", level: 3 },
      { name: "Excel", level: 4 },
    ],
    projects: [
      {
        title: "Diabetes Detection System",
        description:
          "ML model achieving 94% accuracy in early diabetes detection using patient vitals.",
        tech: ["Python", "Scikit-learn", "Flask"],
      },
      {
        title: "Sales Analytics Dashboard",
        description:
          "Interactive dashboard visualizing 2 years of retail sales data with forecasting.",
        tech: ["Power BI", "Python", "SQL"],
      },
    ],
    certifications: [
      { name: "Google Data Analytics", issuer: "Google", date: "2024-03" },
      { name: "Machine Learning Specialization", issuer: "Coursera", date: "2023-11" },
    ],
    internships: [
      {
        company: "Microsoft",
        role: "Data Science Intern",
        duration: "3 months",
        description:
          "Built churn prediction model improving customer retention strategy.",
      },
    ],
    achievements: [
      "Published paper in IEEE conference on ML in Healthcare",
      "2nd place - National Data Science Challenge",
    ],
    linkedinUrl: "https://linkedin.com/in/priyapatel",
    githubUrl: "https://github.com/priyapatel",
    status: "Active",
  },
  {
    name: "Rohan Mehta",
    email: "rohan.mehta@college.edu",
    phone: "+91 98765 43212",
    rollNumber: "IT21B003",
    branch: "Information Technology",
    year: 4,
    graduationYear: 2025,
    cgpa: 7.8,
    tenthPct: 88,
    twelfthPct: 84,
    skills: [
      { name: "JavaScript", level: 4 },
      { name: "React", level: 4 },
      { name: "Node.js", level: 3 },
      { name: "MongoDB", level: 3 },
      { name: "Git", level: 3 },
    ],
    projects: [
      {
        title: "E-commerce Platform",
        description:
          "Full-featured online store with cart, payments, and admin dashboard.",
        tech: ["React", "Node.js", "MongoDB", "Stripe"],
      },
    ],
    certifications: [
      { name: "Meta Front-End Developer", issuer: "Meta", date: "2024-02" },
    ],
    internships: [
      {
        company: "Zoho",
        role: "Full Stack Intern",
        duration: "2 months",
        description:
          "Developed feature modules for Zoho Commerce product.",
      },
    ],
    achievements: ["Top contributor - college open-source club"],
    linkedinUrl: "https://linkedin.com/in/rohanmehta",
    githubUrl: "https://github.com/rohanmehta",
    status: "Looking",
  },
  {
    name: "Ananya Reddy",
    email: "ananya.reddy@college.edu",
    phone: "+91 98765 43213",
    rollNumber: "EC21B004",
    branch: "Electronics & Communication",
    year: 4,
    graduationYear: 2025,
    cgpa: 8.9,
    tenthPct: 96,
    twelfthPct: 91,
    skills: [
      { name: "Embedded C", level: 4 },
      { name: "Python", level: 4 },
      { name: "C++", level: 4 },
      { name: "Arduino", level: 4 },
      { name: "MATLAB", level: 3 },
      { name: "Linux", level: 3 },
    ],
    projects: [
      {
        title: "IoT-based Smart Agriculture System",
        description:
          "Sensor network monitoring soil moisture, pH, and weather to automate irrigation.",
        tech: ["Arduino", "ESP32", "Python", "MQTT"],
      },
      {
        title: "Autonomous Line Follower Robot",
        description:
          "PID-controlled robot winning 2nd place at inter-college robotics fest.",
        tech: ["Embedded C", "Arduino"],
      },
    ],
    certifications: [
      { name: "Embedded Systems Specialization", issuer: "Coursera", date: "2023-12" },
    ],
    internships: [
      {
        company: "Texas Instruments",
        role: "Hardware Engineering Intern",
        duration: "3 months",
        description:
          "Validated ADC performance on next-gen analog chips.",
      },
    ],
    achievements: [
      "2nd place - National Robotics Competition",
      "IEEE student branch Vice Chair",
    ],
    linkedinUrl: "https://linkedin.com/in/ananyareddy",
    githubUrl: "https://github.com/ananyareddy",
    status: "Active",
  },
  {
    name: "Karthik Nair",
    email: "karthik.nair@college.edu",
    phone: "+91 98765 43214",
    rollNumber: "ME21B005",
    branch: "Mechanical",
    year: 3,
    graduationYear: 2026,
    cgpa: 6.9,
    tenthPct: 82,
    twelfthPct: 78,
    skills: [
      { name: "AutoCAD", level: 4 },
      { name: "SolidWorks", level: 3 },
      { name: "MATLAB", level: 2 },
      { name: "Python", level: 2 },
    ],
    projects: [
      {
        title: "Go-Kart Design Project",
        description:
          "Designed and fabricated a go-kart as part of SAE collegiate club.",
        tech: ["SolidWorks", "AutoCAD"],
      },
    ],
    certifications: [],
    internships: [],
    achievements: ["Member - SAE Collegiate Club"],
    status: "Active",
  },
  {
    name: "Sneha Iyer",
    email: "sneha.iyer@college.edu",
    phone: "+91 98765 43215",
    rollNumber: "CS21B006",
    branch: "Computer Science",
    year: 4,
    graduationYear: 2025,
    cgpa: 9.4,
    tenthPct: 98,
    twelfthPct: 96,
    skills: [
      { name: "Data Structures & Algorithms", level: 5 },
      { name: "C++", level: 5 },
      { name: "Java", level: 5 },
      { name: "Python", level: 5 },
      { name: "SQL", level: 5 },
      { name: "System Design", level: 4 },
      { name: "AWS", level: 4 },
      { name: "Docker", level: 4 },
      { name: "Kubernetes", level: 3 },
    ],
    projects: [
      {
        title: "Distributed Key-Value Store",
        description:
          "Raft-consensus based distributed KV store handling 50K ops/sec.",
        tech: ["Go", "Raft", "gRPC"],
      },
      {
        title: "Scalable URL Shortener",
        description:
          "Design handling 100M+ URLs with caching and base62 encoding.",
        tech: ["Java", "Redis", "MySQL"],
      },
      {
        title: "ML Pipeline Orchestrator",
        description:
          "Kubernetes-native pipeline orchestrator for ML workloads.",
        tech: ["Go", "Kubernetes", "Docker"],
      },
    ],
    certifications: [
      { name: "AWS Solutions Architect - Professional", issuer: "Amazon", date: "2024-05" },
      { name: "Certified Kubernetes Administrator", issuer: "CNCF", date: "2024-02" },
    ],
    internships: [
      {
        company: "Amazon",
        role: "SDE Intern",
        duration: "3 months",
        description:
          "Optimized DynamoDB access patterns, reducing latency by 32%.",
      },
      {
        company: "Atlassian",
        role: "Backend Engineering Intern",
        duration: "3 months",
        description:
          "Built notification service scaling to 5M daily events.",
      },
    ],
    achievements: [
      "AIR 47 - Google Code Jam",
      "Google Generation Scholar 2023",
      "Microsoft Engage Mentor",
    ],
    linkedinUrl: "https://linkedin.com/in/snehaiyer",
    githubUrl: "https://github.com/snehaiyer",
    status: "Placed",
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@college.edu",
    phone: "+91 98765 43216",
    rollNumber: "IT21B007",
    branch: "Information Technology",
    year: 4,
    graduationYear: 2025,
    cgpa: 7.2,
    tenthPct: 85,
    twelfthPct: 80,
    skills: [
      { name: "JavaScript", level: 3 },
      { name: "HTML/CSS", level: 3 },
      { name: "React", level: 2 },
      { name: "SQL", level: 3 },
    ],
    projects: [
      {
        title: "Portfolio Website",
        description: "Personal portfolio built with React and Tailwind CSS.",
        tech: ["React", "Tailwind"],
      },
    ],
    certifications: [],
    internships: [],
    achievements: [],
    status: "Looking",
  },
  {
    name: "Deepika Joshi",
    email: "deepika.joshi@college.edu",
    phone: "+91 98765 43217",
    rollNumber: "EC21B008",
    branch: "Electronics & Communication",
    year: 4,
    graduationYear: 2025,
    cgpa: 8.3,
    tenthPct: 91,
    twelfthPct: 88,
    skills: [
      { name: "Python", level: 4 },
      { name: "Machine Learning", level: 3 },
      { name: "Signal Processing", level: 4 },
      { name: "MATLAB", level: 4 },
      { name: "C++", level: 3 },
    ],
    projects: [
      {
        title: "Voice Command Home Automation",
        description:
          "Speech recognition system controlling home appliances via Raspberry Pi.",
        tech: ["Python", "Raspberry Pi", "Google Speech API"],
      },
      {
        title: "ECG Signal Classifier",
        description:
          "ML model classifying cardiac arrhythmias from ECG signals with 89% accuracy.",
        tech: ["Python", "Scikit-learn", "MATLAB"],
      },
    ],
    certifications: [
      { name: "Deep Learning Specialization", issuer: "DeepLearning.AI", date: "2024-04" },
    ],
    internships: [
      {
        company: "Qualcomm",
        role: "Signal Processing Intern",
        duration: "2 months",
        description:
          "Optimized DSP algorithms for 5G modem firmware.",
      },
    ],
    achievements: ["Best Final Year Project Award (nominee)"],
    linkedinUrl: "https://linkedin.com/in/deepikajoshi",
    githubUrl: "https://github.com/deepikajoshi",
    status: "Active",
  },
  {
    name: "Arjun Gupta",
    email: "arjun.gupta@college.edu",
    phone: "+91 98765 43218",
    rollNumber: "EE21B009",
    branch: "Electrical",
    year: 4,
    graduationYear: 2025,
    cgpa: 8.0,
    tenthPct: 90,
    twelfthPct: 87,
    skills: [
      { name: "Python", level: 4 },
      { name: "MATLAB", level: 4 },
      { name: "Power Systems", level: 4 },
      { name: "C++", level: 3 },
      { name: "SQL", level: 3 },
    ],
    projects: [
      {
        title: "Solar Grid Optimization",
        description:
          "Simulation optimizing solar farm output under varying weather conditions.",
        tech: ["MATLAB", "Python"],
      },
      {
        title: "Smart Energy Meter",
        description:
          "IoT energy meter with real-time monitoring and anomaly detection.",
        tech: ["Python", "Arduino", "MQTT"],
      },
    ],
    certifications: [
      { name: "AutoCAD Electrical", issuer: "Autodesk", date: "2023-09" },
    ],
    internships: [
      {
        company: "Schneider Electric",
        role: "Power Systems Intern",
        duration: "2 months",
        description:
          "Assisted in load flow analysis for industrial clients.",
      },
    ],
    achievements: ["Energy Club Secretary"],
    status: "Active",
  },
  {
    name: "Meera Krishnan",
    email: "meera.krishnan@college.edu",
    phone: "+91 98765 43219",
    rollNumber: "CS21B010",
    branch: "Computer Science",
    year: 4,
    graduationYear: 2025,
    cgpa: 8.5,
    tenthPct: 94,
    twelfthPct: 90,
    skills: [
      { name: "Cybersecurity", level: 4 },
      { name: "Python", level: 4 },
      { name: "Linux", level: 4 },
      { name: "Networking", level: 4 },
      { name: "Java", level: 3 },
      { name: "Git", level: 3 },
    ],
    projects: [
      {
        title: "Network Intrusion Detection System",
        description:
          "ML-based IDS detecting anomalies in network traffic with 91% precision.",
        tech: ["Python", "Scikit-learn", "Wireshark"],
      },
      {
        title: "Secure Voting System",
        description:
          "Blockchain-based e-voting prototype ensuring voter anonymity and auditability.",
        tech: ["Solidity", "Web3.js", "React"],
      },
    ],
    certifications: [
      { name: "CompTIA Security+", issuer: "CompTIA", date: "2024-01" },
      { name: "Certified Ethical Hacker", issuer: "EC-Council", date: "2024-05" },
    ],
    internships: [
      {
        company: "TCS",
        role: "Cybersecurity Intern",
        duration: "2 months",
        description:
          "Conducted vulnerability assessments for banking clients.",
      },
    ],
    achievements: ["Finalist - National Cybersecurity Hackathon"],
    linkedinUrl: "https://linkedin.com/in/meerakrishnan",
    githubUrl: "https://github.com/meerakrishnan",
    status: "Active",
  },
];

async function main() {
  console.log("Seeding database...");
  // Wipe existing
  await db.analysis.deleteMany();
  await db.student.deleteMany();

  for (const s of sampleStudents) {
    await db.student.create({ data: studentInputToRecord(s) });
  }
  console.log(`Seeded ${sampleStudents.length} students.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
